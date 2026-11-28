# TCP et UDP : la couche transport

> Objectifs : utiliser les ports pour joindre le bon programme, et choisir entre la fiabilité de TCP et la rapidité d'UDP.

## Les ports

Une adresse IP identifie une machine. Un **port** (16 bits, de 0 à 65535) identifie un programme sur cette machine. Une connexion est donc identifiée par quatre valeurs : IP source, port source, IP destination, port destination. C'est ainsi que votre navigateur peut garder dix onglets ouverts en même temps vers le même serveur.

| Plage | Usage |
|---|---|
| 0 à 1023 | ports bien connus des services standard |
| 1024 à 49151 | ports enregistrés |
| 49152 à 65535 | ports éphémères, choisis par le client pour chaque connexion |

| Port | Service |
|---|---|
| 22 | SSH |
| 25 | SMTP (envoi de courriel) |
| 53 | DNS |
| 80 | HTTP |
| 443 | HTTPS |

## UDP : envoyer sans se soucier du reste

UDP (User Datagram Protocol) n'ajoute presque rien à IP : des ports et une somme de contrôle. Il n'établit pas de connexion, ne garantit pas la livraison et ne conserve pas l'ordre. En échange, il est léger et rapide.

Il convient aux données dont un paquet en retard est sans valeur : appels vocaux et vidéo, jeux en ligne, et échanges courts de type requête-réponse comme les requêtes DNS.

## TCP : fiable et ordonné

TCP (Transmission Control Protocol) fournit un **flux d'octets fiable et ordonné** au-dessus d'un réseau non fiable. Il y parvient grâce à plusieurs mécanismes :

- une **connexion** que les deux côtés établissent et ferment ;
- des **numéros de séquence** sur chaque octet, pour que le récepteur puisse réordonner et détecter les trous ;
- des **accusés de réception** : le récepteur confirme ce qu'il a reçu ; tout ce qui n'est pas acquitté à temps est renvoyé ;
- le **contrôle de flux** : le récepteur annonce ce qu'il peut accepter (la fenêtre), pour qu'un émetteur rapide ne noie pas un récepteur lent ;
- le **contrôle de congestion** : l'émetteur ralentit quand le réseau perd des paquets.

### La poignée de main en trois temps

Avant que les données ne circulent, les deux côtés se mettent d'accord sur les numéros de séquence initiaux :

```text
Client                                  Server
  | ----- SYN (seq = x) --------------->  |   "Je veux parler, mes numéros commencent à x"
  | <---- SYN-ACK (seq = y, ack = x+1) -  |   "D'accord, les miens commencent à y"
  | ----- ACK (ack = y+1) -------------->  |   "Compris"
  |            data can now flow          |
```

Cela coûte un aller-retour avant le premier octet de données, ce qui est l'une des raisons pour lesquelles la latence compte autant pour les requêtes web courtes. Une connexion se ferme par un échange similaire de messages `FIN` et `ACK`.

## TCP ou UDP ?

| | TCP | UDP |
|---|---|---|
| Connexion | oui (poignée de main) | non |
| Livraison garantie | oui, avec retransmission | non |
| Ordre conservé | oui | non |
| Vitesse et surcoût | plus lent, plus lourd | plus rapide, plus léger |
| Usage typique | web, courriel, transfert de fichiers, SSH | DNS, appels, jeux, streaming |

La retransmission a un coût : si un paquet est perdu, TCP retient tout ce qui le suit jusqu'à ce qu'il soit récupéré. Pour un appel vidéo en direct, il vaut mieux ignorer le paquet perdu que figer l'image. C'est le compromis.

## Points clés : TCP et UDP

- Un port identifie un programme ; une connexion est le quadruplet (IP source, port source, IP destination, port destination).
- UDP est sans connexion et non fiable mais rapide ; TCP est fiable et ordonné, grâce à la poignée de main, aux accusés de réception, au contrôle de flux et de congestion.
- Choisissez selon le besoin : l'exactitude (TCP) ou la ponctualité (UDP).

```quiz
Quel protocole de transport choisiriez-vous pour un appel vocal en direct, où un paquet en retard est inutile ?
- [ ] TCP, pour garantir chaque paquet
- [x] UDP, pour éviter d'attendre les retransmissions
- [ ] Aucun, la voix ne peut pas utiliser de protocole de transport
> Un paquet retardé est inutile dans un appel en direct ; l'attendre ne ferait qu'ajouter du délai.
```

```quiz
Quel est le rôle de la poignée de main en trois temps de TCP ?
- [ ] Chiffrer la connexion
- [x] Établir la connexion et convenir des numéros de séquence initiaux
- [ ] Trouver l'adresse IP du serveur
> SYN, SYN-ACK, ACK : les deux côtés confirment qu'ils peuvent communiquer et synchronisent leur numérotation.
```

```quiz
Un navigateur a dix onglets ouverts vers le même serveur sur le port 443. Comment l'hôte distingue-t-il ces connexions ?
- [ ] Par le port de destination, différent pour chaque onglet
- [x] Par le port source, différent pour chaque connexion
- [ ] Par l'adresse MAC du serveur
> Une connexion est identifiée par l'IP source, le port source, l'IP destination et le port destination ; le client choisit à chaque fois un port source éphémère différent.
```

```quiz
Quel mécanisme de TCP empêche un émetteur rapide de submerger un récepteur lent ?
- [x] Le contrôle de flux, avec la fenêtre annoncée par le récepteur
- [ ] Le contrôle de congestion
- [ ] La poignée de main en trois temps
> Le récepteur annonce ce qu'il peut accepter ; le contrôle de congestion réagit aux pertes du réseau, pas à la capacité du récepteur.
```
