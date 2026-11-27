# Subqueries, CTEs and window functions

> Objectives: answer harder questions with subqueries and common table expressions, and compute rankings and running values with window functions.

## Subqueries

A **subquery** is a query inside another one. As a scalar, it produces one value to compare with. Which products cost more than the average?

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

A subquery can also return a list for `IN`, or be tested with `EXISTS`. A **correlated** subquery refers to the outer row and is evaluated for each of them. Which customers have at least one paid order?

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

This returns Amina, Chloé, Diego and Esther. `EXISTS` stops at the first match and never multiplies rows, which makes it a safer cousin of the join when you only need to know that a match exists. `NOT EXISTS` is the anti-join in another form.

One warning: `NOT IN (subquery)` returns **nothing** if the subquery produces a single `NULL`, because the comparison becomes unknown. Prefer `NOT EXISTS`.

## Common table expressions (CTE)

A **CTE** gives a name to a subquery with `WITH`, so that a complex query reads top to bottom, step by step. How much did each customer spend on paid orders?

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

The first step computes one row per order, **then** the second step groups by customer. Aggregating in two stages is the standard cure for the double-counting trap of the joins chapter.

A **recursive** CTE refers to itself and is the tool for hierarchies (an org chart, categories inside categories) and for generating series:

```sql
WITH RECURSIVE counter (n) AS (
    SELECT 1
    UNION ALL
    SELECT n + 1 FROM counter WHERE n < 5
)
SELECT n FROM counter;
```

It produces 1, 2, 3, 4, 5. The first `SELECT` is the starting point, the second is the step, and the `WHERE` is what stops the recursion. Forgetting the stop condition loops forever.

## Window functions

`GROUP BY` collapses rows. A **window function** computes a value across a set of related rows **without** collapsing them: each row keeps its identity and gains a new column. The window is described by `OVER (...)`:

- `PARTITION BY` splits rows into independent groups (like `GROUP BY`, but rows stay);
- `ORDER BY` orders the rows inside each partition.

Number each customer's orders in chronological order:

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

Rank products by price inside their category with `rank()`:

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

The most common ranking functions:

| Function | Behavior on ties |
|---|---|
| `row_number()` | always distinct: 1, 2, 3 |
| `rank()` | ties share a rank, then a gap: 1, 1, 3 |
| `dense_rank()` | ties share a rank, no gap: 1, 1, 2 |

`lag()` and `lead()` read the previous or next row. The delay between a customer's consecutive orders needs nothing more than that:

```sql
SELECT customer_id, id AS order_id, ordered_at,
       lag(ordered_at) OVER (PARTITION BY customer_id ORDER BY ordered_at) AS previous_order
FROM orders
ORDER BY customer_id, ordered_at;
```

For each customer's first order, `previous_order` is `NULL`. Finally, an aggregate used as a window function gives running totals:

```sql
SELECT ordered_at, id,
       count(*) OVER (ORDER BY ordered_at) AS orders_so_far
FROM orders
ORDER BY ordered_at;
```

The last column goes from 1 to 7: a running count. Window functions are evaluated after `WHERE`, `GROUP BY` and `HAVING`, so you cannot filter on them directly. To keep "the first order of each customer", wrap the query in a CTE and filter on `nth_order = 1`.

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

## Practice: advanced queries

Try these in the editor below each question. **Check** compares your result with the expected one; **Run** only shows what your query returns.

```exercise
List the products that are more expensive than the average price of all products. Two columns: the name and the price in cents, most expensive first.
--- setup
@include sample.sql
--- starter
-- products(id, name, price_cents, category)
SELECT
--- solution
SELECT name, price_cents FROM products WHERE price_cents > (SELECT AVG(price_cents) FROM products) ORDER BY price_cents DESC;
--- hint
A scalar subquery can compute the average inside WHERE.
```

```exercise
With a CTE named `paid` that keeps the paid orders, count how many paid orders each customer has. Two columns: the customer name and the count, for customers who have at least one, by name.
--- setup
@include sample.sql
--- starter
-- WITH paid AS (...)
WITH
--- solution
WITH paid AS (SELECT * FROM orders WHERE status = 'paid') SELECT c.name, COUNT(*) FROM customers c JOIN paid p ON p.customer_id = c.id GROUP BY c.id, c.name ORDER BY c.name;
--- hint
Define the CTE first, then join it like a table.
```

```exercise
Rank the products by price inside each category, the most expensive first (rank 1). Three columns: category, product name and rank. Use a window function (`RANK() OVER (...)`) and sort by category then rank.
--- setup
@include sample.sql
--- starter
-- products(id, name, price_cents, category)
SELECT
--- solution
SELECT category, name, RANK() OVER (PARTITION BY category ORDER BY price_cents DESC) AS price_rank FROM products ORDER BY category, price_rank, name;
--- hint
PARTITION BY category, ORDER BY price_cents DESC inside OVER (...).
```

## Key takeaways: subqueries, CTEs and window functions

- Subqueries answer a question in terms of another one; prefer `EXISTS` over `IN` when you only test existence, and `NOT EXISTS` over `NOT IN`.
- A CTE (`WITH`) names a step so complex queries read in order; `WITH RECURSIVE` handles hierarchies.
- Window functions add per-row calculations (rank, previous row, running totals) without collapsing the rows.
- To filter on a window function, compute it in a CTE or subquery first.

```quiz
What is the difference between GROUP BY and a window function such as `sum(x) OVER (PARTITION BY k)`?
- [ ] There is none
- [x] GROUP BY returns one row per group; the window function keeps every row and adds the group value as a column
- [ ] Window functions can only be used on numbers
> Window functions compute over a set of rows without collapsing them.
```

```quiz
Three products tie for first place by price. What does `rank()` give to the next, cheaper product?
- [ ] 2
- [x] 4
- [ ] 1
> rank() leaves a gap after ties: 1, 1, 1, 4. dense_rank() would give 2.
```
