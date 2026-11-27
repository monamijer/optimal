# Transactions et ACID

> Objectifs : regrouper des instructions en une unité atomique avec une transaction, expliquer ACID, et reconnaître les problèmes que peuvent causer des utilisateurs concurrents.

## Pourquoi des transactions

Transférer 50 du compte A vers le compte B demande deux instructions : soustraire de A, ajouter à B. Si le serveur plante entre les deux, l'argent a disparu. Une **transaction** regroupe des instructions pour qu'elles réussissent **toutes ensemble ou pas du tout**.

```sql
CREATE TABLE accounts (
    id      integer PRIMARY KEY,
    owner   text NOT NULL,
    balance integer NOT NULL CHECK (balance >= 0)
);

INSERT INTO accounts (id, owner, balance) VALUES (1, 'Amina', 100), (2, 'Brian', 20);
```

```sql
BEGIN;
UPDATE accounts SET balance = balance - 50 WHERE id = 1;
UPDATE accounts SET balance = balance + 50 WHERE id = 2;
COMMIT;
```

`BEGIN` ouvre la transaction, `COMMIT` rend tous les changements permanents d'un coup, et `ROLLBACK` les annule tous. Personne d'autre ne voit l'état à moitié terminé au milieu.

Voyons maintenant un transfert qui échoue. Amina a 50 de reste, donc en retirer 80 viole la contrainte `CHECK (balance >= 0)`. L'instruction est rejetée, et nous annulons toute la transaction :

```sql
BEGIN;
UPDATE accounts SET balance = balance + 80 WHERE id = 2;
-- échoue : contrainte CHECK
UPDATE accounts SET balance = balance - 80 WHERE id = 1;
```

```sql
ROLLBACK;
```

Après l'annulation, le solde de Brian est revenu à 70, et non 150. Sans transaction, le premier `UPDATE` serait resté en place et 80 auraient été créés à partir de rien.

En dehors d'un `BEGIN` explicite, chaque instruction est sa propre transaction (**autocommit**). PostgreSQL propose aussi `SAVEPOINT` pour n'annuler qu'une partie d'une transaction.

## ACID

Les bases de données fiables promettent quatre propriétés pour les transactions :

| Lettre | Propriété | Signification |
|---|---|---|
| **A** | Atomicité | toutes les instructions prennent effet, ou aucune |
| **C** | Cohérence | une transaction fait passer la base de données d'un état valide à un autre ; les contraintes sont toujours respectées |
| **I** | Isolation | les transactions concurrentes ne voient pas le travail inachevé les unes des autres |
| **D** | Durabilité | une fois validées, les données survivent à un plantage |

L'atomicité et la durabilité sont assurées par un **journal d'écriture anticipée** (write-ahead log) : les changements sont d'abord écrits séquentiellement dans un journal sur disque, puis appliqués aux tables. Après un plantage, la base de données rejoue le journal et récupère le travail validé. L'isolation est la plus subtile, et le reste du chapitre lui est consacré.

## Ce que la concurrence peut casser

Quand deux transactions s'exécutent en même temps, ces anomalies peuvent survenir si l'isolation est faible :

