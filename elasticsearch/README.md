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
 - `votes-parser.js` : mon module pour parser les votes. Clarifie `import.js` et garantie l'unicité du mapping et modèle de données.
 - `constants.js` : les constantes du projet (formats, nom de l'index, ...)
 - `import.js` : le fichier à lancer finalement.


Et évidemment, il faut le fichier de données à la racine (`/French_Presidential_Election_2017_First_Round.csv`). Il est trop lourd pour être importé sur Github.


Finalement, il suffit d'exécuter :

```bash
node import.js
```

Si vous avez le problème : `JavaScript heap out of memory`, c'est normal : le fichier est beaucoup plus gros que celui de 911 calls par exemple, on ne peut pas utiliser la même mécanique.

Les données sont importées, on peut alors le vérifier avec cette requête qui devrait donner `761805` :

```
GET fr_election_2017/_count
```



## Requêtes

À vous de jouer ! Écrivez les requêtes ElasticSearch permettant de résoudre les problèmes posés.

```
TODO : ajouter les requêtes ElasticSearch ici
```

## Kibana

Dans Kibana, créez un dashboard qui permet de visualiser :

* Une carte de l'ensemble des appels
* Un histogramme des appels répartis par catégories
* Un Pie chart réparti par bimestre, par catégories et par canton (township)

Pour nous permettre d'évaluer votre travail, ajoutez une capture d'écran du dashboard dans ce répertoire [images](images).

### Timelion
Timelion est un outil de visualisation des timeseries accessible via Kibana à l'aide du bouton : ![](images/timelion.png)

Réalisez le diagramme suivant :
![](images/timelion-chart.png)

Envoyer la réponse sous la forme de la requête Timelion ci-dessous:  

```
TODO : ajouter la requête Timelion ici
```
