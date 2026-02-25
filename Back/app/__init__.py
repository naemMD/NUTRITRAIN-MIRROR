from fastapi import FastAPI
from sqlalchemy.ext.asyncio import AsyncSession
from app.routes import router
from app.database import engine, Base
from app.database import get_session
from app.model import *
from app.API.ApiController import get_aliment_from_API 
from fastapi.middleware.cors import CORSMiddleware

# async def populate_database():
#     async for session in get_session():
        # await populate_aliment_formats(session)
        # aliments = await get_aliment_from_API()
        # print ("voici les aliments trouvés", aliments)


async def init_models():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        # la fonction create all elle cree les models du fichier "models.py"

def create_app(): 
    app = FastAPI()

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.on_event("startup")
    async def on_startup():
        await init_models()
        # await populate_database()
    
    app.include_router(router)

    return app