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
| Sex  | M                                                     | Sexe du candidat comptabilisant le plus de vote |
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


## Mon modèle de données

Pour [ElasticSearch](./elasticsearch) comme [MongoDB](./mongodb), on va apporter un peu de clarté :

```javascript
{
    geography: {
        department_code: data['Department code'],
        department_name: data['Department'],
        constituency_code: data['Constituency code'],
        constituency_name: data['Constituency'],
        commune_code: data['Commune code'],
        commune_name: data['Commune'],
        address: data['Address'],
        postcode: data['Postal code'],
        city: data['City'],
    },
    
    polling_station: {
        id: data['Polling station'],
        name: data['Polling station name'],
        insee: data['INSEE code'],
        unique: data['Poll.St.-unique'],
        coordinates: parseGeo(data['Coordinates']),
    },

    polling_data: {
        registered: data['Registered'],
        abstentions: data['Abstentions'],
        abstentions_ratio: data['% Abs/Reg'],
        
        voters: data['Voters'],
        voters_ratio: data['% Vot/Reg'],
        
        others: data['None of the above(NOTA)'],
        others_ratio_reg: data['% NOTA/Reg'],
        others_ratio_vot: data['% NOTA/Vot'],
        
        nulls: data['Nulls'],
        nulls_ratio_reg: data['% Nulls/Reg'],
        nulls_ratio_vot: data['% Nulls/Vot'],
        
        expressed: data['Expressed'],
        expressed_ratio_reg: data['% Exp/Reg'],
        expressed_ratio_vot: data['% Exp/Vot'],
    },
    
    winner: {
        signboard: data['Signboard'],
        sex: data['Sex'],
        surname: data['Surname'],
        firstname: data['First name'],
        
        votes: data['Voted'],
        votes_ratio_reg: data['% Votes/Reg'],
        votes_ratio_exp: data['% Votes/Exp'],
    }
}
```


## Objectif

L'objectif est d'importer les données dans [ElasticSearch](./elasticsearch) et dans [MongoDB](./mongodb) et de construire un certain nombre de requêtes pour répondre aux besoins ci-dessous.

-----

### Trouver les 3 circonscriptions avec le plus d'abstention

Je considère que par "+ d'abstention", nous voulons nous intéresser au taux relatif plutôt qu'à la valeur numérique de l'abstention.

Dans un premier temps, il faut grouper en circonscriptions avec le champ `constituency code` combiné avec `department code` : en effet, dans chaque département les circonscriptions se comptent à partir de `0001`.
Ensuite alors, nous pourrons trier les résultats en fonction du taux moyen d'abstention, obtenu avec `% Abs/Reg`.
Finalement, nous ne retiendrons que les 3 premiers résultats.

**Problèmes**

Je n'arrive pas à ressortir la **moyennne** des `abstentions_ratio` de l'agrégat double de `constituency_code` & `department_code`.
En SQL, j'aurai probablement résolu ce problème avec une jointure assez basique, mais après plusieurs de recherches et d'effeuillage de la doc ElasticSearch & forums, il me semble impossible de réaliser cet **agrégat multi-fields**.

Pour répondre à mon problème, la seule solution que j'ai trouvée était de faire un mapping composite `department_and_constituency` ; il s'agit d'indexer le produit cartésien des 2 colonnes pour requêter dessus.
Les développeurs Elasticsearch-js ne recommande cependant pas cette solution.

**Requête**

```json
POST /fr_election_2017/_search
{
  "size": 0,
  "aggs": {

    "constituency": {
      "terms": {
        "field": "geography.constituency_code.keyword"
      },

      "aggs": {

        "department": {
          "terms": {
            "field": "geography.department_code.keyword",
            "order": {
              "abs_ratio": "desc"
            },
            "size": 3
          },

          "aggs": {
            "abs_ratio": {
              "avg": {
                "field": "polling_data.abstentions_ratio"
              }
            }
          }
          
        }
      }
    }
  }
}
```

-----

### Trouver le score maximum de chaque candidat

Toutes circonscriptions confondues, nous cherchons le pourcentage de voix maximum en faveur de chaque candidat.

Face à toujours ce même problème de **double aggrégation** `constituency_code` & `department_code`, je propose alors de chercher le score maximal de chaque candidat par département.

Notons qu'il est obligatoire de préciser `"size": "11"` : la valeur par défaut est de 10, il y a 11 candidats.

**Requête**

```json
POST /fr_election_2017/_search
{ 
  "size": 0,
  "aggs": {
    "candidate": {
      "terms": {
        "field": "winner.signboard",
        "size": 11
      },
      "aggs": {
        "const": {
          "terms": {
            "field": "geography.department_code.keyword",
            "order": {
              "avg_votes": "desc"
            },
            "size": 1
          },
          "aggs": {
            "avg_votes": {
              "avg": {
                "field": "winner.votes_ratio_exp"
              }
            }
          }
        }
      }
    }
  }
}
```

**Analyse**

On retrouve les 5 candidats principaux : ils sont tous au-dessus de la barre des `25%` dans leur meilleur départment.
À l'inverse, les 6 autres candidats ne dépassent pas les `10%` au mieux.

-----

### Trouver le score minimal de chaque candidat

