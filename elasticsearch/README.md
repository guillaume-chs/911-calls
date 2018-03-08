# Frennch Election 2017, first round, avec ElasticSearch

# Import du jeu de données

Cette partie a fait l'objet de réflexions pour ma part.
Je ne voulais pas me limiter à un script à usage pour les raisons suivantes :
 - commenter la partie qui recrée l'indice déjà existant à chaque nouvel import ;
 - accepter l'erreur levée dans la console (index déjà existant...) ;
 - rajouter les données à l'index alors que nous voulons tout ré-importer.


Amoureux du JS, j'en ai profité pour m'amuser un peu autour d'un workflow intéressant avec une architecture basique.
4 fichiers :
 - `elastic-api.js` : mon module qui gère les interactions avec le driver d'elasticsearch. Il s'occupe des open/close du client, et surtout de l'ordre des workflows avec des `Promise`, pour s'assurer de l'ordre d'exécution. Par exemple : **checkExists** -> (**delete** -> **create**) ou **flush** :check:
 - `../votes-parser.js` : mon module pour parser les votes. Clarifie `import.js` et garantie l'unicité du mapping et modèle de données.
 - `../constants.js` : les constantes du projet (formats, nom de l'index, ...)
 - `../import.js` : le fichier à lancer finalement.


Et évidemment, il faut le fichier de données à la racine (`/French_Presidential_Election_2017_First_Round.csv`). Il est trop lourd pour être importé sur Github.


Finalement, il suffit d'exécuter :

```bash
node import.js --elastic
```

J'ai eu le problème : `JavaScript heap out of memory`, puis `Request Entity too large` côté ElasticSearch. C'est normal : le fichier est beaucoup plus gros que celui de 911 calls par exemple, on ne peut pas utiliser la même mécanique (191Mb).

Les données sont importées, on peut alors le vérifier avec cette requête qui devrait donner `761805` :

```
GET fr_election_2017/_count
```

-----

## Kibana

Nous allons faire un dashboard avec Kibana pour nous permettre de visualiser :
 
* les résultats de l'élection - ok
* la carte de l'abstention - Kibana me renvoie une erreur : Impossible de placer mes bureaux de votes sur la carte... (quelque soit le modèle de carte choisi)
* des charts de type "Top 3" (à toi de voir les données intéressantes)
  - Je propose un top 3 : score cumulé des mouvements politiques : "Gauche", "Droite", Autre. On est d'accord, c'est subjectif et réducteur. Je l'ai fait car :
     1. La DataViz est intéressante. Notamment les filtres assez macro qui monntre la force de classification de Kibana.
     2. Pour être plus objectif j'ai convenu de la répartition à partir d'un article France Bleu et de [cette image Radio France](https://goo.gl/images/Ae8ngW).

Les captures d'écrans sont disponibles dans le répertoire [images](images).

