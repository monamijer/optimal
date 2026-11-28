# Pourquoi les bases de données existent

> Objectifs : expliquer ce que sont une base de données et un SGBD, pourquoi les fichiers ne suffisent pas, et comment ce cours est organisé.

## Des fichiers aux bases de données

Imaginez que vous stockiez les clients d'une boutique dans un tableur ou un fichier texte. Cela fonctionne au début. Puis les problèmes apparaissent :

- deux personnes modifient le fichier en même temps et l'une des modifications est perdue ;
- le même client est saisi deux fois, avec deux orthographes différentes ;
- trouver « toutes les commandes du Burundi en mars » oblige à lire tout le fichier ;
- le programme plante au milieu d'une mise à jour et le fichier reste à moitié écrit.

Une **base de données** est un ensemble organisé de données. Un **système de gestion de base de données** (SGBD) est le logiciel qui les stocke et répond aux questions à leur sujet, et qui résout pour vous les problèmes ci-dessus : accès concurrents, cohérence, recherche rapide et reprise après panne.

## Les types de bases de données

| Famille | Les données sont stockées sous forme de | Exemples | Point fort |
|---|---|---|---|
| Relationnelle | tables de lignes et de colonnes | PostgreSQL, MySQL, SQLite | données structurées, forte cohérence, requêtes complexes |
| Documents | documents de type JSON | MongoDB | enregistrements flexibles et imbriqués |
| Clé-valeur | une clé et une valeur opaque | Redis | cache, sessions, recherches très rapides |
| Graphe | nœuds et relations | Neo4j | données très interconnectées |

Les bases de données relationnelles sont le choix par défaut pour la plupart des applications, et elles font l'objet de ce cours. Leur langage de requête, le **SQL**, a plus de cinquante ans et reste le moyen le plus répandu de dialoguer avec des données.

## PostgreSQL, MySQL et SQLite

Les trois sont relationnels et comprennent le SQL, avec de petites différences de dialecte :

- **PostgreSQL** : open source, très respectueux des standards, riche en fonctionnalités. C'est la référence de ce cours.
- **MySQL** : open source, très populaire pour les applications web.
- **SQLite** : une base de données dans un seul fichier, sans serveur, intégrée aux téléphones et aux navigateurs. Pratique pour apprendre.

Presque tout ce cours fonctionne sur les trois. Lorsqu'un point est propre à PostgreSQL, le chapitre le précise.

## Comment ce cours est organisé

1. **Le modèle relationnel** : tables, clés et relations.
2. **Interroger avec SQL** : `SELECT`, filtrage, regroupement.
3. **Joindre des tables** : combiner les données de plusieurs tables.
4. **Modifier les données et la structure** : `INSERT`, `UPDATE`, `DELETE`, contraintes.
5. **Normalisation** : concevoir des tables qui évitent la duplication.
6. **Index et plans d'exécution** : rendre les requêtes rapides.
7. **Transactions et ACID** : garder des données correctes malgré la concurrence.
8. **Sous-requêtes, CTE et fonctions de fenêtrage** : exprimer des questions plus difficiles.

Tous les exemples utilisent la même petite base de données de boutique en ligne, présentée dans le chapitre sur l'interrogation. Vous pouvez coller chaque exemple dans PostgreSQL ou SQLite et obtenir les mêmes résultats.

## Points clés : introduction

- Un SGBD ajoute à un simple stockage de données la cohérence, le contrôle de la concurrence, la recherche rapide et la reprise après panne.
- Les bases de données relationnelles stockent les données dans des tables et s'interrogent avec le SQL.
- PostgreSQL est la référence de ce cours ; l'essentiel du SQL est portable.

```quiz
Quel est le rôle principal d'un SGBD par rapport à un simple fichier ?
- [ ] Il rend les données plus petites
- [x] Il gère les accès concurrents, la cohérence, la recherche rapide et la reprise après panne
- [ ] Il dispense de concevoir les données
> Un fichier ne stocke que des octets. Un SGBD garantit des règles sur les données et répond efficacement aux requêtes.
```

```quiz
Laquelle de ces bases est une base de données relationnelle ?
- [ ] Redis
- [x] PostgreSQL
- [ ] Neo4j
> PostgreSQL stocke les données dans des tables et utilise le SQL. Redis est de type clé-valeur et Neo4j est une base de données orientée graphe.
```

```quiz
Quel type de base de données convient à un cache de sessions utilisateur qui demande des recherches très rapides par clé ?
- [ ] Graphe
- [x] Clé-valeur
- [ ] Document
> Les bases clé-valeur comme Redis stockent une clé et une valeur opaque, ce qui les rend idéales pour le cache et les sessions.
```

```quiz
Quelle affirmation sur SQLite est correcte ?
- [x] C'est une base stockée dans un seul fichier, sans serveur
- [ ] C'est une base documentaire comme MongoDB
- [ ] Elle ne comprend pas le SQL
> SQLite est une base relationnelle contenue dans un seul fichier, sans serveur, ce qui la rend pratique pour apprendre.
```
