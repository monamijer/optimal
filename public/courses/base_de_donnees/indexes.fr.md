# Index et plans d'exécution

> Objectifs : comprendre ce qu'est un index, créer les bons, et lire un plan d'exécution pour vérifier qu'ils sont utilisés.

## Le problème : le balayage

Sans aide, trouver les commandes du client 3 oblige la base de données à lire **chaque ligne** de `orders` et à tester chacune. C'est un **balayage séquentiel**, et son coût croît avec la taille de la table : O(n). Sans conséquence sur 7 lignes, douloureux sur 70 millions.

## Ce qu'est un index

Un **index** est une structure séparée et triée qui associe des valeurs de colonne aux lignes qui les contiennent, comme l'index à la fin d'un livre. Le type par défaut, le **B-tree**, garde les valeurs triées dans un arbre équilibré, si bien que trouver une valeur prend O(log n) étapes, la même idée que la recherche dichotomique du cours d'algorithmique. Il gère aussi les intervalles (`>`, `BETWEEN`) et le tri.

```sql
CREATE INDEX idx_orders_customer_id ON orders (customer_id);
```

Les clés primaires et les contraintes `UNIQUE` créent déjà un index pour vous. Une clé étrangère n'en crée **pas** dans PostgreSQL : si vous filtrez ou joignez souvent sur `orders.customer_id`, créez l'index vous-même.

## Lire un plan d'exécution

Le **plan d'exécution** est la stratégie choisie par la base de données. Demandez-le avec `EXPLAIN`. Dans SQLite, avant que l'index existe :

```sql
EXPLAIN QUERY PLAN
SELECT * FROM orders WHERE customer_id = 3;
```

La réponse est `SCAN orders` : un balayage complet. Après `CREATE INDEX idx_orders_customer_id`, la même commande répond `SEARCH orders USING INDEX idx_orders_customer_id (customer_id=?)`.

Dans PostgreSQL, `EXPLAIN ANALYZE` va plus loin : il **exécute** la requête et indique les durées réelles à côté des estimations.

```sql
-- postgresql-only
EXPLAIN ANALYZE
SELECT * FROM orders WHERE customer_id = 3;
```

La sortie a cette forme (les nombres varient, ils sont omis ici) :

```text
Index Scan using idx_orders_customer_id on orders  (cost=... rows=... width=...) (actual time=... rows=... loops=1)
  Index Cond: (customer_id = 3)
Planning Time: ... ms
Execution Time: ... ms
```

Les mots à repérer :

| Nœud du plan | Signification |
|---|---|
| `Seq Scan` | lit toute la table |
| `Index Scan` / `Index Only Scan` | parcourt l'index (et éventuellement la table) |
| `Bitmap Heap Scan` | collecte les lignes correspondantes depuis l'index, puis lit la table dans l'ordre |
| `Nested Loop`, `Hash Join`, `Merge Join` | stratégies de jointure |

Deux précautions. `EXPLAIN ANALYZE` exécute réellement l'instruction, donc entourez un `UPDATE` ou un `DELETE` d'une transaction et faites un `ROLLBACK` ensuite. Et un `Seq Scan` n'est pas toujours mauvais : sur une petite table, ou quand la requête a besoin de la plupart des lignes, tout lire est l'option la plus rapide, et le planificateur le sait.

## Index composites

Un index peut couvrir plusieurs colonnes. **L'ordre des colonnes compte** : l'index est trié par la première colonne, puis par la deuxième à l'intérieur de chaque valeur de la première.

```sql
CREATE INDEX idx_orders_status_date ON orders (status, ordered_at);
```

Cet index sert `WHERE status = 'paid' AND ordered_at >= '2026-03-01'`, et aussi `WHERE status = 'paid'` seul (le « préfixe le plus à gauche »). Il n'aide **pas** une requête qui filtre uniquement sur `ordered_at` : cette requête fait toujours `SCAN orders`. Placez d'abord les colonnes testées par égalité, et la colonne d'intervalle en dernier.

