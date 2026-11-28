# Concevoir ses tables : la normalisation

> Objectifs : reconnaître les problèmes d'une table mal conçue, appliquer les trois premières formes normales et savoir quand enfreindre les règles volontairement.

## Une table qui tourne mal

Un débutant pourrait stocker chaque ligne de commande dans une seule grande table :

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

Tout est au même endroit, ce qui semble pratique, mais trois types de problèmes apparaissent :

- **Anomalie de mise à jour** : l'e-mail d'Amina est stocké sur chaque ligne. Modifiez-le dans une ligne et oubliez-en une autre, et les données se contredisent. Regardez : la ligne 3 a déjà une orthographe différente.
- **Anomalie d'insertion** : vous ne pouvez pas enregistrer un nouveau produit tant que personne ne l'a commandé, car une ligne a besoin d'une commande.
- **Anomalie de suppression** : supprimez l'unique commande de Brian et vous perdez aussi le fait que le Notebook coûte 450.

La base de données ne peut même pas remarquer la contradiction par elle-même. Nous pouvons la trouver avec une requête :

```sql
SELECT customer_name, count(DISTINCT customer_email) AS emails
FROM orders_flat
GROUP BY customer_name
HAVING count(DISTINCT customer_email) > 1;
```

Cette requête renvoie Amina avec 2 e-mails différents. La **normalisation** est la méthode qui supprime ces problèmes en donnant à chaque fait un seul foyer.

## Première forme normale (1NF) : une valeur par cellule

Chaque cellule contient une seule valeur atomique, et il n'y a pas de groupes répétés. Une colonne `products` contenant `"Notebook, Pen"` enfreint la 1NF : vous ne pouvez pas rechercher, compter ou contraindre correctement les éléments. La solution est une ligne par élément, ce qui est exactement le rôle de la table de jonction `order_items`.

## Deuxième forme normale (2NF) : dépendre de toute la clé

S'applique aux tables dont la clé comporte plusieurs colonnes. Chaque colonne hors clé doit dépendre de la clé **entière**, et pas seulement d'une partie. Dans `orders_flat`, la clé est `(order_id, product_name)`, mais `product_price` dépend uniquement du produit, et `customer_name` dépend uniquement de la commande. Ce sont des dépendances partielles. La solution est de les extraire : les faits sur le produit dans `products`, les faits sur la commande dans `orders`.

## Troisième forme normale (3NF) : ne dépendre que de la clé

Les colonnes hors clé ne doivent pas dépendre d'autres colonnes hors clé. Si `orders` stockait `customer_id`, `customer_name` et `customer_email`, le nom et l'e-mail dépendraient de `customer_id` plutôt que de la commande : c'est une dépendance transitive. La solution est de ne garder que `customer_id` dans `orders`, et de placer le nom et l'e-mail dans `customers`.

Un résumé pratique : chaque colonne hors clé doit dépendre de **la clé, de toute la clé, et de rien d'autre que la clé**.

## Le résultat

L'application des trois règles à `orders_flat` donne exactement la base de données d'exemple de ce cours :

| Fait | Se trouve dans |
|---|---|
| le nom, l'e-mail, le pays d'un client | `customers` |
| le nom, le prix, la catégorie d'un produit | `products` |
| qui a commandé, quand, statut | `orders` |
| quels produits, en quelle quantité | `order_items` |

Chaque fait est stocké une seule fois. Changer un prix ou un e-mail est une mise à jour d'une seule ligne, et les clés étrangères garantissent que les références restent valides. Le coût : lire une commande demande des jointures, ce dont parlait le chapitre précédent.

## Dénormalisation : enfreindre les règles volontairement

La normalisation favorise l'exactitude et la facilité d'écriture. Parfois la lecture domine, et le coût de nombreuses jointures compte. Vous pouvez alors **dénormaliser** délibérément : par exemple stocker `orders.total_cents` comme copie de la somme des lignes, afin qu'un tableau de bord ne la recalcule pas pour des millions de commandes.

Ne le faites que si vous avez mesuré un vrai problème, et souvenez-vous du prix : la copie doit être tenue à jour (par l'application, un déclencheur ou une vue matérialisée), sinon elle dérivera. Normalisez d'abord, dénormalisez avec des preuves.

Une exception historique mérite d'être connue : les montants d'argent sur une ligne de commande. Le prix d'un produit change avec le temps, mais une ancienne commande doit conserver le prix payé à ce moment-là. Donc `order_items` devrait en pratique stocker son propre `unit_price_cents`. Ce n'est pas de la redondance, c'est un fait différent : « le prix au moment de l'achat ».

## Points clés : la normalisation

- Les faits dupliqués causent des anomalies de mise à jour, d'insertion et de suppression.
- 1NF : valeurs atomiques. 2NF : dépendre de toute la clé. 3NF : ne dépendre que de la clé.
- Stockez chaque fait à un seul endroit, reliez les tables avec des clés étrangères.
- Ne dénormalisez qu'après avoir mesuré, et gardez les copies synchronisées.

```quiz
Une table `orders` contient `customer_id`, `customer_name` et `customer_email`. Quelle forme normale enfreint-elle, et quelle est la solution ?
- [ ] 1NF : séparer le nom en deux colonnes
- [x] 3NF : le nom et l'e-mail dépendent de customer_id, donc il faut les déplacer dans une table `customers`
- [ ] Aucune, c'est la conception recommandée
> Le nom et l'e-mail sont des faits sur le client, pas sur la commande. Les stocker dans orders les répète et ouvre la porte aux incohérences.
```

```quiz
Quand la dénormalisation est-elle justifiée ?
- [ ] Toujours, parce que les jointures sont lentes
- [ ] Jamais, la normalisation est une loi
- [x] Quand les mesures montrent un goulot d'étranglement en lecture, et que vous pouvez garder les données redondantes synchronisées
> La dénormalisation échange la simplicité d'écriture et la cohérence contre la vitesse de lecture. C'est une optimisation, pas un point de départ.
```

```quiz
Une colonne `products` contient le texte `Notebook, Pen`. Quelle forme normale viole-t-elle ?
- [x] La 1NF, car la cellule n'est pas atomique
- [ ] La 2NF, à cause d'une dépendance partielle
- [ ] La 3NF, à cause d'une dépendance transitive
> La première forme normale exige une valeur atomique par cellule. La solution est une ligne par élément, comme dans une table de jonction.
```

```quiz
Pourquoi `order_items` devrait-il stocker son propre `unit_price_cents` alors que `products` contient déjà un prix ?
- [ ] Parce que la 3NF impose une colonne de prix dans chaque table
- [x] Parce que c'est un autre fait : le prix au moment de l'achat
- [ ] Pour éviter de déclarer une clé étrangère
> Le prix d'un produit change avec le temps, mais une ancienne commande doit garder le prix réellement payé. Ce n'est pas de la redondance.
```
