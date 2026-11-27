-- Sample shop database used by the exercises of this course (same script as the first chapter).
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
