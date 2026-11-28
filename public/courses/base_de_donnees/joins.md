# Joining tables

> Objectives: combine rows from several tables with `JOIN`, choose between inner and outer joins, and avoid the classic double-counting mistake.

## Why join

Data is split across tables to avoid duplication: an order stores a `customer_id`, not the customer's name. To show the name next to the order, we **join** the two tables on the matching key.

## INNER JOIN

An inner join keeps only the pairs of rows that satisfy the `ON` condition.

```sql
SELECT c.name, o.id AS order_id, o.status
FROM customers AS c
JOIN orders AS o ON o.customer_id = c.id
ORDER BY o.id;
```

| name | order_id | status |
|---|---|---|
| Amina | 1 | paid |
| Amina | 2 | paid |
| Brian | 3 | shipped |
| Chloé | 4 | paid |
| Chloé | 5 | cancelled |
| Diego | 6 | paid |
| Esther | 7 | paid |

`JOIN` alone means `INNER JOIN`. We give each table a short **alias** (`c`, `o`) and prefix the columns with it, which keeps the query readable and removes ambiguity when two tables have a column with the same name. Farid is missing from the result: he has no order, so no row matches.

## LEFT JOIN

A left join keeps **every** row of the left table. When nothing matches on the right, the right-hand columns are `NULL`.

```sql
SELECT c.name, count(o.id) AS orders_count
FROM customers AS c
LEFT JOIN orders AS o ON o.customer_id = c.id
GROUP BY c.id, c.name
ORDER BY orders_count DESC, c.name;
```

| name | orders_count |
|---|---|
| Amina | 2 |
| Chloé | 2 |
| Brian | 1 |
| Diego | 1 |
| Esther | 1 |
| Farid | 0 |

Farid now appears, with 0. Note that we count `o.id`, not `*`: `count(*)` would count the row of Farid as 1, whereas `count(o.id)` ignores `NULL`.

A very useful pattern is the **anti-join**: find the rows with no match, by keeping those where the right side is `NULL`.

```sql
SELECT c.name
FROM customers AS c
LEFT JOIN orders AS o ON o.customer_id = c.id
WHERE o.id IS NULL;
```

This returns Farid, the customer who never ordered.

## Joining more than two tables

Chain the joins, one `ON` per join. To compute the total of each order, we go from `orders` to `order_items`, then to `products` for the price:

```sql
SELECT o.id AS order_id,
       c.name,
       round(sum(oi.quantity * p.price_cents) / 100.0, 2) AS total
FROM orders AS o
JOIN customers AS c ON c.id = o.customer_id
JOIN order_items AS oi ON oi.order_id = o.id
JOIN products AS p ON p.id = oi.product_id
GROUP BY o.id, c.name
ORDER BY o.id;
```

| order_id | name | total |
|---|---|---|
| 1 | Amina | 12.60 |
| 2 | Amina | 39.00 |
| 3 | Brian | 41.00 |
| 4 | Chloé | 12.50 |
| 5 | Chloé | 39.00 |
| 6 | Diego | 21.00 |
| 7 | Esther | 58.00 |

Which products were really sold (cancelled orders excluded), and in what quantity?

```sql
SELECT p.name, sum(oi.quantity) AS units_sold
FROM products AS p
JOIN order_items AS oi ON oi.product_id = p.id
JOIN orders AS o ON o.id = oi.order_id
WHERE o.status <> 'cancelled'
GROUP BY p.id, p.name
ORDER BY units_sold DESC, p.name;
```

| name | units_sold |
|---|---|
| Pen | 13 |
| Notebook | 5 |
| Mug | 4 |
| Lamp | 3 |
| Backpack | 1 |

Headphones is absent because nothing references it. To list it with 0 sales, `products` must be on the left of a `LEFT JOIN`.

## Overview of join types

| Join | Keeps |
|---|---|
| `INNER JOIN` | only the matching pairs |
| `LEFT JOIN` | all left rows, matched right rows or `NULL` |
| `RIGHT JOIN` | all right rows (a left join with the tables swapped; rarely needed) |
| `FULL JOIN` | all rows from both sides (not available in SQLite before 3.39) |
| `CROSS JOIN` | every combination of left and right rows |

A **self join** joins a table with itself, using two aliases. It is used for hierarchies, such as an `employees` table where each row has a `manager_id` pointing to another employee.

