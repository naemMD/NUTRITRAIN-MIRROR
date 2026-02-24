from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import relationship, selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.schemas import *
from sqlalchemy import select, func, asc, update, and_
from fastapi import HTTPException, status
from fastapi.responses import JSONResponse
from app.middleware import create_access_token
from datetime import datetime, date, timedelta
from datetime import datetime, date
import secrets, json

async def get_user_by_id(session: AsyncSession, user_id):
    result = await session.execute(
        select(Users).where(Users.id == user_id)
    )
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "id": user.id,
            "email": user.email,
            "firstname": user.firstname,
            "lastname": user.lastname,
            "gender": user.gender,
            "age": user.age,
            "role": user.role,
            "nationality": user.nationality,
            "language": user.language,
            "coach_id": user.coach_id,
            "unique_code": user.unique_code,
            "created_at": str(user.created_at)
        }
    )

async def register_user(session: AsyncSession, user_data: dict):
    try:
        user_data['age'] = int(user_data['age'])
    except ValueError:
        raise HTTPException(status_code=400, detail="The age field must be a valid integer.")

    stmt = select(Users).where(Users.email == user_data["email"])
    result = await session.execute(stmt)
    existing_user = result.scalar_one_or_none()

    if existing_user:
        raise HTTPException(status_code=409, detail="Email already registered. Please use a different email address.")

    random_digits = secrets.randbelow(1000000)
    generated_code = f"#{random_digits:06d}"

    new_user = Users(
        firstname=user_data["firstname"],
        lastname=user_data["lastname"],
        gender=user_data["gender"],
        email=user_data["email"],
        age=user_data["age"],
        role=user_data["role"],
        nationality=user_data.get("nationality"),
        language=user_data.get("language"),
        coach_id=user_data.get("coach_id"),
        unique_code=generated_code
    )

    new_user.password = user_data["password"]

    try:
        session.add(new_user)
        await session.commit()
        await session.refresh(new_user)

        token_payload = {
            "userId": str(new_user.id),
            "email": new_user.email,
            "role": new_user.role
        }
        
        access_token = create_access_token(token_payload)

        return JSONResponse(
            status_code=201,
            content={
                "message": "User registered successfully",
                "access_token": access_token,
                "token_type": "bearer",
                "user": {
                    "id": new_user.id,
                    "firstname": new_user.firstname,
                    "role": new_user.role,
                    "unique_code": new_user.unique_code
                }
            }
        )

    except IntegrityError as e:
        await session.rollback()
        print(f"Erreur inattendue DB: {e}")
        raise HTTPException(status_code=500, detail="Une erreur est survenue lors de la création du compte. Veuillez réessayer.")

async def create_meal(session: AsyncSession, user_id: int, meal_data: dict):
    aliments_data = meal_data.get('aliments')
    if isinstance(aliments_data, (list, dict)):
        aliments_json = json.dumps(aliments_data)
    else:
        aliments_json = aliments_data

    new_meal = Meal(
        user_id=user_id,
        name=meal_data['name'],
        description=meal_data.get('description'),
        total_calories=meal_data['total_calories'],
        total_proteins=meal_data['total_proteins'],
        total_carbohydrates=meal_data['total_carbohydrates'],
        total_sugars=meal_data['total_sugars'],
        total_lipids=meal_data['total_lipids'],
        total_saturated_fats=meal_data['total_saturated_fats'],
        total_fiber=meal_data['total_fiber'],
        total_salt=meal_data['total_salt'],
        
        aliments=aliments_json,
        
        meal_type=meal_data.get('meal_type'),
        hourtime=datetime.fromisoformat(meal_data['hourtime'].replace("Z", "+00:00")),
        
        is_consumed=meal_data.get('is_consumed', False)
    )

    session.add(new_meal)
    await session.commit()
    await session.refresh(new_meal)
    return new_meal
    
    try:
        session.add(new_meal)
        await session.commit()
        await session.refresh(new_meal)
        return JSONResponse( #return 201 quand cest bon
            status_code=status.HTTP_201_CREATED,
            content={"message": "Meal created successfully!"}
        )
    except IntegrityError as e:
        await session.rollback()
        print("erreur d'intégrité") #return 500 quand erreur
        raise HTTPException(status_code=500, detail="Integrity error occurred.")

