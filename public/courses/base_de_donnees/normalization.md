# Designing tables: normalization

> Objectives: recognize the problems of a badly designed table, apply the first three normal forms, and know when to break the rules on purpose.

## A table that goes wrong

A beginner might store each order line in one big table:

```sql
CREATE TABLE orders_flat (
    order_id         integer,
    customer_name    text,
    customer_email   text,
    product_name     text,
    product_price    integer,
    quantity         integer
);

INSERT INTO orders_flat VALUES
    (1, 'Amina', 'amina@example.org', 'Notebook', 450, 2),
    (1, 'Amina', 'amina@example.org', 'Pen',      120, 3),
    (2, 'Amina', 'amina@exemple.org', 'Backpack', 3900, 1),
    (3, 'Brian', 'brian@example.org', 'Notebook', 450, 1);
```

Everything is in one place, which looks convenient, but three kinds of problems appear:

- **Update anomaly**: Amina's email is stored on every line. Change it in one row and forget another, and the data contradicts itself. Look: row 3 already has a different spelling.
- **Insert anomaly**: you cannot record a new product until someone orders it, because a row needs an order.
- **Delete anomaly**: delete Brian's only order and you also lose the fact that the Notebook costs 450.

The database cannot even notice the contradiction by itself. We can find it with a query:

```sql
SELECT customer_name, count(DISTINCT customer_email) AS emails
FROM orders_flat
GROUP BY customer_name
HAVING count(DISTINCT customer_email) > 1;
```

This returns Amina with 2 different emails. **Normalization** is the method that removes these problems by giving each fact a single home.

## First normal form (1NF): one value per cell

Each cell holds a single atomic value, and there are no repeating groups. A column `products` containing `"Notebook, Pen"` breaks 1NF: you cannot search, count or constrain the items properly. The fix is one row per item, which is exactly the role of the junction table `order_items`.

## Second normal form (2NF): depend on the whole key

Applies to tables whose key has several columns. Every non-key column must depend on the **whole** key, not just a part of it. In `orders_flat`, the key is `(order_id, product_name)`, but `product_price` depends only on the product, and `customer_name` depends only on the order. These are partial dependencies. The fix is to move them out: product facts into `products`, order facts into `orders`.

## Third normal form (3NF): depend on nothing but the key

Non-key columns must not depend on other non-key columns. If `orders` stored `customer_id`, `customer_name` and `customer_email`, the name and email depend on `customer_id` rather than on the order: a transitive dependency. The fix is to keep only `customer_id` in `orders`, and put name and email in `customers`.

A handy summary: every non-key column must depend on **the key, the whole key, and nothing but the key**.

## The result

Applying the three rules to `orders_flat` gives exactly the sample database of this course:

| Fact | Lives in |
|---|---|
| a customer's name, email, country | `customers` |
| a product's name, price, category | `products` |
| who ordered, when, status | `orders` |
| which products, how many | `order_items` |

Each fact is stored once. Changing a price or an email is a one-row update, and the foreign keys guarantee that references stay valid. The cost: reading an order needs joins, which is what the previous chapter was about.

## Denormalization: breaking the rules on purpose

Normalization favors correctness and easy writes. Sometimes reads dominate, and the cost of many joins matters. Then you may **denormalize** deliberately: for example store `orders.total_cents` as a copy of the sum of the items, so that a dashboard does not recompute it for millions of orders.

Do it only when you have measured a real problem, and remember the price: the copy must be kept in sync (by the application, a trigger, or a materialized view), or it will drift. Normalize first, denormalize with evidence.

One historic exception is worth knowing: money amounts on an order line. The price of a product changes over time, but an old order must keep the price paid at that time. So `order_items` should in practice store its own `unit_price_cents`. This is not redundancy, it is a different fact: "the price at the moment of purchase".

## Key takeaways: normalization

- Duplicated facts cause update, insert and delete anomalies.
- 1NF: atomic values. 2NF: depend on the whole key. 3NF: depend on nothing but the key.
- Store each fact in one place, link tables with foreign keys.
- Denormalize only after measuring, and keep the copies in sync.

```quiz
A table `orders` contains `customer_id`, `customer_name` and `customer_email`. Which normal form does it violate, and what is the fix?
- [ ] 1NF: split the name in two columns
- [x] 3NF: name and email depend on customer_id, so move them to a `customers` table
- [ ] None, this is the recommended design
> The name and email are facts about the customer, not about the order. Storing them in orders repeats them and invites inconsistencies.
```

```quiz
When is denormalization justified?
- [ ] Always, because joins are slow
- [ ] Never, normalization is a law
- [x] When measurements show a read bottleneck, and you can keep the redundant data in sync
> Denormalization trades write simplicity and consistency for read speed. It is an optimization, not a starting point.
```
