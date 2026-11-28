# Joindre des tables

> Objectifs : combiner les lignes de plusieurs tables avec `JOIN`, choisir entre jointures internes et externes, et éviter l'erreur classique du double comptage.

## Pourquoi joindre

Les données sont réparties entre plusieurs tables pour éviter les doublons : une commande stocke un `customer_id`, pas le nom du client. Pour afficher le nom à côté de la commande, on **joint** les deux tables sur la clé correspondante.

## INNER JOIN

Une jointure interne ne conserve que les paires de lignes qui satisfont la condition `ON`.

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

`JOIN` seul signifie `INNER JOIN`. On donne à chaque table un **alias** court (`c`, `o`) et on préfixe les colonnes avec celui-ci, ce qui garde la requête lisible et lève l'ambiguïté lorsque deux tables ont une colonne de même nom. Farid est absent du résultat : il n'a aucune commande, donc aucune ligne ne correspond.

## LEFT JOIN

Une jointure gauche conserve **toutes** les lignes de la table de gauche. Lorsqu'il n'y a pas de correspondance à droite, les colonnes de droite valent `NULL`.

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

Farid apparaît maintenant, avec 0. Remarquez que l'on compte `o.id` et non `*` : `count(*)` compterait la ligne de Farid comme 1, alors que `count(o.id)` ignore `NULL`.

Un motif très utile est l'**anti-jointure** : trouver les lignes sans correspondance, en ne gardant que celles dont le côté droit vaut `NULL`.

```sql
SELECT c.name
FROM customers AS c
LEFT JOIN orders AS o ON o.customer_id = c.id
WHERE o.id IS NULL;
```

Cette requête renvoie Farid, le client qui n'a jamais commandé.

## Joindre plus de deux tables

Enchaînez les jointures, avec un `ON` par jointure. Pour calculer le total de chaque commande, on passe de `orders` à `order_items`, puis à `products` pour le prix :

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

Quels produits ont réellement été vendus (commandes annulées exclues), et en quelle quantité ?

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

Headphones est absent parce que rien ne le référence. Pour l'afficher avec 0 vente, `products` doit se trouver à gauche d'un `LEFT JOIN`.

## Panorama des types de jointures

| Jointure | Conserve |
|---|---|
| `INNER JOIN` | uniquement les paires qui correspondent |
| `LEFT JOIN` | toutes les lignes de gauche, avec les lignes de droite correspondantes ou `NULL` |
| `RIGHT JOIN` | toutes les lignes de droite (une jointure gauche avec les tables inversées ; rarement nécessaire) |
| `FULL JOIN` | toutes les lignes des deux côtés (non disponible dans SQLite avant la version 3.39) |
| `CROSS JOIN` | toutes les combinaisons de lignes de gauche et de droite |

Une **auto-jointure** joint une table avec elle-même, en utilisant deux alias. On l'emploie pour les hiérarchies, comme une table `employees` dont chaque ligne possède un `manager_id` pointant vers un autre employé.

## Le piège du double comptage

Lorsque vous joignez une table à **deux** tables « plusieurs » différentes, ou lorsque vous agrégez une colonne du côté « un » après avoir joint le côté « plusieurs », des lignes sont répétées. Comptez les commandes après avoir joint leurs articles :

```sql
SELECT count(*) AS rows_returned,
       count(DISTINCT o.id) AS real_orders
FROM orders AS o
JOIN order_items AS oi ON oi.order_id = o.id;
```

Le résultat est de 12 lignes mais de seulement 7 commandes, car une commande de trois articles apparaît trois fois. La même erreur gonfle silencieusement les sommes : additionner `orders.amount` après avoir joint `order_items` compte le montant une fois par article. Demandez-vous toujours : **que représente une ligne de mon résultat ?**, et agrégez à ce niveau (par exemple dans une sous-requête, voir le dernier chapitre).

## Pratique : les jointures

Essayez-les dans l'éditeur sous chaque question. **Vérifier** compare votre résultat à celui attendu ; **Exécuter** montre seulement ce que renvoie votre requête.

