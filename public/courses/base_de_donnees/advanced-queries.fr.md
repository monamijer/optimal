# Sous-requêtes, CTE et fonctions de fenêtrage

> Objectifs : répondre à des questions plus difficiles avec des sous-requêtes et des expressions de table commune, et calculer des classements et des valeurs cumulées avec des fonctions de fenêtrage.

## Sous-requêtes

Une **sous-requête** est une requête placée à l'intérieur d'une autre. Sous forme scalaire, elle produit une valeur à laquelle comparer. Quels produits coûtent plus cher que la moyenne ?

```sql
SELECT name
FROM products
WHERE price_cents > (SELECT avg(price_cents) FROM products)
ORDER BY name;
```

| name |
|---|
| Backpack |
| Headphones |
| Lamp |

Une sous-requête peut aussi renvoyer une liste pour `IN`, ou être testée avec `EXISTS`. Une sous-requête **corrélée** fait référence à la ligne externe et est évaluée pour chacune d'elles. Quels clients ont au moins une commande payée ?

```sql
SELECT c.name
FROM customers AS c
WHERE EXISTS (
    SELECT 1
    FROM orders AS o
    WHERE o.customer_id = c.id AND o.status = 'paid'
)
ORDER BY c.name;
```

Cette requête renvoie Amina, Chloé, Diego et Esther. `EXISTS` s'arrête à la première correspondance et ne multiplie jamais les lignes, ce qui en fait un cousin plus sûr de la jointure lorsque vous avez seulement besoin de savoir qu'une correspondance existe. `NOT EXISTS` est l'anti-jointure sous une autre forme.

Un avertissement : `NOT IN (subquery)` ne renvoie **rien** si la sous-requête produit un seul `NULL`, car la comparaison devient inconnue. Préférez `NOT EXISTS`.

## Expressions de table commune (CTE)

Une **CTE** donne un nom à une sous-requête avec `WITH`, de sorte qu'une requête complexe se lise de haut en bas, étape par étape. Combien chaque client a-t-il dépensé en commandes payées ?

```sql
WITH order_totals AS (
    SELECT o.id, o.customer_id,
           sum(oi.quantity * p.price_cents) AS total_cents
    FROM orders AS o
    JOIN order_items AS oi ON oi.order_id = o.id
    JOIN products AS p ON p.id = oi.product_id
    WHERE o.status = 'paid'
    GROUP BY o.id, o.customer_id
)
SELECT c.name,
       round(sum(t.total_cents) / 100.0, 2) AS spent
FROM order_totals AS t
JOIN customers AS c ON c.id = t.customer_id
GROUP BY c.id, c.name
ORDER BY spent DESC;
```

| name | spent |
|---|---|
| Esther | 58.00 |
| Amina | 51.60 |
| Diego | 21.00 |
| Chloé | 12.50 |

La première étape calcule une ligne par commande, **puis** la seconde étape regroupe par client. Agréger en deux temps est le remède habituel au piège du double comptage du chapitre sur les jointures.

Une CTE **récursive** fait référence à elle-même et sert aux hiérarchies (un organigramme, des catégories imbriquées) et à la génération de séries :

```sql
WITH RECURSIVE counter (n) AS (
    SELECT 1
    UNION ALL
    SELECT n + 1 FROM counter WHERE n < 5
)
SELECT n FROM counter;
```

Elle produit 1, 2, 3, 4, 5. Le premier `SELECT` est le point de départ, le second est le pas, et le `WHERE` est ce qui arrête la récursion. Oublier la condition d'arrêt provoque une boucle infinie.

## Fonctions de fenêtrage

`GROUP BY` regroupe les lignes. Une **fonction de fenêtrage** calcule une valeur sur un ensemble de lignes liées **sans** les regrouper : chaque ligne conserve son identité et gagne une nouvelle colonne. La fenêtre se décrit avec `OVER (...)` :

- `PARTITION BY` répartit les lignes en groupes indépendants (comme `GROUP BY`, mais les lignes subsistent) ;
- `ORDER BY` ordonne les lignes à l'intérieur de chaque partition.

