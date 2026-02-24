import requests
from dotenv import load_dotenv
import os

load_dotenv()
language = "fr" # a update, a recuperer depuis le front et a stocker en base peut etre
# TODO: mettre en place un cron pour execute certaine tache chaque laps de temps

async def get_aliment_from_API(): # chaque semaine on fera un import, pour linstant cest a chaque fois qu'on lance le serveur
    print("GETTING ALIMENT FROM API")
    url = os.getenv('ALIMENT_API_URL')
    params = {
        "search_terms": "all",
        "lang": language,
        "json": 1
    }

    response = requests.get(url, params=params)

    if response.status_code == 200:
        data = response.json()
        print(data)
        if data["count"] > 0:
            for i, food in enumerate(data["products"], 1):
                serving_size = food.get('serving_size', 'Inconnu')
                serving_quantity = float(food.get('serving_quantity', 1))

                # product = {
                #     "name": food.get('product_name', 'Unknown'),
                #     "serving_size": serving_size,
                #     "serving_quantity": serving_quantity
                # }
                # print("product ", product)
        # if data["count"] > 0:
        #     return data["products"]
        # return []