```exercise
Listez chaque commande payée (`status = 'paid'`) avec le nom du client qui l'a passée. Deux colonnes : l'identifiant de la commande et le nom du client.
--- setup
@include sample.sql
--- starter
-- orders(id, customer_id, status), customers(id, name)
SELECT
--- solution
SELECT o.id, c.name FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.status = 'paid';
--- hint
Joignez orders à customers sur customer_id = customers.id.
```

```exercise
Trouvez les clients qui n'ont jamais passé de commande. Une seule colonne : le nom.
--- setup
@include sample.sql
--- starter
-- customers(id, name), orders(customer_id)
SELECT
--- solution
SELECT c.name FROM customers c LEFT JOIN orders o ON o.customer_id = c.id WHERE o.id IS NULL;
--- hint
Un LEFT JOIN garde les clients sans commande ; leurs colonnes de commande valent NULL.
```

```exercise
Pour chaque client qui a commandé, calculez le nombre total d'articles achetés (la somme de `quantity` sur toutes ses commandes). Deux colonnes : le nom et le total, le plus grand total en premier.
--- setup
@include sample.sql
--- starter
-- customers, orders, order_items(order_id, product_id, quantity)
SELECT
--- solution
SELECT c.name, SUM(oi.quantity) AS items FROM customers c JOIN orders o ON o.customer_id = c.id JOIN order_items oi ON oi.order_id = o.id GROUP BY c.id, c.name ORDER BY items DESC, c.name;
--- hint
Enchaînez deux jointures, puis GROUP BY sur le client.
```

## Points clés : les jointures

- `JOIN ... ON` combine les lignes de deux tables qui correspondent sur une clé.
- Utilisez `LEFT JOIN` pour conserver les lignes sans correspondance ; `WHERE right.id IS NULL` permet de les trouver.
- Comptez une colonne de la table de droite (`count(o.id)`), et non `count(*)`, après une jointure gauche.
- Une jointure multiplie les lignes : vérifiez ce que représente une ligne de résultat avant d'agréger.

```quiz
Quelle requête liste les clients qui n'ont jamais passé de commande ?
- [ ] SELECT name FROM customers JOIN orders ON orders.customer_id = customers.id
- [x] SELECT c.name FROM customers c LEFT JOIN orders o ON o.customer_id = c.id WHERE o.id IS NULL
- [ ] SELECT name FROM customers WHERE id = NULL
> La jointure gauche conserve tous les clients ; ceux sans commande ont NULL dans les colonnes de la commande.
```

```quiz
Après un LEFT JOIN, pourquoi préférer `count(o.id)` à `count(*)` ?
- [ ] C'est plus rapide
- [x] `count(*)` compte aussi les lignes sans correspondance, ce qui donne 1 au lieu de 0
- [ ] `count(*)` n'est pas autorisé avec les jointures
> count(colonne) ignore NULL, donc un client sans commande obtient correctement 0.
```

```quiz
Après avoir joint `orders` à `order_items`, `count(*)` renvoie 12 alors qu'il n'y a que 7 commandes. Pourquoi ?
- [ ] La jointure ajoute une ligne NULL pour chaque commande
- [ ] Cinq commandes sont dupliquées dans la table orders
- [x] Une commande de plusieurs articles apparaît une fois par article
> Une jointure multiplie les lignes du côté « plusieurs ». Utilisez `count(DISTINCT o.id)` pour compter les vraies commandes.
```

```quiz
Quelle requête liste tous les produits, y compris Headphones qui n'a jamais été vendu ?
- [x] `FROM products p LEFT JOIN order_items oi ON oi.product_id = p.id`
- [ ] `FROM products p JOIN order_items oi ON oi.product_id = p.id`
- [ ] `FROM order_items oi LEFT JOIN products p ON p.id = oi.product_id`
> Pour garder tous les produits, `products` doit être à gauche d'un LEFT JOIN. Les produits invendus ont NULL dans les colonnes des lignes de commande.
```

```quiz
Dans un INNER JOIN entre `customers` et `orders`, que devient Farid, qui n'a aucune commande ?
- [ ] Il apparaît avec des colonnes de commande à NULL
- [x] Il n'apparaît pas dans le résultat
- [ ] Il apparaît avec un nombre de commandes égal à 0
> Une jointure interne ne garde que les paires de lignes qui correspondent. Sans commande, il n'y a pas de paire pour Farid.
```