## The double-counting trap

When you join a table to **two** different "many" tables, or when you aggregate a column from the "one" side after joining the "many" side, rows are repeated. Count the orders after joining their items:

```sql
SELECT count(*) AS rows_returned,
       count(DISTINCT o.id) AS real_orders
FROM orders AS o
JOIN order_items AS oi ON oi.order_id = o.id;
```

The result is 12 rows but only 7 orders, because an order with three items appears three times. The same mistake silently inflates sums: summing `orders.amount` after joining `order_items` counts the amount once per item. Always ask: **what does one row of my result represent?**, and aggregate at that level (for example in a subquery, see the last chapter).

## Practice: joins

Try these in the editor below each question. **Check** compares your result with the expected one; **Run** only shows what your query returns.

```exercise
List every paid order (`status = 'paid'`) with the name of the customer who placed it. Two columns: the order id and the customer name.
--- setup
@include sample.sql
--- starter
-- orders(id, customer_id, status), customers(id, name)
SELECT
--- solution
SELECT o.id, c.name FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.status = 'paid';
--- hint
Join orders to customers on customer_id = customers.id.
```

```exercise
Find the customers who have never placed an order. One column: the name.
--- setup
@include sample.sql
--- starter
-- customers(id, name), orders(customer_id)
SELECT
--- solution
SELECT c.name FROM customers c LEFT JOIN orders o ON o.customer_id = c.id WHERE o.id IS NULL;
--- hint
A LEFT JOIN keeps customers without orders; their order columns are NULL.
```

```exercise
For each customer who has ordered, compute the total number of items bought (the sum of `quantity` over all their orders). Two columns: the name and the total, biggest total first.
--- setup
@include sample.sql
--- starter
-- customers, orders, order_items(order_id, product_id, quantity)
SELECT
--- solution
SELECT c.name, SUM(oi.quantity) AS items FROM customers c JOIN orders o ON o.customer_id = c.id JOIN order_items oi ON oi.order_id = o.id GROUP BY c.id, c.name ORDER BY items DESC, c.name;
--- hint
Chain two joins, then GROUP BY the customer.
```

## Key takeaways: joining tables

- `JOIN ... ON` combines rows of two tables that match on a key.
- Use `LEFT JOIN` to keep rows without a match; `WHERE right.id IS NULL` finds them.
- Count a column of the right table (`count(o.id)`), not `count(*)`, after a left join.
- A join multiplies rows: check what one result row means before you aggregate.

```quiz
Which query lists customers who have never placed an order?
- [ ] SELECT name FROM customers JOIN orders ON orders.customer_id = customers.id
- [x] SELECT c.name FROM customers c LEFT JOIN orders o ON o.customer_id = c.id WHERE o.id IS NULL
- [ ] SELECT name FROM customers WHERE id = NULL
> The left join keeps every customer; those without an order have NULL in the order columns.
```

```quiz
After a LEFT JOIN, why prefer `count(o.id)` over `count(*)`?
- [ ] It is faster
- [x] `count(*)` also counts the unmatched rows, giving 1 instead of 0
- [ ] `count(*)` is not allowed with joins
> count(column) ignores NULL, so a customer without orders correctly gets 0.
```

```quiz
After joining `orders` to `order_items`, `count(*)` returns 12 although there are only 7 orders. Why?
- [ ] The join adds a NULL row for each order
- [ ] Five orders are duplicated in the orders table
- [x] An order with several items appears once per item
> A join multiplies rows on the "many" side. Use `count(DISTINCT o.id)` to count real orders.
```

```quiz
Which query lists all products, including Headphones which was never sold?
- [x] `FROM products p LEFT JOIN order_items oi ON oi.product_id = p.id`
- [ ] `FROM products p JOIN order_items oi ON oi.product_id = p.id`
- [ ] `FROM order_items oi LEFT JOIN products p ON p.id = oi.product_id`
> To keep every product, `products` must be on the left of a LEFT JOIN. Unsold products get NULL in the item columns.
```

```quiz
In an INNER JOIN between `customers` and `orders`, what happens to Farid, who has no order?
- [ ] He appears with NULL order columns
- [x] He does not appear in the result
- [ ] He appears with an orders count of 0
> An inner join keeps only the pairs of rows that match. Without an order, there is no pair for Farid.
```
