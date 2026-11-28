# Le modèle relationnel

> Objectifs : lire une table comme un ensemble de lignes, et utiliser les clés primaires, les clés étrangères et les types de données pour décrire des relations.

## Tables, lignes et colonnes

Dans une base de données relationnelle, les données vivent dans des **tables**. Une table décrit un type d'objet, par exemple des clients. Chaque **colonne** est un attribut doté d'un nom et d'un type (`name`, `country`). Chaque **ligne** est une instance : un client.

| id | name | country |
|---|---|---|
| 1 | Amina | BI |
| 2 | Brian | KE |
| 3 | Chloé | FR |

Deux propriétés sont à retenir. Une table est un **ensemble** de lignes : elle n'a pas d'ordre propre, donc une requête qui a besoin d'un ordre doit le demander. Et chaque colonne a un **type**, que la base de données fait respecter.

## Les clés primaires

Une **clé primaire** est une colonne (ou un groupe de colonnes) dont la valeur identifie chaque ligne de façon unique. Elle ne peut jamais valoir `NULL` et ne se répète jamais. Ici, `id` est la clé primaire de `customers` : `id = 2` désigne exactement un client.

Utilisez une clé qui ne change jamais et ne porte aucun sens. Un nom ou un e-mail peut changer ou être partagé ; un numéro généré ne peut être confondu avec rien d'autre. On parle de **clé de substitution** (*surrogate key*).

## Clés étrangères et relations

Les tables sont reliées par des **clés étrangères** : une colonne d'une table qui contient la clé primaire d'une ligne d'une autre table. Dans notre boutique, chaque commande stocke l'`id` du client qui l'a passée :

```text
customers (1) ──────< orders (many)
    id  ◄───────────  customer_id
```

Une clé étrangère est plus qu'une convention. La base de données **refuse** d'insérer une commande dont le `customer_id` n'existe pas, et refuse de supprimer un client qui a encore des commandes, sauf décision contraire de votre part. Cette propriété s'appelle l'**intégrité référentielle**.

Il existe trois types de relations :

| Relation | Exemple | Comment elle est stockée |
|---|---|---|
| Un à plusieurs | un client, plusieurs commandes | clé étrangère du côté « plusieurs » (`orders.customer_id`) |
| Plusieurs à plusieurs | commandes et produits | une **table de jonction** contenant les deux clés (`order_items`) |
| Un à un | un utilisateur et son profil | clé étrangère qui est aussi unique |

Une commande contient plusieurs produits et un produit apparaît dans plusieurs commandes : c'est une relation plusieurs à plusieurs. On ne peut pas mettre une liste de produits dans une seule cellule, donc on crée la table de jonction `order_items`, avec une ligne par produit dans une commande. Sa clé primaire est le couple `(order_id, product_id)`.

## La base de données d'exemple

Le reste du cours utilise quatre tables :

```text
customers (id, name, country)
products (id, name, price_cents, category)
orders (id, customer_id → customers, ordered_at, status)
order_items (order_id → orders, product_id → products, quantity)
```

Les prix sont stockés en **centimes** entiers. Les nombres à virgule flottante ne peuvent pas représenter exactement la plupart des montants décimaux, donc l'argent est stocké soit en entiers (centimes), soit avec le type exact `numeric`.

## NULL : l'absence de valeur

`NULL` signifie « inconnu ou manquant ». Ce n'est ni zéro ni une chaîne vide. Son principal piège : toute comparaison avec `NULL` n'est ni vraie ni fausse mais **inconnue**, donc `NULL = NULL` n'est pas vrai. Pour le tester, SQL propose `IS NULL` et `IS NOT NULL`. Nous y reviendrons dans le chapitre suivant.

Déclarez une colonne `NOT NULL` chaque fois qu'une valeur est obligatoire : la base de données rejettera alors les lignes qui l'oublient.

## Types de données courants

| Type | Usage | Remarque |
|---|---|---|
| `integer`, `bigint` | nombres entiers | `bigint` pour les identifiants pouvant dépasser 2 milliards |
| `numeric(p, s)` | décimaux exacts | argent, mesures |
| `text`, `varchar(n)` | chaînes de caractères | dans PostgreSQL, `text` n'a pas de pénalité de performance |
| `boolean` | vrai ou faux | |
| `date`, `timestamp` | dates et heures | stockez `timestamptz` dans PostgreSQL pour gérer correctement les fuseaux horaires |

## Points clés : le modèle relationnel

- Les données sont stockées dans des tables de colonnes typées ; une table est un ensemble non ordonné de lignes.
- Une clé primaire identifie une ligne ; une clé étrangère pointe vers une ligne d'une autre table et est imposée par la base de données.
- Les relations plusieurs à plusieurs nécessitent une table de jonction.
- `NULL` signifie inconnu : testez-le avec `IS NULL`, jamais avec `=`.

```quiz
Comment stocker le fait qu'une commande contient plusieurs produits, et qu'un produit apparaît dans plusieurs commandes ?
- [ ] Une liste d'identifiants de produits séparés par des virgules dans la table orders
- [x] Une table de jonction avec une ligne par couple (commande, produit)
- [ ] Dupliquer la commande pour chaque produit
> Une relation plusieurs à plusieurs se modélise avec une table de jonction contenant deux clés étrangères.
```

```quiz
Que garantit une clé étrangère ?
- [ ] Que la colonne est plus rapide à parcourir
- [x] Que la valeur fait référence à une ligne existante de l'autre table
- [ ] Que la colonne n'est jamais NULL
> Intégrité référentielle : la base de données rejette les valeurs qui ne pointent vers rien.
```

```quiz
Quelle colonne est la meilleure clé primaire de la table `customers` ?
- [ ] L'e-mail du client
- [ ] Le nom du client
- [x] Un numéro généré sans signification
> Une clé de substitution ne change jamais et ne peut être confondue avec rien d'autre, alors qu'un nom ou un e-mail peut changer ou être partagé.
```

```quiz
À quoi vaut `NULL = NULL` ?
- [x] Inconnu (NULL), pas vrai
- [ ] Vrai
- [ ] Faux
> Une comparaison avec NULL donne inconnu. Pour tester une valeur manquante, on utilise `IS NULL`.
```