| Anomalie | Ce qui se passe |
|---|---|
| **Lecture sale** | vous lisez des données qu'une autre transaction n'a pas validées (et qu'elle peut annuler) |
| **Lecture non répétable** | vous lisez deux fois la même ligne et obtenez deux valeurs différentes, parce que quelqu'un a validé un changement entre-temps |
| **Lecture fantôme** | vous exécutez deux fois la même requête et obtenez des **ensembles de lignes** différents, parce que quelqu'un a inséré ou supprimé des lignes correspondantes |
| **Mise à jour perdue** | deux transactions lisent une valeur, calculent chacune une nouvelle valeur, la seconde écriture écrase la première |

Une mise à jour perdue, sous forme de chronologie (les deux lisent un solde de 100) :

```text
Transaction 1                         Transaction 2
SELECT balance  -> 100
                                      SELECT balance  -> 100
UPDATE balance = 100 + 10  (110)
                                      UPDATE balance = 100 + 20  (120)
COMMIT
                                      COMMIT        -> final 120, le +10 est perdu
```

L'habitude la plus sûre est de laisser la base de données faire le calcul en une seule instruction (`SET balance = balance + 10`), ou de verrouiller la ligne quand vous devez lire d'abord (voir plus bas).

## Niveaux d'isolation

Le standard SQL définit quatre niveaux, du plus faible au plus fort. Chacun prévient plus d'anomalies, au prix de plus d'attente ou de plus de nouvelles tentatives.

| Niveau | Lecture sale | Lecture non répétable | Lecture fantôme |
|---|---|---|---|
| Read uncommitted | possible | possible | possible |
| Read committed | empêchée | possible | possible |
| Repeatable read | empêchée | empêchée | possible (standard) |
| Serializable | empêchée | empêchée | empêchée |

Dans PostgreSQL, le niveau par défaut est **Read committed**. Read uncommitted se comporte exactement comme read committed (les lectures sales n'arrivent jamais). Repeatable read est implémenté avec des instantanés (snapshots), donc il empêche aussi les fantômes. Serializable fait se comporter les transactions comme si elles s'exécutaient l'une après l'autre, et peut en annuler une avec un échec de sérialisation, que votre code doit intercepter et **réessayer**.

```sql
-- postgresql-only
BEGIN ISOLATION LEVEL SERIALIZABLE;
-- ... instructions ...
COMMIT;
```

## Verrouiller une ligne

Quand vous devez lire une valeur, décider, puis écrire, indiquez à la base de données que personne d'autre ne doit modifier cette ligne entre-temps :

```sql
-- postgresql-only
BEGIN;
SELECT balance FROM accounts WHERE id = 1 FOR UPDATE;
-- les autres transactions qui veulent modifier ou verrouiller cette ligne attendent maintenant
UPDATE accounts SET balance = balance - 30 WHERE id = 1;
COMMIT;
```

PostgreSQL implémente l'isolation avec **MVCC** (multi-version concurrency control, contrôle de concurrence multiversion) : les lecteurs voient un instantané cohérent tandis que les écrivains créent de nouvelles versions des lignes, si bien que lire ne bloque jamais écrire, et inversement.

## Interblocages

Les verrous introduisent un nouveau risque : deux transactions qui s'attendent mutuellement.

```text
Transaction 1                          Transaction 2
UPDATE accounts ... WHERE id = 1  (verrouille la ligne 1)
                                       UPDATE accounts ... WHERE id = 2  (verrouille la ligne 2)
UPDATE accounts ... WHERE id = 2  (attend T2)
                                       UPDATE accounts ... WHERE id = 1  (attend T1)
                                       -> interblocage : aucune ne peut continuer
```

PostgreSQL détecte cette situation et annule une transaction avec une erreur `deadlock detected` ; l'autre continue. Deux habitudes réduisent les interblocages : verrouillez toujours les lignes **dans le même ordre** dans chaque transaction (pour un transfert, l'identifiant de compte le plus petit d'abord), et gardez les transactions **courtes**. N'attendez jamais la saisie d'un utilisateur au milieu d'une transaction.

## Pratique : les transactions

Essayez-les dans l'éditeur sous chaque question. **Vérifier** compare votre résultat à celui attendu ; **Exécuter** montre seulement ce que renvoie votre requête.

```exercise
Ouvrez une transaction, supprimez toutes les lignes de `order_items`, puis changez d'avis et annulez. Après votre script, `order_items` doit être inchangée.
--- setup
@include sample.sql
--- starter
BEGIN;
-- your statements
--- solution
BEGIN; DELETE FROM order_items; ROLLBACK;
--- check
SELECT COUNT(*) FROM order_items;
--- hint
ROLLBACK termine la transaction et annule ses changements.
```

```exercise
Transférez 30 du compte 1 vers le compte 2 de sorte que les deux mises à jour réussissent ensemble ou pas du tout. Utilisez une transaction et validez-la.
--- setup
CREATE TABLE accounts (id integer PRIMARY KEY, balance integer NOT NULL);
INSERT INTO accounts VALUES (1, 100), (2, 50);
--- starter
-- accounts(id, balance)
BEGIN;
--- solution
BEGIN; UPDATE accounts SET balance = balance - 30 WHERE id = 1; UPDATE accounts SET balance = balance + 30 WHERE id = 2; COMMIT;
--- check
SELECT id, balance FROM accounts ORDER BY id;
--- hint
Deux UPDATE entre BEGIN et COMMIT.
```

```exercise
Dans une seule transaction : passez la commande 1 à `cancelled`, créez un point de sauvegarde nommé `sp`, supprimez les lignes de la commande 1, annulez seulement la suppression avec `ROLLBACK TO sp`, puis validez. Le changement de statut doit rester et les lignes aussi.
--- setup
@include sample.sql
--- starter
BEGIN;
-- SAVEPOINT sp; ... ROLLBACK TO sp;
--- solution
BEGIN; UPDATE orders SET status = 'cancelled' WHERE id = 1; SAVEPOINT sp; DELETE FROM order_items WHERE order_id = 1; ROLLBACK TO sp; COMMIT;
--- check
SELECT (SELECT status FROM orders WHERE id = 1), (SELECT COUNT(*) FROM order_items WHERE order_id = 1);
--- hint
ROLLBACK TO sp annule tout ce qui suit le point de sauvegarde, pas toute la transaction.
```

## Points clés : transactions et ACID

- Une transaction (`BEGIN` ... `COMMIT`/`ROLLBACK`) rend plusieurs instructions atomiques.
- ACID : atomicité, cohérence, isolation, durabilité.
- Anomalies de concurrence : lecture sale, lecture non répétable, lecture fantôme, mise à jour perdue.
- Choisissez le niveau d'isolation selon votre besoin ; soyez prêt à réessayer en cas d'échec de sérialisation et d'interblocage.
- Verrouillez dans un ordre cohérent et gardez les transactions courtes.

```quiz
Un transfert soustrait du compte A, puis le serveur plante avant d'ajouter au compte B. Avec une transaction, quel est l'état après la récupération ?
- [ ] A est débité et B ne l'est pas
- [x] Aucun des deux comptes n'a changé
- [ ] Cela dépend de l'instruction la plus rapide
> Atomicité : la transaction non validée est annulée pendant la récupération.
```

```quiz
Deux transactions lisent chacune un solde de 100 et réécrivent 100 + 10 et 100 + 20. Le solde final est 120. De quelle anomalie s'agit-il ?
- [ ] Lecture sale
- [ ] Lecture fantôme
- [x] Mise à jour perdue
> La seconde écriture a écrasé la première. Une seule instruction `SET balance = balance + 10`, ou `SELECT ... FOR UPDATE`, l'empêche.
```
