# Interroger avec SQL

> Objectifs : créer la base de données d'exemple, puis lire les données avec `SELECT`, les filtrer, les trier et les résumer avec des agrégats et `GROUP BY`.

## Mettre en place la base de données d'exemple

Collez ce script dans PostgreSQL (`psql`) ou SQLite pour créer les quatre tables et les remplir. Tous les exemples du cours s'exécutent sur cette base.

```sql
CREATE TABLE customers (
    id      integer PRIMARY KEY,
    name    text NOT NULL,
    country text NOT NULL
);

CREATE TABLE products (
    id          integer PRIMARY KEY,
    name        text NOT NULL,
    price_cents integer NOT NULL,
    category    text NOT NULL
);

CREATE TABLE orders (
    id          integer PRIMARY KEY,
    customer_id integer NOT NULL REFERENCES customers (id),
    ordered_at  date NOT NULL,
    status      text NOT NULL
);

CREATE TABLE order_items (
    order_id   integer NOT NULL REFERENCES orders (id),
    product_id integer NOT NULL REFERENCES products (id),
    quantity   integer NOT NULL,
    PRIMARY KEY (order_id, product_id)
);

INSERT INTO customers (id, name, country) VALUES
    (1, 'Amina',  'BI'),
    (2, 'Brian',  'KE'),
    (3, 'Chloé',  'FR'),
    (4, 'Diego',  'ES'),
    (5, 'Esther', 'BI'),
    (6, 'Farid',  'FR');

INSERT INTO products (id, name, price_cents, category) VALUES
    (1, 'Notebook',    450, 'stationery'),
    (2, 'Pen',         120, 'stationery'),
    (3, 'Backpack',   3900, 'bags'),
    (4, 'Lamp',       2500, 'home'),
    (5, 'Mug',         800, 'home'),
    (6, 'Headphones', 5900, 'electronics');

INSERT INTO orders (id, customer_id, ordered_at, status) VALUES
    (1, 1, '2026-01-05', 'paid'),
    (2, 1, '2026-02-11', 'paid'),
    (3, 2, '2026-02-12', 'shipped'),
    (4, 3, '2026-03-01', 'paid'),
    (5, 3, '2026-03-15', 'cancelled'),
    (6, 4, '2026-03-20', 'paid'),
    (7, 5, '2026-04-02', 'paid');

INSERT INTO order_items (order_id, product_id, quantity) VALUES
    (1, 1, 2), (1, 2, 3),
    (2, 3, 1),
    (3, 4, 1), (3, 5, 2),
    (4, 1, 1), (4, 5, 1),
    (5, 3, 1),
    (6, 2, 10), (6, 1, 2),
    (7, 4, 2), (7, 5, 1);
```

Nous avons six clients, six produits et sept commandes. Remarquez que le client Farid n'a jamais rien commandé, et que le produit Headphones n'a jamais été vendu. Ces cas limites rendent les exemples suivants plus intéressants.

## SELECT et WHERE

`SELECT` choisit les colonnes, `FROM` nomme la table, et `WHERE` ne garde que les lignes qui satisfont une condition.

```sql
SELECT name, country
FROM customers
WHERE country = 'BI'
ORDER BY name;
```

| name | country |
|---|---|
| Amina | BI |
| Esther | BI |

Les chaînes de caractères s'écrivent entre apostrophes ; les guillemets doubles servent aux identifiants. `ORDER BY` trie le résultat, par ordre croissant par défaut et décroissant avec `DESC`. Sans `ORDER BY`, l'ordre des lignes **n'est pas garanti**.

Les conditions se combinent avec `AND`, `OR` et `NOT`, et utilisent ces opérateurs :

| Opérateur | Signification | Exemple |
|---|---|---|
| `=`, `<>`, `<`, `>`, `<=`, `>=` | comparaison | `price_cents >= 800` |
| `BETWEEN a AND b` | intervalle inclusif | `price_cents BETWEEN 400 AND 1000` |
| `IN (...)` | l'une des valeurs d'une liste | `category IN ('home', 'bags')` |
| `LIKE` | motif : `%` pour n'importe quel texte, `_` pour un caractère | `name LIKE 'A%'` |
| `IS NULL` | valeur manquante | `shipped_at IS NULL` |

```sql
SELECT name, price_cents
FROM products
WHERE price_cents BETWEEN 400 AND 1000
ORDER BY price_cents;
```

| name | price_cents |
|---|---|
| Notebook | 450 |
| Mug | 800 |

## Colonnes calculées, alias et LIMIT

Une colonne de `SELECT` peut être une expression, et `AS` lui donne un nom. `LIMIT` ne garde que les premières lignes, ce qui est surtout utile avec `ORDER BY`.

```sql
SELECT name, round(price_cents / 100.0, 2) AS price
FROM products
WHERE category IN ('home', 'stationery')
ORDER BY price DESC
LIMIT 3;
```

| name | price |
|---|---|
| Lamp | 25.00 |
| Mug | 8.00 |
| Notebook | 4.50 |

`SELECT DISTINCT` supprime les lignes en double du résultat :

```sql
SELECT DISTINCT country
FROM customers
ORDER BY country;
```

## NULL dans les conditions

Comme une comparaison avec `NULL` n'est ni vraie ni fausse, `WHERE shipped_at = NULL` ne renvoie rien, même pour les lignes où `shipped_at` est manquant. Utilisez `IS NULL` :