Sur le même principe que la requête juste avant : ici, il suffit de changer l'instruction `order` de `desc` pour `asc`.

**Requête**

```json
POST /fr_election_2017/_search
{ 
  "size": 0,
  "aggs": {
    "candidate": {
      "terms": {
        "field": "winner.signboard",
        "size": 11
      },
      "aggs": {
        "const": {
          "terms": {
            "field": "geography.department_code.keyword",
            "order": {
              "avg_votes": "asc"
            },
            "size": 1
          },
          "aggs": {
            "avg_votes": {
              "avg": {
                "field": "winner.votes_ratio_exp"
              }
            }
          }
        }
      }
    }
  }
}
```

**Analyse**

C'est encore plus intéressant : 2 candidats font plus de `10%` dans leur pire département ! Et il ne s'agit pas des deux vainqueurs :
 - E.Macron ;
 - F.Fillon, qui n'est pas allé au deuxième tour.

-----

### Trouver le nombre total de votants en France

Cette requête n'est pas aussi simple qu'il y a paraît : il faut faire attention à l'écueil d'aggréger bêtement toutes les lignes.

Nous allons aggréger par bureau de vote, et additionner à partir de là les votants de chaque bureau.

Pour utiliser `sum_bucket`, je dois faire une sous-aggrégation vers une **valeur unique** : c'est l'object de `nb_votes` qui retourne le maximum (qui est la même valeur que le minimum).

Enfin, `"size": 1000000` est ce qui me permet d'avoir tous les bureaux de votes de France.

**Requête**

```json
POST fr_election_2017/_search
{
  "size": 0,
  "aggs": {
    "voters": {
      "terms": {
        "field": "polling_station.unique.keyword",
        "size": 1000000
      },
      "aggs": {
        "nb_votes": {
          "max": {
            "field": "polling_data.voters"
          }
        }
      }
    },
    "sum": {
      "sum_bucket": {
        "buckets_path": "voters>nb_votes"
      }
    }
  }
}
```

**Analyse**

`25 313 045` de Français sont allés voter.
C'est intéressant de comparer avec les chiffres officiels du ministère de l'intérieur [ici](https://www.interieur.gouv.fr/Archives/Archives-elections/Election-presidentielle-2017/Election-presidentielle-2017-resultats-globaux-du-premier-tour). `36 058 813` de Français sont en fait allés s'exprimer.

-----

### Trouver le nombre total de personnes ayant voté pour Jean LASSALLE

On va utiliser la combinaison d'une `aggs` avec une `"query"`. Cette astuce nous permet de filtrer les résultats sur ceux de Jan LASSALLE : candidat numéro `8`.

**Requête**

```json
POST fr_election_2017/_search
{
  "query": {
    "match": {
      "winner.signboard": "8"
    }
  }, 
  "size": 0,
  "aggs": {
    "nb_votes": {
      "sum": {
        "field": "winner.votes"
      }
    }
  }
}
```

**Analyse**

`435 432` d'après ma requête contre les `435 365` du ministère : `67` votes en trop, c'est une erreur de `0.015%` par rapport aux [chiffres officiels](https://www.interieur.gouv.fr/Archives/Archives-elections/Election-presidentielle-2017/Election-presidentielle-2017-resultats-globaux-du-premier-tour), je peux être satisfait !

-----

### Trouver la circonscription avec le moins d'inscrits

Ici, on va travailler avec le `min` d'`aggs`.
Par rapport au problème récurrent qui me bloque depuis le début (double aggrégation), je dois faire une requête pas des plus jolies. Je suis bloqué par les sous-aggrégations.

**Requête**

```json
POST /fr_election_2017/_search
{
  "size": 0,
  "aggs": {
    "department": {
      "terms": {
        "field": "geography.department_code.keyword",
        "exclude": "ZZ", 
        "size": 120
      },
      "aggs": {
        "constituency": {
          "terms": {
            "field": "geography.constituency_code.keyword",
            "size": 1000
          },
          "aggs": {
            "pol_st": {
              "terms": {
                "field": "polling_station.unique.keyword",
                "size": 10000
              },
              "aggs": {
                "voters": {
                  "min": {
                    "field": "polling_data.registered"
                  }
                }
              }
            },
            "voters_const": {
              "sum_bucket": {
                "buckets_path": "pol_st>voters"
              }
            }
          }
        },
        "min_voters_const": {
          "min_bucket": {
            "buckets_path": "constituency>voters_const"
          }
        }
      }
    },
    "min_voters_in_dept": {
      "min_bucket": {
        "buckets_path": "department>min_voters_const"
      }
    }
  }
}
```

**Analyse**

Au résultat (après un certain temps de calcul... une dizaine de secondes), on apprend que la circonscription avec le moins d'inscrits se trouve en `2B`, en Corse !
Il suffit de relancer la requête précédante avec (pour fitrer) :

```json
  "department": {
    "terms": {
      "field": "geography.department_code.keyword",
      "include": "2B", 
      "size": 1
    }
  }
```

La circonscription avec le moins d'inscrits en France est la **2ème circonscription de Haute-Corse** avec 19 électeurs !

-----




- toute autre stat que tu trouve intéressante de nous fourninr ! (par exemple : la circonscription où il y a le plus petit écart entre le premier et le dernier candidat)
