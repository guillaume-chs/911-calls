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

J'ai eu le problème : `JavaScript heap out of memory`, puis `Request Entity too large` côté ElasticSearch. C'est normal : le fichier est beaucoup plus gros que celui de 911 calls par exemple, on ne peut pas utiliser la même mécanique (191Mb).

Les données sont importées, on peut alors le vérifier avec cette requête qui devrait donner `761805` :

```
GET fr_election_2017/_count
```



## Requêtes

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

## Kibana

Nous allons faire un dashboard avec Kibana pour nous permettre de visualiser :
 
* les résultats de l'élection
* la carte de l'abstention
* des charts de type "Top 3" (à toi de voir les données intéressantes)

Les captures d'écrans sont disponibles dans le répertoire [images](images).

