# Querying with SQL

> Objectives: create the sample database, then read data with `SELECT`, filter it, sort it, and summarize it with aggregates and `GROUP BY`.

## Set up the sample database

Paste this script into PostgreSQL (`psql`) or SQLite to create the four tables and fill them. Every example in the course runs against it.

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

We have six customers, six products and seven orders. Notice that customer Farid has never ordered anything, and the product Headphones has never been sold. These edge cases make the next examples more interesting.

## SELECT and WHERE

`SELECT` chooses the columns, `FROM` names the table, and `WHERE` keeps only the rows that satisfy a condition.

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

String values use single quotes; double quotes are for identifiers. `ORDER BY` sorts the result, ascending by default and descending with `DESC`. Without `ORDER BY`, the order of rows is **not guaranteed**.

Conditions combine with `AND`, `OR` and `NOT`, and use these operators:

| Operator | Meaning | Example |
|---|---|---|
| `=`, `<>`, `<`, `>`, `<=`, `>=` | comparison | `price_cents >= 800` |
| `BETWEEN a AND b` | inclusive range | `price_cents BETWEEN 400 AND 1000` |
| `IN (...)` | one of a list | `category IN ('home', 'bags')` |
| `LIKE` | pattern: `%` any text, `_` one character | `name LIKE 'A%'` |
| `IS NULL` | missing value | `shipped_at IS NULL` |

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

## Computed columns, aliases and LIMIT

A column in `SELECT` can be an expression, and `AS` gives it a name. `LIMIT` keeps only the first rows, which is most useful together with `ORDER BY`.

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

`SELECT DISTINCT` removes duplicate rows from the result:

```sql
SELECT DISTINCT country
FROM customers
ORDER BY country;
```

## NULL in conditions

Because a comparison with `NULL` is neither true nor false, `WHERE shipped_at = NULL` returns nothing, even for rows where `shipped_at` is missing. Use `IS NULL`:

```sql
SELECT NULL = NULL AS equals_null, NULL IS NULL AS is_null;
```

The first column is `NULL` (unknown), the second is true. A related trap: `WHERE x <> 5` also leaves out the rows where `x` is `NULL`.

## Aggregate functions

Aggregates collapse many rows into one value: `count`, `sum`, `avg`, `min`, `max`.

```sql
SELECT count(*) AS orders_count,
       min(ordered_at) AS first_order,
       max(ordered_at) AS last_order
FROM orders;
```

| orders_count | first_order | last_order |
|---|---|---|
| 7 | 2026-01-05 | 2026-04-02 |

`count(*)` counts rows; `count(column)` counts the rows where the column is not `NULL`; `count(DISTINCT column)` counts distinct values.

```sql
SELECT count(*) AS customers_count,
       count(DISTINCT country) AS countries
FROM customers;
```

## GROUP BY and HAVING

`GROUP BY` forms one group per distinct value and applies the aggregates to each group.

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

Every column in `SELECT` must either appear in `GROUP BY` or be inside an aggregate. To filter **groups**, use `HAVING`; `WHERE` filters rows **before** grouping.

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

## The logical order of a query

You write `SELECT` first, but the database conceptually evaluates the clauses in this order:

1. `FROM`: choose the tables;
2. `WHERE`: keep the matching rows;
3. `GROUP BY`: form groups;
4. `HAVING`: keep the matching groups;
5. `SELECT`: compute the output columns;
6. `ORDER BY`, then `LIMIT`.

This explains why you cannot use a `SELECT` alias inside `WHERE` (it does not exist yet), and why `HAVING` can use aggregates while `WHERE` cannot.

## Practice: querying

Try these in the editor below each question. **Check** compares your result with the expected one; **Run** only shows what your query returns.

```exercise
List the names of the customers who live in Burundi (`country = 'BI'`), in alphabetical order. One column.
--- setup
@include sample.sql
--- starter
-- customers(id, name, country)
SELECT
--- solution
SELECT name FROM customers WHERE country = 'BI' ORDER BY name;
--- hint
Filter with WHERE, then sort with ORDER BY name.
```

```exercise
Show each product name with its price in euros (the table stores cents), only for products that cost less than 10 euros, cheapest first. Two columns: the name and the price.
--- setup
@include sample.sql
--- starter
-- products(id, name, price_cents, category)
SELECT
--- solution
SELECT name, price_cents / 100.0 AS price FROM products WHERE price_cents < 1000 ORDER BY price;
--- hint
Divide by 100.0 (not 100) to keep the decimals.
```

```exercise
Count the orders per status, and keep only the statuses that appear more than once. Two columns: the status and the number of orders.
--- setup
@include sample.sql
--- starter
-- orders(id, customer_id, ordered_at, status)
SELECT
--- solution
SELECT status, COUNT(*) FROM orders GROUP BY status HAVING COUNT(*) > 1;
--- hint
WHERE filters rows before grouping; HAVING filters the groups.
```

## Key takeaways: querying with SQL

- `SELECT ... FROM ... WHERE ... ORDER BY ... LIMIT` reads and filters rows.
- Test missing values with `IS NULL`; `= NULL` never matches.
- `WHERE` filters rows before grouping, `HAVING` filters groups after.
- Without `ORDER BY`, row order is not guaranteed.

```quiz
Which query returns the number of orders per status, keeping only statuses with at least 2 orders?
- [ ] SELECT status, count(*) FROM orders WHERE count(*) >= 2 GROUP BY status
- [x] SELECT status, count(*) FROM orders GROUP BY status HAVING count(*) >= 2
- [ ] SELECT status, count(*) FROM orders HAVING status >= 2
> Aggregates cannot be used in WHERE. A condition on a group goes in HAVING, after GROUP BY.
```

```quiz
Why does `WHERE phone = NULL` return no rows?
- [ ] NULL is stored as an empty string
- [x] Comparing anything with NULL gives unknown, never true
- [ ] The column must be indexed first
> Use `WHERE phone IS NULL`.
```
