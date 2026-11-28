# The relational model

> Objectives: read a table as a set of rows, and use primary keys, foreign keys and data types to describe relationships.

## Tables, rows and columns

In a relational database, data lives in **tables**. A table describes one kind of thing, such as customers. Each **column** is an attribute with a name and a type (`name`, `country`). Each **row** is one instance: one customer.

| id | name | country |
|---|---|---|
| 1 | Amina | BI |
| 2 | Brian | KE |
| 3 | Chloé | FR |

Two properties are worth remembering. A table is a **set** of rows: it has no inherent order, so a query that needs an order must ask for one. And every column has a **type**, which the database enforces.

## Primary keys

A **primary key** is a column (or group of columns) whose value identifies each row uniquely. It can never be `NULL` and never repeats. Here, `id` is the primary key of `customers`: `id = 2` designates exactly one customer.

Use a key that never changes and carries no meaning. A name or an email can change or be shared; a generated number cannot be confused with anything else. This is called a **surrogate key**.

## Foreign keys and relationships

Tables are connected through **foreign keys**: a column in one table that holds the primary key of a row in another. In our shop, each order stores the `id` of the customer who placed it:

```text
customers (1) ──────< orders (many)
    id  ◄───────────  customer_id
```

A foreign key is more than a convention. The database **refuses** to insert an order whose `customer_id` does not exist, and refuses to delete a customer who still has orders, unless you decide otherwise. This property is called **referential integrity**.

There are three kinds of relationships:

| Relationship | Example | How it is stored |
|---|---|---|
| One to many | one customer, many orders | foreign key on the "many" side (`orders.customer_id`) |
| Many to many | orders and products | a **junction table** holding both keys (`order_items`) |
| One to one | a user and their profile | foreign key that is also unique |

An order contains several products and a product appears in several orders: that is many to many. We cannot put a list of products in one cell, so we create the junction table `order_items`, with one row per product in an order. Its primary key is the pair `(order_id, product_id)`.

## The sample database

The rest of the course uses four tables:

```text
customers (id, name, country)
products (id, name, price_cents, category)
orders (id, customer_id → customers, ordered_at, status)
order_items (order_id → orders, product_id → products, quantity)
```

Prices are stored as integer **cents**. Floating-point numbers cannot represent most decimal amounts exactly, so money is stored either as integers (cents) or as the exact `numeric` type.

## NULL: the absence of a value

`NULL` means "unknown or missing". It is not zero and not an empty string. Its main trap: any comparison with `NULL` gives neither true nor false but **unknown**, so `NULL = NULL` is not true. To test for it, SQL has `IS NULL` and `IS NOT NULL`. We come back to this in the next chapter.

Declare a column `NOT NULL` whenever a value is required: the database will then reject rows that forget it.

## Common data types

| Type | Use | Note |
|---|---|---|
| `integer`, `bigint` | whole numbers | `bigint` for ids that may exceed 2 billion |
| `numeric(p, s)` | exact decimals | money, measurements |
| `text`, `varchar(n)` | character strings | in PostgreSQL, `text` has no performance penalty |
| `boolean` | true or false | |
| `date`, `timestamp` | dates and times | store `timestamptz` in PostgreSQL to keep time zones right |

## Key takeaways: the relational model

- Data is stored in tables of typed columns; a table is an unordered set of rows.
- A primary key identifies a row; a foreign key points to a row of another table and is enforced by the database.
- Many-to-many relationships need a junction table.
- `NULL` means unknown: test it with `IS NULL`, never with `=`.

```quiz
How do you store the fact that an order contains several products, and a product appears in several orders?
- [ ] A comma-separated list of product ids in the orders table
- [x] A junction table with one row per (order, product) pair
- [ ] Duplicate the order for every product
> A many-to-many relationship is modeled with a junction table holding two foreign keys.
```

```quiz
What does a foreign key guarantee?
- [ ] That the column is faster to search
- [x] That the value refers to an existing row in the other table
- [ ] That the column is never NULL
> Referential integrity: the database rejects values that point to nothing.
```

```quiz
Which column is the best primary key for the `customers` table?
- [ ] The customer's email
- [ ] The customer's name
- [x] A generated number with no meaning
> A surrogate key never changes and cannot be confused with anything else, while names and emails can change or be shared.
```

```quiz
What does `NULL = NULL` evaluate to?
- [x] Unknown (NULL), not true
- [ ] True
- [ ] False
> A comparison with NULL gives unknown. To test for a missing value, use `IS NULL`.
```
