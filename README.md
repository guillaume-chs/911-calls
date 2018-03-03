# French Presidential Election

**French Presidential Election** est un workshop dans lequel je vais manipuler le jeu de données du **premier tour** avec `Elasticsearch` et `MongoDB`.

## Pré requis

Je m'appuie sur les tutoriels suivants :

* [elasticsearch-101](https://github.com/nosql-bootcamp/elasticsearch-101)
* [elasticsearch-102](https://github.com/nosql-bootcamp/elasticsearch-102)
* [mongodb-101](https://github.com/nosql-bootcamp/mongodb-101)
* [mongodb-102](https://github.com/nosql-bootcamp/mongodb-102)

Mes versions de [Node.js](https://nodejs.org) et de [npm]() :

```bash
node -v
v9.5.0
```

```bash
npm -v
5.6.0
```

## Jeu de données

Le jeu de données utilisé est la liste des résultats des votes au 1er tour des élections présidentielles en France, en 2017.

Le fichier CSV des résultats des votes est disponible sur le site [Kaggle](https://www.kaggle.com/datasets) : https://www.kaggle.com/grishasizov/frenchpresidentialelection2017. La version utilisée ici est la [version 1](https://www.kaggle.com/grishasizov/frenchpresidentialelection2017/version/1) et une copie des données est disponible à la racine du repository (`French_Pres..._First_Round.csv`).

Extrait du jeu de données :

| Department code | Department | Constituency code | Constituency | Commune code | Commune | Polling Station | Registered | Abstentions | % Abs/Reg | Voters | % Vot/Reg | None of the above(NOTA) | % NOTA/Reg | % NOTA/Vot | Nulls | % Nulls/Reg  | % Nulls/Vot | Expressed | % Exp/Reg | % Exp/Vot | Signboard | Sex | Surname | First name | Voted | % Votes/Reg | % Votes/Exp | INSEE code | Coordinates | Polling station name | Address | Postal code | City | Poll.St-unique |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 3 | Allier | 2 | 2ème circonscription | 314 | Villebret | 0001 | 1037 | 179 | 17.26 | 858 | 82.74 | 22 | 2.12 | 2.56 | 0 | 0.0 | 0.0 | 836 | 80.62 | 97.44 | 11 | M | FILLON | François | 136 | 13.11 | 16.27 | 3314 | 46.264816, 2.639979 | Salle polyvalente | 58, rue de la Guette | 3310.0 | Villebret | Salle polyvalente - Villebret |
| 3 | Allier | 2 | 2ème circonscription | 315 | Villefranche-d'Allier | 0001 | 938 | 182 | 19.4 | 756 | 80.6 | 15 | 1.6 | 1.98 | 14 | 1.49 | 1.85 | 727 | 77.51 | 96.16 | 3 | M | MACRON | Emmanuel | 132 | 14.07 | 18.16 | 3315 | 46.397022, 2.856756 | Centre Espace | Rue des Fossés | 3430.0 | Villefranche-d'Allier | Centre Espace - Villefranche-d'Allier |


Analyse de la première ligne :

| Colonne           | Valeur                                               | Description               |
| ----------------- | ---------------------------------------------------- | ------------------------- |
| Department code   | 3                                                    | Numéro de département       |
| Department        | Allier                                               | Nom du département        |
| Constituency code | 2                                                    | Numéro de circonscription |
| Constituency      | 2ème circonscription                          | Libellé de la circonscription   |
| Commune code | 314                                               | Numéro de commune   |
| Commune  | Villebret                                          | Nom de la commune   |
| Polling Station  | 0001                                       | Référence du bureau de vote   |
| Registered  | 1037                                        | Nombre de citoyens enregistrés au bureau  |
| Abstentions  | 179                                      | Nombre d'abstenants parmis les citoyens enregistrés |
| % Abs/Reg  | 17.26                                        | Pourcentage d'absentention dans le bureau  |
| Voters  | 858                                                   | Nombre de votants dans le bureau |
| % Vot/Reg  | 82.74                                              | Pourcentage de votants parmis les citoyens enregistrés |
| None of the above(NOTA)  | 22                                 | Bulletins autres |
| % NOTA/Reg  | 2.12                                            | Pourcentage de bulletins autres parmis les citoyens enregistrés |
| % NOTA/Vot  | 2.56                                            | Pourcentage de bulletins autres parmis les votants |
| Nulls  | 0                                                    | Bulletins nuls |
| % Nulls/Reg  | 0                                              | Pourcentage de bulletins nuls parmis les citoyens enregistrés |
| % Nulls/Vot  | 0                                              | Pourcentage de bulletins nuls parmis les votes |
| Expressed  | 836                                                    | Bulletins nuls |
| % Exp/Reg  | 80.62                                              | Pourcentage de bulletins nuls parmis les citoyens enregistrés |
| % Exp/Vot  | 97.44                                              | Pourcentage de bulletins nuls parmis les votes |
| Signboard  | 11                                                 | Nombre de candidats affichés |
| Sex  | 11                                                     | Sexe du candidat comptabilisant le plus de vote |
| Surname  | FILLON                                             | Nom de famille du candidat comptabilisant le plus de vote |
| First name  | François                                        | Prénom de famille du candidat comptabilisant le plus de vote |
| Voted  | 136                                        | Nombre de voix pour reçues |
| % Votes/Reg  | 13.11                                        | Pourcentage de voix reçues parmis les citoyens enregistrés |
| % Votes/Exp  | 16.27                                        | Pourcentage de voix reçues parmis les votants |
| INSEE code  | 3314                                        | Code INSEE  du bureau de vote |
| Coordinates  | 46.264816, 2.639979                       | Coordonnnées GPS du bureau de vote |
| Polling station name  | Salle polyvalente                       | Nom du bureau de vote |
| Address  | 58, rue de la Guette                       | Rue et numéro du bureau de vote |
| Postal code  | 3310.0                                 | Code postal du bureau de vote |
| City  | Villebret                                    | Ville du bureau de vote |
| Poll.St-unique  | Salle polyvalente - Villebret      | Nom unique référençant le bureau de vote |



## Objectif

L'objectif est d'importer les données dans [ElasticSearch](./elasticsearch) et dans [MongoDB](./mongodb) et de construire un certain nombre de requêtes pour répondre aux besoins ci-dessous.

-----

### Trouver les 3 circonscriptions avec le plus d'abstention

Je considère que par "+ d'abstention", nous voulons nous intéresser au taux relatif plutôt qu'à la valeur numérique de l'abstention.

Dans un premier temps, il faut grouper en circonscriptions avec le champ `constituency code`, avant de trier les résultats en fonction du taux moyen d'abstention, obtenu avec `% Abs/Reg`.
Finalement, nous ne retiendrons que les 3 premiers résultats.

**Requête**

```
...
```

-----

### Trouver le score maximum de chaque candidat

Toutes circonscriptions confondues, nous cherchons le pourcentage de voix maximum en faveur de chaque candidat.
Il est intéressant de noter une pré-condition à cette objectif : chaque candidat apparaître au moins une fois, il doit pour cela être gagnant sur au moins un bureau de vote.

Pour aller plus loin, en conséquence du même principe des données que nous avons, calculer le score dans chaque circonscription serait une abhération. En effet, nous n'avons que le score du vainqueur de chaque bureau.

Je propose alors de chercher le score maximal de chaque candidat tout bureau de vote confondu.
Cet objectif simplifie le requête en enlevant le besoin d'agrégation sur les circonscriptions, mais :
 - cette difficulté trouve une réponse dans la première requête ci-dessus
 - nous évitons de ressortir une mauvaise information, sauf si l'objectif est d'illustrer comment un algorithme bienfaisant peut ressortir une information erronée à partir de données pourtant tout à fait honnêtes.

**Requête**

```
...
```

-----



- le score (pourcentage de voix) max de chaque candidat, toute circonscription confondue
- le score (pourcentage de voix) min de chaque candidat, toute circonscription confondue
- le nombre total de votants en France
- le nombre total de personnes ayant voté pour Jean LASSALLE
- la circonscription avec le moins d'inscrits
- toute autre stat que tu trouve intéressante de nous fourninr ! (par exemple : la circonscription où il y a le plus petit écart entre le premier et le dernier candidat)
