# Indexes and query plans

> Objectives: understand what an index is, create the right ones, and read a query plan to check they are used.

## The problem: scanning

Without help, finding the orders of customer 3 forces the database to read **every row** of `orders` and test each one. This is a **sequential scan**, and its cost grows with the size of the table: O(n). Harmless on 7 rows, painful on 70 million.

## What an index is

An **index** is a separate, sorted structure that maps column values to the rows that hold them, like the index at the back of a book. The default type, the **B-tree**, keeps values sorted in a balanced tree, so finding a value takes O(log n) steps, the same idea as binary search in the Algorithms course. It also supports ranges (`>`, `BETWEEN`) and sorting.

```sql
CREATE INDEX idx_orders_customer_id ON orders (customer_id);
```

Primary keys and `UNIQUE` constraints already create an index for you. A foreign key does **not** in PostgreSQL: if you often filter or join on `orders.customer_id`, create the index yourself.

## Reading a query plan

The **query plan** is the strategy the database chose. Ask for it with `EXPLAIN`. In SQLite, before the index exists:

```sql
EXPLAIN QUERY PLAN
SELECT * FROM orders WHERE customer_id = 3;
```

The answer is `SCAN orders`: a full scan. After `CREATE INDEX idx_orders_customer_id`, the same command answers `SEARCH orders USING INDEX idx_orders_customer_id (customer_id=?)`.

In PostgreSQL, `EXPLAIN ANALYZE` goes further: it **runs** the query and reports the real timings next to the estimates.

```sql
-- postgresql-only
EXPLAIN ANALYZE
SELECT * FROM orders WHERE customer_id = 3;
```

The output has this shape (numbers vary, they are elided here):

```text
Index Scan using idx_orders_customer_id on orders  (cost=... rows=... width=...) (actual time=... rows=... loops=1)
  Index Cond: (customer_id = 3)
Planning Time: ... ms
Execution Time: ... ms
```

The words to look for:

| Plan node | Meaning |
|---|---|
| `Seq Scan` | reads the whole table |
| `Index Scan` / `Index Only Scan` | walks the index (and maybe the table) |
| `Bitmap Heap Scan` | collects matching rows from the index, then reads the table in order |
| `Nested Loop`, `Hash Join`, `Merge Join` | strategies for a join |

Two cautions. `EXPLAIN ANALYZE` really executes the statement, so wrap an `UPDATE` or `DELETE` in a transaction and `ROLLBACK` afterwards. And a `Seq Scan` is not always bad: on a small table, or when the query needs most of the rows, reading everything is the fastest option, and the planner knows it.

## Composite indexes

An index can cover several columns. **Column order matters**: the index is sorted by the first column, then by the second inside each value of the first.

```sql
CREATE INDEX idx_orders_status_date ON orders (status, ordered_at);
```

This index serves `WHERE status = 'paid' AND ordered_at >= '2026-03-01'`, and also `WHERE status = 'paid'` alone (the "leftmost prefix"). It does **not** help a query that only filters on `ordered_at`: that query still does `SCAN orders`. Put the columns tested with equality first, and the range column last.

## When an index is not used

- **A function on the column**: `WHERE lower(name) = 'amina'` cannot use a plain index on `name`. Create an index on the expression instead:

```sql
CREATE INDEX idx_customers_lower_name ON customers (lower(name));
```

- **Low selectivity**: an index on a column with two values (a boolean) rarely helps when half of the rows match.
- **A leading wildcard**: `LIKE '%son'` cannot use a B-tree; `LIKE 'Son%'` can (with the right collation).
- **A type mismatch** or stale statistics: if the planner chooses badly, refresh them with `ANALYZE`.

## Indexes are not free

Each index takes disk space and must be updated on every `INSERT`, `UPDATE` and `DELETE`. Ten indexes on a table that is written all the time slow the writes down. Index what you query, check with the plan, and remove the indexes that nobody uses.

A **partial index** covers only some rows and stays small. For example, to speed up the search for unfinished orders only:

```sql
CREATE INDEX idx_orders_open ON orders (ordered_at) WHERE status <> 'paid';
```

PostgreSQL has other index types for other needs: GIN (full-text search, arrays, JSON), GiST (geometry), BRIN (huge tables ordered by time).

## Key takeaways: indexes and query plans

- An index is a sorted structure that turns a scan, O(n), into a search, O(log n).
- Create indexes for the columns you filter, join and sort on; foreign keys are not indexed automatically in PostgreSQL.
- Read the plan with `EXPLAIN` (`EXPLAIN ANALYZE` in PostgreSQL) instead of guessing.
- Composite index: equality columns first, range column last; only the leftmost prefix is usable.
- Every index slows down writes: do not index everything.

```quiz
A composite index on (status, ordered_at). Which query can NOT use it efficiently?
- [ ] WHERE status = 'paid'
- [ ] WHERE status = 'paid' AND ordered_at >= '2026-03-01'
- [x] WHERE ordered_at >= '2026-03-01'
> The index is sorted by status first. Without a condition on its first column, the database cannot use it to jump to the right place.
```

```quiz
Why not create an index on every column?
- [ ] The database refuses more than three indexes
- [x] Each index uses space and must be updated at every write, slowing inserts and updates
- [ ] Indexes make reads slower
> Indexes are a trade-off: faster reads, slower writes, more storage.
```

```quiz
Which query can use an index created with `CREATE INDEX ... ON customers (lower(name))`?
- [x] `WHERE lower(name) = 'amina'`
- [ ] `WHERE name = 'Amina'`
- [ ] `WHERE name LIKE '%ina'`
> An expression index serves queries that use the same expression. A plain filter on `name` does not match it.
```

```quiz
In PostgreSQL you often filter and join on `orders.customer_id`, which is a foreign key. What should you do?
- [ ] Nothing: a foreign key always creates an index
- [ ] Declare the column UNIQUE
- [x] Create an index on it yourself
> PostgreSQL does not index foreign keys automatically. UNIQUE would be wrong here, since a customer has many orders.
```
