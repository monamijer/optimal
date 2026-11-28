# Transactions and ACID

> Objectives: group statements into an atomic unit with a transaction, explain ACID, and recognize the problems that concurrent users can cause.

## Why transactions

Moving 50 from account A to account B takes two statements: subtract from A, add to B. If the server crashes between the two, the money has vanished. A **transaction** groups statements so that they succeed **all together or not at all**.

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

`BEGIN` opens the transaction, `COMMIT` makes every change permanent at once, and `ROLLBACK` cancels them all. Nobody else sees the half-done state in the middle.

Now a transfer that fails. Amina has 50 left, so taking 80 breaks the `CHECK (balance >= 0)` constraint. The statement is rejected, and we cancel the whole transaction:

```sql
BEGIN;
UPDATE accounts SET balance = balance + 80 WHERE id = 2;
-- fails: CHECK constraint
UPDATE accounts SET balance = balance - 80 WHERE id = 1;
```

```sql
ROLLBACK;
```

After the rollback, Brian's balance is back to 70, not 150. Without a transaction, the first `UPDATE` would have stayed in place and 80 would have been created from nothing.

Outside an explicit `BEGIN`, each statement is its own transaction (**autocommit**). PostgreSQL also has `SAVEPOINT` to roll back only a part of a transaction.

## ACID

Reliable databases promise four properties for transactions:

| Letter | Property | Meaning |
|---|---|---|
| **A** | Atomicity | all statements take effect, or none |
| **C** | Consistency | a transaction moves the database from one valid state to another; constraints always hold |
| **I** | Isolation | concurrent transactions do not see each other's unfinished work |
| **D** | Durability | once committed, data survives a crash |

Atomicity and durability are provided by a **write-ahead log**: changes are first written sequentially to a log on disk, then applied to the tables. After a crash, the database replays the log and recovers the committed work. Isolation is the subtle one, and the rest of the chapter is about it.

## What concurrency can break

When two transactions run at the same time, these anomalies can occur if isolation is weak:

| Anomaly | What happens |
|---|---|
| **Dirty read** | you read data another transaction has not committed (and may roll back) |
| **Non-repeatable read** | you read the same row twice and get two different values, because someone committed a change in between |
| **Phantom read** | you run the same query twice and get different **sets of rows**, because someone inserted or deleted matching rows |
| **Lost update** | two transactions read a value, both compute a new one, the second write overwrites the first |

A lost update, as a timeline (both read a balance of 100):

```text
Transaction 1                         Transaction 2
SELECT balance  -> 100
                                      SELECT balance  -> 100
UPDATE balance = 100 + 10  (110)
                                      UPDATE balance = 100 + 20  (120)
COMMIT
                                      COMMIT        -> final 120, the +10 is lost
```

The safest habit is to let the database do the arithmetic in one statement (`SET balance = balance + 10`), or to lock the row when you must read first (see below).

## Isolation levels

The SQL standard defines four levels, from weakest to strongest. Each prevents more anomalies, at the price of more waiting or more retries.

| Level | Dirty read | Non-repeatable read | Phantom read |
|---|---|---|---|
| Read uncommitted | possible | possible | possible |
| Read committed | prevented | possible | possible |
| Repeatable read | prevented | prevented | possible (standard) |
| Serializable | prevented | prevented | prevented |

In PostgreSQL, the default is **Read committed**. Read uncommitted behaves exactly like read committed (dirty reads never happen). Repeatable read is implemented with snapshots, so it also prevents phantoms. Serializable makes the transactions behave as if they ran one after the other, and may abort one of them with a serialization failure, which your code must catch and **retry**.

```sql
-- postgresql-only
BEGIN ISOLATION LEVEL SERIALIZABLE;
-- ... statements ...
COMMIT;
```

## Locking a row

When you must read a value, decide, then write, tell the database that nobody else should change that row in between:

```sql
-- postgresql-only
BEGIN;
SELECT balance FROM accounts WHERE id = 1 FOR UPDATE;
-- other transactions that want to change or lock this row now wait
UPDATE accounts SET balance = balance - 30 WHERE id = 1;
COMMIT;
```

PostgreSQL implements isolation with **MVCC** (multi-version concurrency control): readers see a consistent snapshot while writers create new versions of rows, so reading never blocks writing, and the reverse.

## Deadlocks

Locks introduce a new risk: two transactions waiting for each other.

```text
Transaction 1                          Transaction 2
UPDATE accounts ... WHERE id = 1  (locks row 1)
                                       UPDATE accounts ... WHERE id = 2  (locks row 2)
UPDATE accounts ... WHERE id = 2  (waits for T2)
                                       UPDATE accounts ... WHERE id = 1  (waits for T1)
                                       -> deadlock: neither can continue
```

PostgreSQL detects this and aborts one transaction with a `deadlock detected` error; the other proceeds. Two habits reduce deadlocks: always lock rows **in the same order** in every transaction (for a transfer, lowest account id first), and keep transactions **short**. Never wait for a user's input in the middle of a transaction.

## Key takeaways: transactions and ACID

- A transaction (`BEGIN` ... `COMMIT`/`ROLLBACK`) makes several statements atomic.
- ACID: atomicity, consistency, isolation, durability.
- Concurrency anomalies: dirty read, non-repeatable read, phantom read, lost update.
- Pick the isolation level for your need; be ready to retry on serialization failures and deadlocks.
- Lock in a consistent order and keep transactions short.

```quiz
A transfer subtracts from account A, then the server crashes before adding to account B. With a transaction, what is the state after recovery?
- [ ] A is debited and B is not
- [x] Neither account changed
- [ ] It depends on which statement is faster
> Atomicity: the uncommitted transaction is rolled back during recovery.
```

```quiz
Two transactions each read a balance of 100 and write back 100 + 10 and 100 + 20. The final balance is 120. Which anomaly is this?
- [ ] Dirty read
- [ ] Phantom read
- [x] Lost update
> The second write overwrote the first. A single `SET balance = balance + 10` statement, or `SELECT ... FOR UPDATE`, prevents it.
```

```quiz
Which isolation level is the default in PostgreSQL?
- [x] Read committed
- [ ] Serializable
- [ ] Repeatable read
> PostgreSQL uses Read committed by default: no dirty reads, but non-repeatable reads and phantoms are possible.
```

```quiz
Two transactions each wait for a lock held by the other. What happens, and what reduces the risk?
- [ ] Both wait forever until a client disconnects
- [x] PostgreSQL aborts one with a deadlock error; locking rows in the same order reduces the risk
- [ ] PostgreSQL silently commits both
> PostgreSQL detects the deadlock and aborts one transaction. Consistent lock order and short transactions make it rarer.
```

```quiz
In one transaction you read the same row twice and get two different values, because another transaction committed a change in between. Which anomaly is this?
- [ ] Dirty read
- [ ] Phantom read
- [x] Non-repeatable read
> The same row returned different values. A phantom read would be a different set of rows, and a dirty read involves uncommitted data.
```