Numérotez les commandes de chaque client dans l'ordre chronologique :

```sql
SELECT id, customer_id, ordered_at,
       row_number() OVER (PARTITION BY customer_id ORDER BY ordered_at) AS nth_order
FROM orders
ORDER BY customer_id, ordered_at;
```

| id | customer_id | ordered_at | nth_order |
|---|---|---|---|
| 1 | 1 | 2026-01-05 | 1 |
| 2 | 1 | 2026-02-11 | 2 |
| 3 | 2 | 2026-02-12 | 1 |
| 4 | 3 | 2026-03-01 | 1 |
| 5 | 3 | 2026-03-15 | 2 |
| 6 | 4 | 2026-03-20 | 1 |
| 7 | 5 | 2026-04-02 | 1 |

Classez les produits par prix au sein de leur catégorie avec `rank()` :

```sql
SELECT name, category, price_cents,
       rank() OVER (PARTITION BY category ORDER BY price_cents DESC) AS rank_in_category
FROM products
ORDER BY category, rank_in_category;
```

| name | category | price_cents | rank_in_category |
|---|---|---|---|
| Backpack | bags | 3900 | 1 |
| Headphones | electronics | 5900 | 1 |
| Lamp | home | 2500 | 1 |
| Mug | home | 800 | 2 |
| Notebook | stationery | 450 | 1 |
| Pen | stationery | 120 | 2 |

Les fonctions de classement les plus courantes :

| Fonction | Comportement en cas d'égalité |
|---|---|
| `row_number()` | toujours distinct : 1, 2, 3 |
| `rank()` | les ex æquo partagent un rang, puis un saut : 1, 1, 3 |
| `dense_rank()` | les ex æquo partagent un rang, sans saut : 1, 1, 2 |

`lag()` et `lead()` lisent la ligne précédente ou suivante. Le délai entre deux commandes consécutives d'un client ne demande rien de plus :

```sql
SELECT customer_id, id AS order_id, ordered_at,
       lag(ordered_at) OVER (PARTITION BY customer_id ORDER BY ordered_at) AS previous_order
FROM orders
ORDER BY customer_id, ordered_at;
```

Pour la première commande de chaque client, `previous_order` vaut `NULL`. Enfin, un agrégat utilisé comme fonction de fenêtrage donne des totaux cumulés :

```sql
SELECT ordered_at, id,
       count(*) OVER (ORDER BY ordered_at) AS orders_so_far
FROM orders
ORDER BY ordered_at;
```

La dernière colonne va de 1 à 7 : un décompte cumulé. Les fonctions de fenêtrage sont évaluées après `WHERE`, `GROUP BY` et `HAVING`, vous ne pouvez donc pas filtrer directement dessus. Pour garder « la première commande de chaque client », enveloppez la requête dans une CTE et filtrez sur `nth_order = 1`.

```sql
WITH numbered AS (
    SELECT id, customer_id, ordered_at,
           row_number() OVER (PARTITION BY customer_id ORDER BY ordered_at) AS nth_order
    FROM orders
)
SELECT id, customer_id, ordered_at
FROM numbered
WHERE nth_order = 1
ORDER BY customer_id;
```

## Pratique : requêtes avancées

Essayez-les dans l'éditeur sous chaque question. **Vérifier** compare votre résultat à celui attendu ; **Exécuter** montre seulement ce que renvoie votre requête.

```exercise
Listez les produits plus chers que le prix moyen de tous les produits. Deux colonnes : le nom et le prix en centimes, du plus cher au moins cher.
--- setup
@include sample.sql
--- starter
-- products(id, name, price_cents, category)
SELECT
--- solution
SELECT name, price_cents FROM products WHERE price_cents > (SELECT AVG(price_cents) FROM products) ORDER BY price_cents DESC;
--- hint
Une sous-requête scalaire peut calculer la moyenne dans le WHERE.
```

