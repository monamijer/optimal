# Comment les ordinateurs communiquent

> Objectifs : décrire ce qu'est un réseau, nommer ses composants et suivre une requête web depuis votre navigateur jusqu'à un serveur.

## Qu'est-ce qu'un réseau ?

Un réseau informatique est un ensemble d'appareils qui échangent des données sur un support partagé : câbles, ondes radio ou fibre optique. Internet est un réseau de réseaux : des milliers de réseaux indépendants (universités, opérateurs, entreprises, domiciles) qui s'accordent pour parler les mêmes protocoles.

Un **protocole** est un ensemble de règles que les deux parties respectent : le format des messages, leur ordre, la conduite à tenir en cas d'erreur. Sans protocole commun, deux machines ne peuvent pas se comprendre, comme deux personnes sans langue commune.

## Les composants d'un réseau

| Élément | Rôle |
|---|---|
| **Hôte** | un appareil qui envoie ou reçoit des données (ordinateur portable, téléphone, serveur) |
| **Commutateur (switch)** | relie les hôtes à l'intérieur d'un même réseau local et transmet les trames vers le bon port |
| **Routeur** | relie des réseaux différents et transmet les paquets entre eux |
| **Point d'accès** | permet à des appareils sans fil de rejoindre un réseau filaire |
| **Lien** | le support entre deux appareils : câble Ethernet, fibre, Wi-Fi |

Les réseaux se classent selon leur portée : un **LAN** (réseau local) couvre une maison, une école ou un bureau ; un **WAN** (réseau étendu) relie des sites distants, et internet est le plus grand d'entre eux.

## Les paquets

Les données ne sont pas envoyées en un flux continu. Elles sont découpées en petites unités appelées **paquets**, chacune portant un en-tête (à qui elle est destinée, d'où elle vient, sa position) et un morceau des données. Les paquets voyagent indépendamment, peuvent emprunter des chemins différents et sont réassemblés à destination. C'est ce qu'on appelle la **commutation de paquets**, qui permet à de nombreuses conversations de partager efficacement les mêmes liens et de survivre à la panne d'un chemin.

Deux mesures décrivent un lien :

- **Bande passante** : la quantité de données qui peut être envoyée par seconde (par exemple 100 Mbit/s) ;
- **Latence** : le temps que met un paquet à arriver (par exemple 30 ms).

Elles sont différentes : une liaison par satellite peut avoir une bande passante élevée et pourtant sembler lente à cause de sa latence.

## Une requête web, du début à la fin

Quand vous ouvrez une page, beaucoup de choses se produisent en une fraction de seconde :

1. Votre navigateur demande au **DNS** de traduire le nom du site en adresse IP.
2. Votre ordinateur ouvre une **connexion TCP** vers cette adresse.
3. Il envoie une **requête HTTP** (`GET /`).
4. Les paquets traversent votre commutateur, votre routeur domestique, votre opérateur et plusieurs routeurs en chemin.
5. Le serveur répond avec la page, là encore sous forme de paquets.
6. Votre navigateur réassemble les données et affiche la page.

Les chapitres suivants expliquent chacune de ces étapes, couche par couche.

## Points clés : la communication entre machines

- Un réseau relie des hôtes par des commutateurs et des routeurs ; internet est un réseau de réseaux.
- Un protocole est un ensemble de règles partagées ; les données voyagent sous forme de paquets indépendants.
- La bande passante est une capacité, la latence est un délai.
- Ouvrir une page web fait intervenir le DNS, une connexion TCP et un échange HTTP.

```quiz
Quel appareil relie deux réseaux différents et transmet les paquets entre eux ?
- [ ] Un commutateur
- [x] Un routeur
- [ ] Un point d'accès
> Un commutateur fonctionne à l'intérieur d'un seul réseau local ; un routeur fait passer les paquets d'un réseau à un autre.
```

```quiz
Un lien a une bande passante élevée, mais chaque paquet met 600 ms à arriver. Qu'est-ce qui est élevé ?
- [ ] Sa bande passante est faible
- [x] Sa latence
- [ ] Rien, la bande passante et la latence sont la même chose
> La bande passante est la quantité par seconde ; la latence est le délai d'un seul paquet.
```

```quiz
Que fait un navigateur en premier lorsqu'on ouvre une page, avant de pouvoir ouvrir une connexion TCP vers le site ?
- [ ] Il envoie une requête HTTP `GET`
- [x] Il demande au DNS de traduire le nom du site en adresse IP
- [ ] Il réassemble les paquets
> La connexion TCP a besoin d'une adresse IP, donc le nom doit d'abord être résolu par le DNS.
```

```quiz
Pourquoi les données sont-elles découpées en paquets au lieu d'être envoyées en un seul flux continu ?
- [x] Plusieurs conversations peuvent partager les mêmes liens, et le trafic survit à la panne d'un chemin
- [ ] Parce que les paquets sont chiffrés automatiquement
- [ ] Parce que chaque paquet doit suivre le même chemin pour rester dans l'ordre
> La commutation de paquets permet aux conversations de partager efficacement les liens, et les paquets peuvent suivre des chemins différents puis être réassemblés à l'arrivée.
```