async def delete_meal(session: AsyncSession, meal_id):
    result = await session.execute(
        select(Meal).where(Meal.id == meal_id)
    )
    meal = result.scalars().first()
    
    if not meal:
        raise HTTPException(status_code=404, detail="Meal not found.")
    
    await session.delete(meal)
    await session.commit()
    
    return {"message": "Meal deleted successfully"}

async def login_user(session: AsyncSession, user_data: dict):
    result = await session.execute(
        select(Users).where(
            (Users.email == user_data['email'])
        )
    )
    user = result.scalars().first()

    if not user:
        raise HTTPException(404, "User not found.")

    if not user.verify_password(user_data['password']):
        raise HTTPException(401, "Invalid password.")

    token_payload = {
        "userId": str(user.id),
        "email": user.email,
        "role": user.role
    }
    
    access_token = create_access_token(token_payload)

    return JSONResponse(
        status_code=200,
        content={
            "message": "Login successful!",
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "firstname": user.firstname,
                "lastname": user.lastname,
                "email": user.email,
                "role": user.role,
                "age": user.age,
                "language": user.language
            }
        }
    )

async def update_meal(session, meal_id, meal_data):
    if 'hourtime' in meal_data and isinstance(meal_data['hourtime'], str):
        clean_date = meal_data['hourtime'].replace('Z', '+00:00')
        meal_data['hourtime'] = datetime.fromisoformat(clean_date)
    
    meal_data.pop('total_fats', None) 
    
    if 'total_fibers' in meal_data:
        meal_data['total_fiber'] = meal_data.pop('total_fibers')

    stmt = (
        update(Meal)
        .where(Meal.id == meal_id)
        .values(**meal_data)
        .execution_options(synchronize_session="fetch")
    )
    
    await session.execute(stmt)
    await session.commit()
    
    return {"message": "Meal updated successfully"}

async def get_meals_by_user(session: AsyncSession, user_id: int):
    today = date.today()

    result = await session.execute(
        select(Meal)
        .where(
            (Meal.user_id == user_id) & 
            (func.date(Meal.hourtime) == today)
        )
        .order_by(Meal.hourtime.asc())
    )
    
    meals = result.scalars().all()
    
    meal_list = []
    for meal in meals:
        meal_list.append({
            "id": meal.id,
            "user_id": meal.user_id,
            "name": meal.name,       
            "hourtime": meal.hourtime.isoformat(),
            "total_calories": meal.total_calories,
            "total_proteins": meal.total_proteins,
            "total_carbohydrates": meal.total_carbohydrates,
            "total_sugars": meal.total_sugars,
            "total_lipids": meal.total_lipids,
            "total_saturated_fats": meal.total_saturated_fats,
            "total_fiber": meal.total_fiber,
            "total_salt": meal.total_salt,
            "aliments": meal.aliments 
        })
    
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={"meals": meal_list}
    )

async def get_all_coaches(session: AsyncSession):
    """Récupère tous les utilisateurs avec le rôle 'coach'."""
    result = await session.execute(
        select(Users).where(Users.role == 'coach')
    )
    coaches = result.scalars().all()
    
    return [
        {
            "id": coach.id,
            "firstname": coach.firstname,
            "lastname": coach.lastname,
            "email": coach.email,
            "gender": coach.gender,
            "age": coach.age,
            "speciality": "General" # Champ fictif si pas en BDD, ou à adapter
        }
        for coach in coaches
    ]

async def assign_coach_to_client(session: AsyncSession, client_id: int, coach_id: int):
    """Assigne un coach à un client."""
    # Vérifier si le client existe
    client_result = await session.execute(select(Users).where(Users.id == client_id))
    client = client_result.scalars().first()
    
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
        
    # Vérifier si le coach existe
    coach_result = await session.execute(select(Users).where(Users.id == coach_id))
    coach = coach_result.scalars().first()
    
    if not coach or coach.role != 'coach':
        raise HTTPException(status_code=400, detail="Invalid coach ID")

    # Mise à jour
    client.coach_id = coach_id
    try:
        await session.commit()
        return {"message": "Coach assigned successfully", "coach": f"{coach.firstname} {coach.lastname}"}
    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=500, detail=str(e))

