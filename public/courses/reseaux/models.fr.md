# Les couches : les modèles OSI et TCP/IP

> Objectifs : expliquer pourquoi les réseaux sont organisés en couches, et placer les protocoles et appareils courants dans la bonne couche.

## Pourquoi des couches

Envoyer un e-mail fait intervenir des fils, des adresses, de la fiabilité, du chiffrement et une application. Un protocole géant qui ferait tout serait impossible à construire et à faire évoluer. À la place, les réseaux sont découpés en **couches**. Chaque couche rend un service à la couche du dessus et s'appuie sur celle du dessous, et ne connaît rien des détails des autres. Le Wi-Fi peut remplacer Ethernet sans changer votre navigateur web.

## Le modèle TCP/IP

Le modèle réellement utilisé par internet comporte quatre couches :

| Couche | Rôle | Exemples | Unité de données |
|---|---|---|---|
| Application | ce que les programmes se disent | HTTP, DNS, SMTP, SSH | message |
| Transport | livraison entre programmes | TCP, UDP | segment (TCP), datagramme (UDP) |
| Internet | adressage et routage entre réseaux | IP, ICMP | paquet |
| Liaison | livraison sur un réseau local | Ethernet, Wi-Fi | trame |

## Le modèle OSI

Le modèle OSI est une référence pédagogique à sept couches. Vous rencontrerez ses numéros dans les conversations courantes (« un commutateur de couche 2 », « un pare-feu de couche 7 ») :

| N° | Couche OSI | Correspond à TCP/IP |
|---|---|---|
| 7 | Application | Application |
| 6 | Présentation (formats, chiffrement) | Application |
| 5 | Session (dialogues) | Application |
| 4 | Transport | Transport |
| 3 | Réseau | Internet |
| 2 | Liaison de données | Liaison |
| 1 | Physique (signaux, câbles) | Liaison |

## L'encapsulation

Quand les données descendent les couches, chaque couche les enveloppe avec son propre en-tête (et parfois une queue). C'est l'**encapsulation** :

```text
Application:  [ HTTP request ]
Transport:    [ TCP header | HTTP request ]
Internet:     [ IP header | TCP header | HTTP request ]
Link:         [ Ethernet header | IP header | TCP header | HTTP request | trailer ]
```

À l'arrivée, chaque couche lit son propre en-tête, le retire et transmet le reste vers le haut. Un commutateur ne lit que l'en-tête Ethernet, un routeur monte jusqu'à l'en-tête IP, et seuls les hôtes d'extrémité examinent TCP et HTTP. C'est pourquoi le même internet peut transporter n'importe quelle application.

## Les adresses à chaque couche

Le même message utilise une adresse différente à chaque couche, car chaque couche répond à une question différente :

| Couche | Adresse | Répond à |
|---|---|---|
| Application | nom, comme `example.org` | quel service ? |
| Transport | numéro de port, comme 443 | quel programme sur la machine ? |
| Internet | adresse IP | quelle machine dans le monde ? |
| Liaison | adresse MAC | quelle carte réseau sur ce réseau local ? |

Une adresse MAC (48 bits, écrite `3c:52:82:aa:10:0b`) n'a de sens que sur un seul réseau local. Une adresse IP sert à traverser les réseaux. À chaque saut, les adresses IP restent les mêmes tandis que les adresses MAC changent.

## Points clés : les couches

- Les couches masquent les détails : chacune sert la couche du dessus et utilise celle du dessous.
- TCP/IP a quatre couches (application, transport, internet, liaison) ; OSI en a sept et sert de vocabulaire.
- Encapsulation : chaque couche ajoute son propre en-tête en descendant et le retire en remontant.
- Le nom, le port, l'adresse IP et l'adresse MAC répondent à quatre questions différentes.

```quiz
À quelle couche TCP/IP un routeur travaille-t-il principalement ?
- [ ] Liaison
- [x] Internet
- [ ] Application
> Un routeur lit l'en-tête IP pour décider où envoyer un paquet.
```

```quiz
Qu'est-ce que l'encapsulation ?
- [ ] Chiffrer les données
- [x] Chaque couche enveloppe les données avec son propre en-tête en descendant
- [ ] Compresser les paquets
> Chaque couche ajoute un en-tête que seule la même couche de l'autre côté lit.
```

```quiz
Un paquet traverse trois routeurs entre votre ordinateur portable et un serveur (en ignorant le NAT). Qu'est-ce qui change à chaque saut ?
- [ ] Les adresses IP source et destination
- [x] Les adresses MAC
- [ ] Les numéros de port
> Les adresses IP restent les mêmes de bout en bout, tandis que chaque saut utilise une nouvelle trame avec de nouvelles adresses MAC.
```

```quiz
Quelle adresse répond à la question « quel programme sur la machine ? »
- [ ] L'adresse MAC
- [ ] L'adresse IP
- [ ] Le nom de domaine
- [x] Le numéro de port
> Le numéro de port permet à la couche transport de livrer les données au bon programme d'un hôte.
```