## Quand un index n'est pas utilisé

- **Une fonction sur la colonne** : `WHERE lower(name) = 'amina'` ne peut pas utiliser un index simple sur `name`. Créez plutôt un index sur l'expression :

```sql
CREATE INDEX idx_customers_lower_name ON customers (lower(name));
```

- **Faible sélectivité** : un index sur une colonne à deux valeurs (un booléen) aide rarement quand la moitié des lignes correspondent.
- **Un joker en tête** : `LIKE '%son'` ne peut pas utiliser un B-tree ; `LIKE 'Son%'` le peut (avec le bon collationnement).
- **Une incompatibilité de type** ou des statistiques périmées : si le planificateur choisit mal, rafraîchissez-les avec `ANALYZE`.

## Les index ne sont pas gratuits

Chaque index prend de l'espace disque et doit être mis à jour à chaque `INSERT`, `UPDATE` et `DELETE`. Dix index sur une table écrite en permanence ralentissent les écritures. Indexez ce que vous interrogez, vérifiez avec le plan, et supprimez les index que personne n'utilise.

Un **index partiel** ne couvre que certaines lignes et reste petit. Par exemple, pour accélérer la recherche des seules commandes non terminées :

```sql
CREATE INDEX idx_orders_open ON orders (ordered_at) WHERE status <> 'paid';
```

PostgreSQL propose d'autres types d'index pour d'autres besoins : GIN (recherche plein texte, tableaux, JSON), GiST (géométrie), BRIN (très grandes tables ordonnées par date).

## Points clés : index et plans d'exécution

- Un index est une structure triée qui transforme un balayage, O(n), en une recherche, O(log n).
- Créez des index pour les colonnes sur lesquelles vous filtrez, joignez et triez ; les clés étrangères ne sont pas indexées automatiquement dans PostgreSQL.
- Lisez le plan avec `EXPLAIN` (`EXPLAIN ANALYZE` dans PostgreSQL) au lieu de deviner.
- Index composite : colonnes d'égalité d'abord, colonne d'intervalle en dernier ; seul le préfixe le plus à gauche est utilisable.
- Chaque index ralentit les écritures : n'indexez pas tout.

```quiz
Un index composite sur (status, ordered_at). Quelle requête ne peut PAS l'utiliser efficacement ?
- [ ] WHERE status = 'paid'
- [ ] WHERE status = 'paid' AND ordered_at >= '2026-03-01'
- [x] WHERE ordered_at >= '2026-03-01'
> L'index est trié d'abord par status. Sans condition sur sa première colonne, la base de données ne peut pas l'utiliser pour sauter au bon endroit.
```

```quiz
Pourquoi ne pas créer un index sur chaque colonne ?
- [ ] La base de données refuse plus de trois index
- [x] Chaque index consomme de l'espace et doit être mis à jour à chaque écriture, ce qui ralentit les insertions et les mises à jour
- [ ] Les index ralentissent les lectures
> Les index sont un compromis : lectures plus rapides, écritures plus lentes, plus de stockage.
```

```quiz
Quelle requête peut utiliser un index créé avec `CREATE INDEX ... ON customers (lower(name))` ?
- [x] `WHERE lower(name) = 'amina'`
- [ ] `WHERE name = 'Amina'`
- [ ] `WHERE name LIKE '%ina'`
> Un index sur expression sert les requêtes qui utilisent la même expression. Un filtre simple sur `name` ne correspond pas.
```

```quiz
Dans PostgreSQL, vous filtrez et joignez souvent sur `orders.customer_id`, une clé étrangère. Que faut-il faire ?
- [ ] Rien : une clé étrangère crée toujours un index
- [ ] Déclarer la colonne UNIQUE
- [x] Créer vous-même un index dessus
> PostgreSQL n'indexe pas automatiquement les clés étrangères. UNIQUE serait faux ici, car un client a plusieurs commandes.
```
