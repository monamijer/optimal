# Modifier les données et la structure

> Objectifs : ajouter, modifier et supprimer des lignes, définir des tables avec des contraintes, et faire évoluer un schéma en toute sécurité.

## INSERT

`INSERT` ajoute des lignes. Listez toujours les colonnes, afin que l'instruction continue de fonctionner lorsqu'une colonne est ajoutée plus tard.

```sql
INSERT INTO customers (id, name, country)
VALUES (7, 'Grace', 'KE');
```

Plusieurs lignes à la fois s'insèrent avec plusieurs listes de valeurs, ce qui est plus rapide qu'une instruction par ligne. `RETURNING` renvoie la ligne que vous venez d'écrire, ce qui est utile pour connaître une valeur générée :

```sql
INSERT INTO products (id, name, price_cents, category)
VALUES (7, 'Ruler', 200, 'stationery'),
       (8, 'Eraser', 90, 'stationery')
RETURNING id, name;
```

## UPDATE

`UPDATE` modifie des lignes existantes. **La clause `WHERE` décide quelles lignes** : si vous l'oubliez, toutes les lignes changent.

```sql
UPDATE products
SET price_cents = price_cents + 50
WHERE id = 1;
```

Avant d'exécuter un `UPDATE` ou un `DELETE` sur des données réelles, écrivez-le d'abord sous forme de `SELECT` avec le même `WHERE` et vérifiez quelles lignes il renvoie. Exécutez-le ensuite dans une transaction (voir le chapitre sur les transactions), afin qu'une erreur puisse être annulée.

## DELETE

```sql
DELETE FROM products
WHERE id IN (7, 8);
```

`DELETE FROM products;` sans `WHERE` vide la table. La suppression d'une ligne référencée par d'autres lignes est régie par les règles de clé étrangère présentées plus bas.

## Upsert : insérer ou mettre à jour

Pour « insérer, ou mettre à jour si la ligne existe déjà », utilisez `ON CONFLICT` (PostgreSQL et SQLite) :

```sql
INSERT INTO products (id, name, price_cents, category)
VALUES (1, 'Notebook', 500, 'stationery')
ON CONFLICT (id) DO UPDATE SET price_cents = excluded.price_cents;
```

`excluded` désigne la ligne que l'on a tenté d'insérer. L'opération est atomique, contrairement à « vérifier, puis insérer », qui peut échouer lorsque deux clients l'exécutent en même temps.

## CREATE TABLE et contraintes

Les **contraintes** sont des règles que la base de données applique à votre place. Il est bien plus fiable de les déclarer que de faire confiance à chaque programme qui écrit dans la base de données.

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

| Contrainte | Garantit |
|---|---|
| `PRIMARY KEY` | un identifiant unique et non nul |
| `NOT NULL` | une valeur est obligatoire |
| `UNIQUE` | deux lignes ne partagent pas la même valeur (ou combinaison) |
| `CHECK (condition)` | une règle personnalisée sur la ligne |
| `REFERENCES` (clé étrangère) | la valeur existe dans l'autre table |
| `DEFAULT value` | valeur utilisée lorsqu'aucune n'est fournie |

Les violations sont rejetées. La note ci-dessous est hors limites, donc l'instruction échoue et rien n'est écrit :

```sql
-- échoue : contrainte CHECK
INSERT INTO reviews (id, customer_id, product_id, rating)
VALUES (1, 1, 1, 9);
```

De la même façon, un avis pour un client qui n'existe pas est rejeté par la clé étrangère :

```sql
-- échoue : clé étrangère
INSERT INTO reviews (id, customer_id, product_id, rating)
VALUES (2, 999, 1, 5);
```

## Clés étrangères et suppression

Par défaut, vous ne pouvez pas supprimer un client qui a encore des commandes. Vous pouvez choisir un autre comportement lors de la déclaration de la clé étrangère :

```sql
CREATE TABLE wishlist_items (
    customer_id integer NOT NULL REFERENCES customers (id) ON DELETE CASCADE,
    product_id  integer NOT NULL REFERENCES products (id),
    PRIMARY KEY (customer_id, product_id)
);
```

Avec `ON DELETE CASCADE`, supprimer un client supprime aussi les lignes de sa liste de souhaits. Employez-le pour des données qui n'ont aucun sens sans leur parent. Pour des enregistrements métier comme les commandes, conservez le comportement par défaut (refuser), ou préférez marquer les lignes comme inactives.

```sql
-- échoue : le client 1 a encore des commandes
DELETE FROM customers WHERE id = 1;
```

## ALTER TABLE : faire évoluer le schéma

Les besoins changent, les tables doivent donc changer aussi.

```sql
ALTER TABLE customers ADD COLUMN email text;

ALTER TABLE customers RENAME COLUMN email TO contact_email;
```

Ajouter une colonne est peu coûteux. Les autres modifications, comme changer le type d'une colonne, dépendent de chaque système. Dans PostgreSQL :

```sql
-- postgresql-only
ALTER TABLE products ALTER COLUMN price_cents TYPE bigint;
```

Sur une grande table de production, certaines opérations `ALTER TABLE` verrouillent la table ou la réécrivent entièrement. Testez les changements de schéma sur une copie des données, et conservez-les dans des fichiers de **migration** versionnés plutôt que de les saisir à la main.

PostgreSQL propose aussi une colonne d'identité, qui génère la clé pour vous :

```sql
-- postgresql-only
CREATE TABLE tags (
    id   bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name text NOT NULL UNIQUE
);
```

## Points clés : modifier données et structure

- Nommez toujours les colonnes dans `INSERT`, et n'oubliez jamais le `WHERE` de `UPDATE` et `DELETE`.
- Déclarez des contraintes (`NOT NULL`, `UNIQUE`, `CHECK`, clés étrangères) : la base de données protège alors vos données contre tous les programmes.
- `ON CONFLICT` offre un upsert atomique.
- Modifiez les schémas par des migrations versionnées, testées sur une copie.

```quiz
Que fait `UPDATE products SET price_cents = 0;` ?
- [ ] Rien, car il n'y a pas de clause WHERE
- [ ] Il ne met à jour que la première ligne
- [x] Il met le prix de chaque produit à 0
> Sans WHERE, un UPDATE s'applique à toutes les lignes. Vérifiez d'abord avec un SELECT et utilisez une transaction.
```

```quiz
Pourquoi déclarer une contrainte CHECK ou FOREIGN KEY plutôt que de valider uniquement dans l'application ?
- [ ] Les contraintes accélèrent les requêtes
- [x] La base de données les applique pour tous les programmes et tous les utilisateurs, donc aucune donnée incorrecte ne peut entrer
- [ ] Les applications ne peuvent pas valider les données
> Une règle placée dans une application peut être contournée par un autre script, une correction manuelle ou un bogue. Une contrainte, non.
```
