import requests

def search_food(food_name):
    url = f"https://world.openfoodfacts.org/cgi/search.pl?search_terms={food_name}&json=1"
    response = requests.get(url)
    
    if response.status_code == 200:
        data = response.json()
        if data["count"] > 0:
            return data["products"]
    return []

def display_food_choices(foods):
    if not foods:
        return None
    
    print("Voici les différents types de l'aliment trouvés :")
    for i, food in enumerate(foods, 1):
        serving_size = food.get('serving_size', 'Inconnu')
        serving_quantity = float(food.get('serving_quantity', 1))
        print(f"{i}. {food['product_name']} - {serving_size} ({serving_quantity}g)")
    
    choice = int(input("Quel produit voulez-vous afficher ? "))
    if 1 <= choice <= len(foods):
        return foods[choice - 1]
    else:
        print("Choix invalide.")
        return None

def display_food_info(food_info):
    if food_info:
        print(food_info['nutriments'])
        weight = float(input(f"Quel est le poids en grammes de la portion que vous voulez ? "))
        
        print("\nMacronutriments pour {weight}g :".format(weight=weight))
        
        # Récupération des valeurs des macros et de leur poids de référence
        energy_kcal_100g = food_info['nutriments'].get('energy-kcal_100g', 0)
        proteins_per_100g = food_info['nutriments'].get('proteins_100g', 0)
        carbs_per_100g = food_info['nutriments'].get('carbohydrates_100g', 0)
        sugar_per_100g = food_info['nutriments'].get('sugars_100g', 0)
        lipids_per_100g = food_info['nutriments'].get('fat_100g', 0)
        saturated_fat_per_100g = food_info['nutriments'].get('saturated-fat_100g', 0)
        fiber_per_100g = food_info['nutriments'].get('fiber_100g', 0)
        salt_per_100g = food_info['nutriments'].get('salt_100g', 0)

        image_url = food_info.get("image_url")
        if image_url:
            print(f"\nImage de l'aliment : {image_url}")
        else:
            print("\nAucune image disponible pour cet aliment.")
        
        print(f"Energie : {(energy_kcal_100g * weight / 100):.2f}kcal")
        print(f"Protéines : {(proteins_per_100g * weight / 100):.2f}g")
        print(f"Glucides : {(carbs_per_100g * weight / 100):.2f}g")
        print(f"Sucre : {(sugar_per_100g * weight / 100):.2f}g")
        print(f"Lipides : {(lipids_per_100g * weight / 100):.2f}g")
        print(f"Acides gras saturés : {(saturated_fat_per_100g * weight / 100):.2f}g")
        print(f"Fibres : {(fiber_per_100g * weight / 100):.2f}g")
        print(f"Sel : {(salt_per_100g * weight / 100):.2f}g")
    else:
        print("Désolé, aucun aliment n'a été trouvé.")

if __name__ == "__main__":
    food_name = input("Quel aliment voulez-vous rechercher ? ")
    food_choices = search_food(food_name)
    chosen_food = display_food_choices(food_choices)
    display_food_info(chosen_food)