```exercise
Avec une CTE nommée `paid` qui garde les commandes payées, comptez combien de commandes payées a chaque client. Deux colonnes : le nom du client et le nombre, pour les clients qui en ont au moins une, par nom.
--- setup
@include sample.sql
--- starter
-- WITH paid AS (...)
WITH
--- solution
WITH paid AS (SELECT * FROM orders WHERE status = 'paid') SELECT c.name, COUNT(*) FROM customers c JOIN paid p ON p.customer_id = c.id GROUP BY c.id, c.name ORDER BY c.name;
--- hint
Définissez d'abord la CTE, puis joignez-la comme une table.
```

```exercise
Classez les produits par prix dans chaque catégorie, le plus cher en premier (rang 1). Trois colonnes : catégorie, nom du produit et rang. Utilisez une fonction de fenêtrage (`RANK() OVER (...)`) et triez par catégorie puis par rang.
--- setup
@include sample.sql
--- starter
-- products(id, name, price_cents, category)
SELECT
--- solution
SELECT category, name, RANK() OVER (PARTITION BY category ORDER BY price_cents DESC) AS price_rank FROM products ORDER BY category, price_rank, name;
--- hint
PARTITION BY category, ORDER BY price_cents DESC dans OVER (...).
```

## Points clés : sous-requêtes, CTE et fenêtrage

- Les sous-requêtes répondent à une question en fonction d'une autre ; préférez `EXISTS` à `IN` lorsque vous testez seulement l'existence, et `NOT EXISTS` à `NOT IN`.
- Une CTE (`WITH`) nomme une étape pour que les requêtes complexes se lisent dans l'ordre ; `WITH RECURSIVE` gère les hiérarchies.
- Les fonctions de fenêtrage ajoutent des calculs par ligne (rang, ligne précédente, totaux cumulés) sans regrouper les lignes.
- Pour filtrer sur une fonction de fenêtrage, calculez-la d'abord dans une CTE ou une sous-requête.

```quiz
Quelle est la différence entre GROUP BY et une fonction de fenêtrage comme `sum(x) OVER (PARTITION BY k)` ?
- [ ] Il n'y en a aucune
- [x] GROUP BY renvoie une ligne par groupe ; la fonction de fenêtrage conserve chaque ligne et ajoute la valeur du groupe comme colonne
- [ ] Les fonctions de fenêtrage ne s'utilisent que sur des nombres
> Les fonctions de fenêtrage calculent sur un ensemble de lignes sans les regrouper.
```

```quiz
Trois produits sont à égalité pour la première place par prix. Que donne `rank()` au produit suivant, moins cher ?
- [ ] 2
- [x] 4
- [ ] 1
> rank() laisse un saut après les ex æquo : 1, 1, 1, 4. dense_rank() donnerait 2.
```

```quiz
Une sous-requête utilisée dans `NOT IN (...)` produit un seul NULL. Que renvoie la requête ?
- [ ] Toutes les lignes
- [ ] Une erreur
- [x] Aucune ligne
> La comparaison devient inconnue pour chaque ligne, donc rien n'est renvoyé. Préférez `NOT EXISTS`.
```

```quiz
Que se passe-t-il si la partie récursive d'une CTE récursive n'a pas de condition d'arrêt ?
- [x] Elle récurse indéfiniment au lieu de s'arrêter
- [ ] Elle ne renvoie que la ligne de départ
- [ ] Elle renvoie un résultat vide
> Le WHERE de l'étape récursive est ce qui met fin à la récursion. Sans lui, la requête boucle sans fin.
```

```quiz
Comment ne garder que la première commande de chaque client avec `row_number() OVER (...)` ?
- [ ] Mettre `row_number() OVER (...) = 1` dans la clause WHERE
- [x] La calculer dans une CTE ou une sous-requête, puis filtrer `nth_order = 1` à l'extérieur
- [ ] La mettre dans la clause GROUP BY
> Les fonctions de fenêtre sont évaluées après WHERE, on ne peut donc pas filtrer dessus à cet endroit. Encadrez la requête et filtrez sur le résultat.
```