async def get_clients_by_coach_id(session: AsyncSession, coach_id: int):
    """Récupère la liste des clients assignés à un coach."""
    result = await session.execute(
        select(Users).where(Users.coach_id == coach_id)
    )
    clients = result.scalars().all()
    
    return [
        {
            "id": client.id,
            "firstname": client.firstname,
            "lastname": client.lastname,
            "age": client.age,
            "gender": client.gender,
            "email": client.email,
            "goal": client.daily_caloric_needs or 2000 # Valeur par défaut si null
        }
        for client in clients
    ]

async def get_coach_dashboard_stats(session: AsyncSession, coach_id: int):
    today = date.today()
    
    clients_result = await session.execute(select(Users).where(Users.coach_id == coach_id))
    clients = clients_result.scalars().all()
    
    dashboard_data = []
    
    for client in clients:
        meals_result = await session.execute(
            select(func.sum(Meal.total_calories))
            .where(
                and_(
                    Meal.user_id == client.id,
                    func.date(Meal.hourtime) == today
                )
            )
        )
        total_calories_today = meals_result.scalar() or 0
        
        target = client.daily_caloric_needs or 2000
        
        dashboard_data.append({
            "client_id": client.id,
            "client_name": f"{client.firstname} {client.lastname}",
            "client_avatar": None,
            "calories_consumed": round(total_calories_today),
            "calories_goal": target,
            "progress_percent": min(round((total_calories_today / target) * 100), 100) if target > 0 else 0,
            "status": "on_track" if total_calories_today <= target else "over"
        })
        
    return dashboard_data

async def assign_client_by_code(session: AsyncSession, coach_id: int, unique_code: str):
    result = await session.execute(select(Users).where(Users.unique_code == unique_code))
    client = result.scalars().first()
    
    if not client:
        raise HTTPException(status_code=404, detail="Code invalide. Aucun utilisateur trouvé.")

    if client.id == coach_id:
        raise HTTPException(status_code=400, detail="Vous ne pouvez pas vous ajouter vous-même.")

    coach_result = await session.execute(select(Users).where(Users.id == coach_id))
    coach = coach_result.scalars().first()
    
    if not coach or coach.role != 'coach':
        raise HTTPException(status_code=400, detail="Coach invalide.")

    client.coach_id = coach_id
    
    try:
        await session.commit()
        return {
            "message": "Client ajouté avec succès", 
            "client": {
                "firstname": client.firstname,
                "lastname": client.lastname
            }
        }
    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=500, detail=str(e))

async def unassign_client(session: AsyncSession, coach_id: int, client_id: int):
    
    result = await session.execute(
        select(Users).where(and_(Users.id == client_id, Users.coach_id == coach_id))
    )
    client = result.scalars().first()
    
    if not client:
        raise HTTPException(
            status_code=404, 
            detail="Client not found or not assigned to this coach."
        )

    client.coach_id = None
    
    try:
        await session.commit()
        return {"message": "Client unassigned successfully"}
    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=500, detail="Database error during unassignment.")
    
async def get_client_details(session: AsyncSession, client_id: int):
    today = date.today()
    
    user_result = await session.execute(select(Users).where(Users.id == client_id))
    client = user_result.scalars().first()
    
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    stats_result = await session.execute(
        select(
            func.sum(Meal.total_calories),
            func.sum(Meal.total_proteins),
            func.sum(Meal.total_carbohydrates),
            func.sum(Meal.total_lipids)
        ).where(and_(Meal.user_id == client.id, func.date(Meal.hourtime) == today))
    )
    
    total_cals, total_prot, total_carbs, total_fat = stats_result.one()

    total_cals = total_cals or 0
    total_prot = total_prot or 0
    total_carbs = total_carbs or 0
    total_fat = total_fat or 0

    goal_cals = client.daily_caloric_needs or 2000
    goal_prot = (goal_cals * 0.25) / 4
    goal_carbs = (goal_cals * 0.50) / 4
    goal_fat = (goal_cals * 0.25) / 9

    return {
        "id": client.id,
        "firstname": client.firstname,
        "lastname": client.lastname,
        "age": client.age,
        "gender": client.gender,
        "goal_calories": round(goal_cals),
        "today_stats": {
            "calories": round(total_cals),
            "proteins": round(total_prot),
            "carbs": round(total_carbs),
            "fats": round(total_fat)
        },
        "goals_macros": {
            "proteins": round(goal_prot),
            "carbs": round(goal_carbs),
            "fats": round(goal_fat)
        }
    }

