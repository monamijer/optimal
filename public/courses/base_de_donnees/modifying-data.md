# Changing data and structure

> Objectives: add, change and delete rows, define tables with constraints, and evolve a schema safely.

## INSERT

`INSERT` adds rows. Always list the columns, so that the statement keeps working when a column is added later.

```sql
INSERT INTO customers (id, name, country)
VALUES (7, 'Grace', 'KE');
```

Several rows at once are inserted with several value lists, which is faster than one statement per row. `RETURNING` hands back the row you just wrote, useful to learn a generated value:

```sql
INSERT INTO products (id, name, price_cents, category)
VALUES (7, 'Ruler', 200, 'stationery'),
       (8, 'Eraser', 90, 'stationery')
RETURNING id, name;
```

## UPDATE

`UPDATE` changes existing rows. **The `WHERE` clause decides which rows**: forget it and every row changes.

```sql
UPDATE products
SET price_cents = price_cents + 50
WHERE id = 1;
```

Before running an `UPDATE` or `DELETE` on real data, write it first as a `SELECT` with the same `WHERE` and check which rows it returns. Then run it inside a transaction (see the chapter on transactions), so that a mistake can be undone.

## DELETE

```sql
DELETE FROM products
WHERE id IN (7, 8);
```

`DELETE FROM products;` without `WHERE` empties the table. Deleting a row that other rows reference is governed by the foreign key rules below.

## Upsert: insert or update

To "insert, or update if it already exists", use `ON CONFLICT` (PostgreSQL and SQLite):

```sql
INSERT INTO products (id, name, price_cents, category)
VALUES (1, 'Notebook', 500, 'stationery')
ON CONFLICT (id) DO UPDATE SET price_cents = excluded.price_cents;
```

`excluded` refers to the row we tried to insert. This is atomic, unlike "check, then insert", which can fail when two clients run it at the same time.

## CREATE TABLE and constraints

**Constraints** are rules the database enforces for you. It is much more reliable to declare them than to trust every program that writes to the database.

```sql
CREATE TABLE reviews (
    id          integer PRIMARY KEY,
    customer_id integer NOT NULL REFERENCES customers (id),
    product_id  integer NOT NULL REFERENCES products (id),
    rating      integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment     text,
    created_at  text NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (customer_id, product_id)
);
```

| Constraint | Guarantees |
|---|---|
| `PRIMARY KEY` | unique, non-null identifier |
| `NOT NULL` | a value is required |
| `UNIQUE` | no two rows share the value (or combination) |
| `CHECK (condition)` | a custom rule on the row |
| `REFERENCES` (foreign key) | the value exists in the other table |
| `DEFAULT value` | value used when none is given |

Violations are rejected. The rating below is out of range, so the statement fails and nothing is written:

```sql
-- fails: CHECK constraint
INSERT INTO reviews (id, customer_id, product_id, rating)
VALUES (1, 1, 1, 9);
```

In the same way, a review for a customer that does not exist is rejected by the foreign key:

```sql
-- fails: foreign key
INSERT INTO reviews (id, customer_id, product_id, rating)
VALUES (2, 999, 1, 5);
```

## Foreign keys and deletion

By default, you cannot delete a customer who still has orders. You can choose another behavior when declaring the foreign key:

```sql
CREATE TABLE wishlist_items (
    customer_id integer NOT NULL REFERENCES customers (id) ON DELETE CASCADE,
    product_id  integer NOT NULL REFERENCES products (id),
    PRIMARY KEY (customer_id, product_id)
);
```

With `ON DELETE CASCADE`, deleting a customer also deletes their wishlist rows. Use it for data that has no meaning without its parent. For business records such as orders, keep the default (refuse), or prefer marking rows as inactive.

```sql
-- fails: customer 1 still has orders
DELETE FROM customers WHERE id = 1;
```

## ALTER TABLE: evolving the schema

Requirements change, so tables must too.

```sql
ALTER TABLE customers ADD COLUMN email text;

ALTER TABLE customers RENAME COLUMN email TO contact_email;
```

Adding a column is cheap. Other changes, such as changing a column's type, are specific to each system. In PostgreSQL:

```sql
-- postgresql-only
ALTER TABLE products ALTER COLUMN price_cents TYPE bigint;
```

On a large production table, some `ALTER TABLE` operations lock the table or rewrite it entirely. Test schema changes on a copy of the data, and keep them in versioned **migration** files rather than typing them by hand.

PostgreSQL also offers an identity column, which generates the key for you:

```sql
-- postgresql-only
CREATE TABLE tags (
    id   bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name text NOT NULL UNIQUE
);
```

## Practice: changing data

Try these in the editor below each question. **Check** compares your result with the expected one; **Run** only shows what your query returns.

```exercise
Add a new customer: id 7, name `Grace`, country `BE`. The checker then reads the whole `customers` table.
--- setup
@include sample.sql
--- starter
-- customers(id, name, country)
INSERT INTO
--- solution
INSERT INTO customers (id, name, country) VALUES (7, 'Grace', 'BE');
--- check
SELECT id, name, country FROM customers ORDER BY id;
--- hint
INSERT INTO table (columns) VALUES (values);
```

```exercise
Mark the order number 3 as `delivered` and leave every other order untouched. The checker then reads the `orders` table.
--- setup
@include sample.sql
--- starter
-- orders(id, customer_id, ordered_at, status)
UPDATE
--- solution
UPDATE orders SET status = 'delivered' WHERE id = 3;
--- check
SELECT id, status FROM orders ORDER BY id;
--- hint
Do not forget the WHERE: without it every row changes.
```

```exercise
Delete all the lines of the cancelled orders from `order_items` (a line belongs to a cancelled order when its order has `status = 'cancelled'`). The checker then reads `order_items`.
--- setup
@include sample.sql
--- starter
-- order_items(order_id, product_id, quantity), orders(id, status)
DELETE FROM
--- solution
DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE status = 'cancelled');
--- check
SELECT order_id, product_id, quantity FROM order_items ORDER BY order_id, product_id;
--- hint
Use a subquery: WHERE order_id IN (SELECT ...).
```

## Key takeaways: changing data and structure

- Always name the columns in `INSERT`, and never forget the `WHERE` of `UPDATE` and `DELETE`.
- Declare constraints (`NOT NULL`, `UNIQUE`, `CHECK`, foreign keys): the database then protects your data from every program.
- `ON CONFLICT` gives an atomic upsert.
- Change schemas through versioned migrations, tested on a copy.

```quiz
What does `UPDATE products SET price_cents = 0;` do?
- [ ] Nothing, because there is no WHERE clause
- [ ] It updates only the first row
- [x] It sets the price of every product to 0
> Without WHERE, an UPDATE applies to all rows. Check with a SELECT first and use a transaction.
```

```quiz
Why declare a CHECK or FOREIGN KEY constraint rather than validate in the application only?
- [ ] Constraints make queries faster
- [x] The database enforces them for every program and every user, so bad data cannot get in
- [ ] Applications cannot validate data
> A rule in one application can be bypassed by another script, a manual fix or a bug. A constraint cannot.
```
