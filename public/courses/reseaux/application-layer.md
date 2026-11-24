# DNS, HTTP and TLS

> Objectives: explain how names become addresses, how a web exchange works, and what HTTPS adds.

## DNS: the internet's phone book

People remember names, networks route addresses. **DNS** (Domain Name System) translates a name such as `www.example.org` into an IP address. It is a distributed, hierarchical database: no single server knows everything.

A name is read from right to left: the root, then the top-level domain (`org`), then the domain (`example`), then a host (`www`). When your computer needs an address:

1. it asks its configured **resolver** (often your operator's, or a public one);
2. if the resolver has not cached the answer, it asks a **root server**, which points to the servers of `.org`;
3. then the servers of `.org` point to the **authoritative servers** of `example.org`;
4. the authoritative server gives the answer, and the resolver returns it and **caches** it for a duration called the TTL.

Common record types:

| Record | Contains |
|---|---|
| `A` | an IPv4 address |
| `AAAA` | an IPv6 address |
| `CNAME` | an alias to another name |
| `MX` | the mail servers of a domain |
| `TXT` | free text (used for verification and email security) |

Caching makes DNS fast, and also explains why a change can take time to be seen everywhere: old answers live until their TTL expires.

## HTTP: the language of the web

HTTP is a request-response protocol over TCP. A client sends a request, and the server replies.

```text
GET /courses HTTP/1.1
Host: www.example.org
Accept: text/html
```

```text
HTTP/1.1 200 OK
Content-Type: text/html
Content-Length: 5120

<!doctype html> ...
```

A request has a **method**, a **path**, headers and sometimes a body. The main methods:

| Method | Purpose |
|---|---|
| `GET` | read a resource; should not change anything |
| `POST` | send data to create something or trigger an action |
| `PUT` | replace a resource |
| `DELETE` | remove a resource |

The answer starts with a **status code** that tells what happened:

| Code | Meaning |
|---|---|
| 200 | OK |
| 301 / 302 | the resource moved (redirect) |
| 404 | not found |
| 403 | forbidden |
| 500 | the server failed |

The first digit gives the family: 2xx success, 3xx redirection, 4xx the client made an error, 5xx the server made an error.

HTTP itself is **stateless**: each request is independent. Logins are kept with **cookies**, small pieces of data the server asks the browser to send back with each request.

## HTTPS and TLS

Plain HTTP travels in clear: anyone on the path (a Wi-Fi hotspot, an operator) can read or modify it. **HTTPS** is HTTP inside **TLS**, a protocol that provides:

- **confidentiality**: the data is encrypted;
- **integrity**: modifications are detected;
- **authentication**: the server proves its identity with a **certificate**, signed by a certificate authority that your browser trusts.

During the TLS handshake, the client and server agree on algorithms and exchange keys, so that a **shared secret** is established without ever sending it over the network. The rest of the traffic is then encrypted with fast symmetric encryption. The padlock in the browser means: "you are talking to the owner of this domain, and nobody else can read or alter this conversation". It does not mean the site is honest, only that the connection is private and authentic.

## Key takeaways: DNS, HTTP and TLS

- DNS translates names to addresses through a hierarchy of servers and caches answers for their TTL.
- HTTP is a stateless request-response protocol; methods say what to do, status codes say what happened.
- HTTPS = HTTP over TLS: encryption, integrity and server authentication through certificates.

```quiz
A site changed its server address, but some users still reach the old one for a few hours. What is the most likely reason?
- [ ] The routers are broken
- [x] DNS answers are cached until their TTL expires
- [ ] HTTP is stateless
> Resolvers keep old answers for the TTL of the record.
```

```quiz
What does an HTTP status code of 404 mean?
- [ ] The server crashed
- [x] The requested resource was not found
- [ ] The request succeeded
> 4xx codes signal a client-side problem, here a path that does not exist.
```
