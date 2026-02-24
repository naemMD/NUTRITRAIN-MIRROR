rayan et evan, si vous voulez lancer, installez :

    python (si vous l'avez pas)
    dbeaver (ou un autre gestionnaire de bdd)

    faites "source venv/bin/activate"
    et faites : pip install -r requirements.txt (ca installera tout ce dont on a besoin et qui est dans le .txt)

vous pouvez run avec
    sudo systemctl stop mysql a la racine
    docker compose up --build a la racine

A PAS OUBLIER !! :
ya un fichier example.env,
copier ce qui y a dedans et coller le dans un fichier ".env"
que vous allez créer a la racine du dossier back
dans le host vous mettez votre adresse IP et dans le PORT mettez par exemple 8080
et oubliez pas de mettre la meme adresse ip dans le fichier app.config.js dans le front