```sql
SELECT NULL = NULL AS equals_null, NULL IS NULL AS is_null;
```

La première colonne vaut `NULL` (inconnu), la seconde est vraie. Un piège voisin : `WHERE x <> 5` écarte aussi les lignes où `x` vaut `NULL`.

## Fonctions d'agrégation

Les agrégats réduisent plusieurs lignes à une seule valeur : `count`, `sum`, `avg`, `min`, `max`.

```sql
SELECT count(*) AS orders_count,
       min(ordered_at) AS first_order,
       max(ordered_at) AS last_order
FROM orders;
```

| orders_count | first_order | last_order |
|---|---|---|
| 7 | 2026-01-05 | 2026-04-02 |

`count(*)` compte les lignes ; `count(column)` compte les lignes où la colonne n'est pas `NULL` ; `count(DISTINCT column)` compte les valeurs distinctes.

```sql
SELECT count(*) AS customers_count,
       count(DISTINCT country) AS countries
FROM customers;
```

## GROUP BY et HAVING

`GROUP BY` forme un groupe par valeur distincte et applique les agrégats à chaque groupe.

```sql
SELECT status, count(*) AS orders_count
FROM orders
GROUP BY status
ORDER BY orders_count DESC;
```

| status | orders_count |
|---|---|
| paid | 5 |
| shipped | 1 |
| cancelled | 1 |

Chaque colonne de `SELECT` doit soit figurer dans `GROUP BY`, soit se trouver dans un agrégat. Pour filtrer les **groupes**, utilisez `HAVING` ; `WHERE` filtre les lignes **avant** le regroupement.

```sql
SELECT customer_id, count(*) AS paid_orders
FROM orders
WHERE status = 'paid'
GROUP BY customer_id
HAVING count(*) >= 2;
```

| customer_id | paid_orders |
|---|---|
| 1 | 2 |

## L'ordre logique d'une requête

Vous écrivez `SELECT` en premier, mais la base de données évalue conceptuellement les clauses dans cet ordre :

1. `FROM` : choisir les tables ;
2. `WHERE` : garder les lignes qui correspondent ;
3. `GROUP BY` : former les groupes ;
4. `HAVING` : garder les groupes qui correspondent ;
5. `SELECT` : calculer les colonnes de sortie ;
6. `ORDER BY`, puis `LIMIT`.

Cela explique pourquoi on ne peut pas utiliser un alias de `SELECT` dans `WHERE` (il n'existe pas encore), et pourquoi `HAVING` peut utiliser des agrégats alors que `WHERE` ne le peut pas.

## Pratique : interroger

Essayez-les dans l'éditeur sous chaque question. **Vérifier** compare votre résultat à celui attendu ; **Exécuter** montre seulement ce que renvoie votre requête.

```exercise
Listez les noms des clients qui habitent au Burundi (`country = 'BI'`), par ordre alphabétique. Une seule colonne.
--- setup
@include sample.sql
--- starter
-- customers(id, name, country)
SELECT
--- solution
SELECT name FROM customers WHERE country = 'BI' ORDER BY name;
--- hint
Filtrez avec WHERE, puis triez avec ORDER BY name.
```

```exercise
Affichez le nom de chaque produit avec son prix en euros (la table stocke des centimes), uniquement pour les produits à moins de 10 euros, du moins cher au plus cher. Deux colonnes : le nom et le prix.
--- setup
@include sample.sql
--- starter
-- products(id, name, price_cents, category)
SELECT
--- solution
SELECT name, price_cents / 100.0 AS price FROM products WHERE price_cents < 1000 ORDER BY price;
--- hint
Divisez par 100.0 (et non 100) pour garder les décimales.
```

```exercise
Comptez les commandes par statut, et ne gardez que les statuts qui apparaissent plus d'une fois. Deux colonnes : le statut et le nombre de commandes.
--- setup
@include sample.sql
--- starter
-- orders(id, customer_id, ordered_at, status)
SELECT
--- solution
SELECT status, COUNT(*) FROM orders GROUP BY status HAVING COUNT(*) > 1;
--- hint
WHERE filtre les lignes avant le regroupement ; HAVING filtre les groupes.
```

## Points clés : interroger avec SQL

- `SELECT ... FROM ... WHERE ... ORDER BY ... LIMIT` lit et filtre les lignes.
- Testez les valeurs manquantes avec `IS NULL` ; `= NULL` ne correspond jamais.
- `WHERE` filtre les lignes avant le regroupement, `HAVING` filtre les groupes après.
- Sans `ORDER BY`, l'ordre des lignes n'est pas garanti.

```quiz
Quelle requête renvoie le nombre de commandes par statut, en ne gardant que les statuts ayant au moins 2 commandes ?
- [ ] SELECT status, count(*) FROM orders WHERE count(*) >= 2 GROUP BY status
- [x] SELECT status, count(*) FROM orders GROUP BY status HAVING count(*) >= 2
- [ ] SELECT status, count(*) FROM orders HAVING status >= 2
> Les agrégats ne peuvent pas être utilisés dans WHERE. Une condition sur un groupe se place dans HAVING, après GROUP BY.
```

```quiz
Pourquoi `WHERE phone = NULL` ne renvoie-t-il aucune ligne ?
- [ ] NULL est stocké sous forme de chaîne vide
- [x] Comparer quoi que ce soit avec NULL donne inconnu, jamais vrai
- [ ] La colonne doit d'abord être indexée
> Utilisez `WHERE phone IS NULL`.
```
