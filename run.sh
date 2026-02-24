#!/bin/bash

# 📌 Définition des chemins
FRONT_DIR="Front"
BACK_DIR="Back"

# 🏁 Fonction pour démarrer le Frontend (React Native avec Expo)
start_front() {
    echo "🚀 Démarrage du Frontend (React Native)..."
    cd "$FRONT_DIR" || exit
    npm install  # Installation des dépendances
    npm start    # Lancement d'Expo
}

# 🏁 Fonction pour démarrer le Backend (Python)
start_back() {
    echo "🚀 Démarrage du Backend (Python)..."
    cd "$BACK_DIR" || exit
    if [ -f "venv/bin/activate" ]; then
        source venv/bin/activate  # Activation de l'environnement virtuel
    else
        python3 -m venv venv && source venv/bin/activate  # Création + activation
    fi
    pip install -r requirements.txt  # Installation des dépendances
    python main.py  # Lancement du backend
}

# 🚀 Exécution des deux services en parallèle
(start_front &)
(start_back &)

# 🌟 Attendre que les processus terminent
wait