async def get_coach_home_summary(session: AsyncSession, coach_id: int):
    today = date.today()
    yesterday = today - timedelta(days=1)

    res_total = await session.execute(
        select(func.count(Users.id)).where(Users.coach_id == coach_id)
    )
    total_clients = res_total.scalar() or 0

    res_active = await session.execute(
        select(func.count(func.distinct(Users.id)))
        .join(Meal, Users.id == Meal.user_id)
        .where(and_(Users.coach_id == coach_id, func.date(Meal.hourtime) == today))
    )
    active_today = res_active.scalar() or 0

    res_clients = await session.execute(select(Users).where(Users.coach_id == coach_id))
    clients = res_clients.scalars().all()

    alerts = []
    top_performers = []

    for client in clients:
        res_cals = await session.execute(
            select(func.sum(Meal.total_calories))
            .where(and_(Meal.user_id == client.id, func.date(Meal.hourtime) == yesterday))
        )
        yesterday_cals = res_cals.scalar() or 0
        yesterday_cals = round(yesterday_cals)

        goal = client.daily_caloric_needs or 2000
        
        issue = None
        if yesterday_cals == 0:
            issue = "Did not log meals yesterday"
        elif yesterday_cals < 800:
            issue = "Severe deficit (< 800kcal)"
        elif yesterday_cals > (goal + 500):
            diff = yesterday_cals - goal
            issue = f"Excess (+{int(diff)} kcal)"
        
        if issue:
            alerts.append({
                "id": client.id,
                "name": f"{client.firstname} {client.lastname}",
                "issue": issue,
                "value": yesterday_cals,
                "goal": goal
            })
        
        else:
            lower_bound = goal * 0.9
            upper_bound = goal * 1.1
            
            if lower_bound <= yesterday_cals <= upper_bound:
                diff_percent = abs(1 - (yesterday_cals / goal)) * 100
                score_label = "Perfect" if diff_percent < 2 else "On Track"
                
                top_performers.append({
                    "id": client.id,
                    "name": f"{client.firstname} {client.lastname}",
                    "score": score_label,
                    "value": yesterday_cals,
                    "goal": goal,
                    "diff_percent": diff_percent
                })

    top_performers.sort(key=lambda x: x["diff_percent"])
    top_performers = top_performers[:3]

    return {
        "kpi": {
            "total_clients": total_clients,
            "active_today": active_today
        },
        "alerts": alerts,
        "top_performers": top_performers
    }

async def unassign_my_coach(session: AsyncSession, user_id: int):
    result = await session.execute(select(Users).where(Users.id == user_id))
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if user.coach_id is None:
        raise HTTPException(status_code=400, detail="You don't have a coach assigned")
        
    user.coach_id = None
    
    try:
        await session.commit()
        return {"message": "You have left your coach"}
    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    
async def create_full_workout(session: AsyncSession, user_id: int, workout_data: WorkoutCreate):
    try:
        new_workout = Workout(
            user_id=user_id,
            name=workout_data.name,
            description=workout_data.description,
            difficulty=workout_data.difficulty,
            scheduled_date=workout_data.scheduled_date
        )
        session.add(new_workout)
        
        await session.flush() 

        for exo in workout_data.exercises:
            new_exercise = WorkoutExercise(
                workout_id=new_workout.id,
                name=exo.name,
                muscle=exo.muscle,
                num_sets=exo.num_sets,
                reps=exo.reps,
                weight=exo.weight,
                rest_time=exo.rest_time
            )
            session.add(new_exercise)

        await session.commit()
        
        return JSONResponse(
            status_code=status.HTTP_201_CREATED, 
            content={"message": "Workout scheduled successfully", "workout_id": new_workout.id}
        )

    except Exception as e:
        await session.rollback()
        print(f"Error creating workout: {e}")
        raise HTTPException(status_code=500, detail="Could not save workout.")

async def get_user_workouts(session: AsyncSession, user_id: int):
    try:
        stmt = select(Workout)\
            .where(Workout.user_id == user_id)\
            .options(selectinload(Workout.exercises))\
            .order_by(Workout.scheduled_date.asc())
        
        result = await session.execute(stmt)
        workouts = result.scalars().all()
        return workouts
        
    except Exception as e:
        print(f"Error fetching workouts: {e}")
        raise HTTPException(status_code=500, detail="Could not fetch workouts.")