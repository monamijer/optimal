# Why databases exist

> Objectives: explain what a database and a DBMS are, why files are not enough, and how this course is organized.

## From files to databases

Imagine storing a shop's customers in a spreadsheet or a text file. It works at first. Then problems appear:

- two people edit the file at the same time and one change is lost;
- the same customer is typed twice, with two different spellings;
- finding "all orders from Burundi in March" means reading the whole file;
- the program crashes halfway through an update and the file is left half written.

A **database** is an organized collection of data. A **database management system** (DBMS) is the software that stores it and answers questions about it, and that solves the problems above for you: concurrent access, consistency, fast search and crash recovery.

## Kinds of databases

| Family | Data is stored as | Examples | Good at |
|---|---|---|---|
| Relational | tables of rows and columns | PostgreSQL, MySQL, SQLite | structured data, strong consistency, complex queries |
| Document | JSON-like documents | MongoDB | flexible, nested records |
| Key-value | a key and an opaque value | Redis | caching, sessions, very fast lookups |
| Graph | nodes and relationships | Neo4j | highly connected data |

Relational databases are the default choice for most applications, and they are the subject of this course. Their query language, **SQL**, is more than fifty years old and still the most widely used way to talk to data.

## PostgreSQL, MySQL and SQLite

All three are relational and understand SQL, with small differences in dialect:

- **PostgreSQL**: open source, very standards-compliant, rich feature set. The reference for this course.
- **MySQL**: open source, very popular for web applications.
- **SQLite**: a database in a single file with no server, built into phones and browsers. Handy for learning.

Almost everything in this course works on all three. When something is specific to PostgreSQL, the chapter says so.

## How this course is organized

1. **The relational model**: tables, keys and relationships.
2. **Querying with SQL**: `SELECT`, filtering, grouping.
3. **Joining tables**: combining data from several tables.
4. **Changing data and structure**: `INSERT`, `UPDATE`, `DELETE`, constraints.
5. **Normalization**: designing tables that avoid duplication.
6. **Indexes and query plans**: making queries fast.
7. **Transactions and ACID**: keeping data correct under concurrency.
8. **Subqueries, CTEs and window functions**: expressing harder questions.

All examples use the same small online-shop database, introduced in the chapter on querying. You can paste every example into PostgreSQL or SQLite and get the same results.

## Key takeaways: introduction

- A DBMS adds consistency, concurrency control, fast search and crash recovery to plain data storage.
- Relational databases store data in tables and are queried with SQL.
- PostgreSQL is the reference in this course; most of the SQL is portable.

```quiz
What is the main job of a DBMS compared with a plain file?
- [ ] It makes data smaller
- [x] It manages concurrent access, consistency, fast search and crash recovery
- [ ] It replaces the need to design data
> A file only stores bytes. A DBMS guarantees rules about the data and answers queries efficiently.
```

```quiz
Which of these is a relational database?
- [ ] Redis
- [x] PostgreSQL
- [ ] Neo4j
> PostgreSQL stores data in tables and uses SQL. Redis is key-value and Neo4j is a graph database.
```

```quiz
Which kind of database fits a cache of user sessions that needs very fast lookups by key?
- [ ] Graph
- [x] Key-value
- [ ] Document
> Key-value stores such as Redis keep a key and an opaque value, which makes them ideal for caching and sessions.
```

```quiz
Which statement about SQLite is correct?
- [x] It is a database stored in a single file, with no server
- [ ] It is a document database like MongoDB
- [ ] It does not understand SQL
> SQLite is a relational database in a single file with no server, which makes it handy for learning.
```
