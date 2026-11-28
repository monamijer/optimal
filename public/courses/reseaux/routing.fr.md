# Commutation et routage

> Objectifs : expliquer comment un commutateur et un routeur décident chacun où envoyer les données, et lire une table de routage.

## La commutation dans un LAN

Un **commutateur** relie les hôtes d'un même réseau local. Il travaille avec les **adresses MAC**. Il apprend par observation : quand une trame arrive sur le port 3 avec l'adresse MAC source `AA`, le commutateur note « AA est joignable sur le port 3 » dans sa **table MAC**. Quand une trame destinée à `AA` arrive plus tard, elle n'est envoyée que par le port 3. Si la destination est inconnue, le commutateur envoie la trame par tous les autres ports (inondation) jusqu'à ce que la réponse révèle où se trouve cet hôte.

Pour trouver l'adresse MAC associée à une adresse IP sur le même réseau, un hôte utilise **ARP** : il diffuse « qui a 192.168.10.1 ? » et le propriétaire répond avec son adresse MAC. Le résultat est conservé dans un cache ARP.

Les **VLAN** permettent à un seul commutateur physique de se comporter comme plusieurs réseaux logiques distincts, par exemple pour isoler les invités du personnel. Les hôtes de VLAN différents ne peuvent communiquer qu'à travers un routeur.

## Le routage entre réseaux

Un **routeur** possède une interface dans chacun des réseaux qu'il relie, et une **table de routage** qui indique, pour chaque réseau de destination, où envoyer ensuite le paquet (le **saut suivant**).

```text
Destination         Next hop        Interface
192.168.10.0/24     directly        eth0
10.20.0.0/16        192.168.10.2    eth0
0.0.0.0/0           203.0.113.1     eth1
```

Pour chaque paquet, le routeur compare l'adresse de destination avec la table et choisit l'entrée correspondante la **plus spécifique**, celle dont le préfixe est le plus long. C'est la **correspondance du plus long préfixe**. Un paquet pour `10.20.5.9` correspond à `10.20.0.0/16` et aussi à la route par défaut `0.0.0.0/0` ; la première est plus longue, elle l'emporte. L'entrée `0.0.0.0/0` est la **route par défaut**, utilisée quand rien d'autre ne correspond, généralement vers l'opérateur.

Chaque routeur prend sa décision indépendamment, transmet le paquet et l'oublie. L'en-tête IP contient un **TTL** (durée de vie) que chaque routeur décrémente ; quand il atteint 0, le paquet est abandonné. Cela empêche une boucle de routage de faire circuler des paquets indéfiniment.

## Comment les tables de routage sont remplies

- **Routes statiques** : écrites par un administrateur. Simples et prévisibles, adaptées aux petits réseaux.
- **Protocoles de routage dynamique** : les routeurs échangent des informations, calculent les routes par eux-mêmes et s'adaptent aux pannes. À l'intérieur d'une organisation, on utilise des protocoles comme **OSPF** ; entre opérateurs sur internet, **BGP** annonce quels blocs d'adresses chaque réseau peut atteindre.

Comme BGP repose en grande partie sur la confiance entre opérateurs, une annonce erronée peut envoyer une partie du trafic mondial au mauvais endroit. Cela s'est produit plusieurs fois et constitue l'une des fragilités connues d'internet.

## Suivre un paquet

Votre ordinateur portable (`192.168.10.50/24`) envoie des données vers un serveur à l'adresse `203.0.113.20` :

1. La destination est en dehors du sous-réseau du portable, il envoie donc le paquet à la **passerelle par défaut**, le routeur domestique. Il utilise ARP pour trouver l'adresse MAC du routeur et lui adresse la **trame**.
2. Le routeur retire l'en-tête Ethernet, lit l'en-tête IP, trouve la route par défaut et applique le **NAT** à l'adresse source pour la remplacer par son adresse publique.
3. Il envoie le paquet au routeur de l'opérateur, dans une nouvelle trame avec de nouvelles adresses MAC.
4. Chaque routeur suivant répète la recherche et décrémente le TTL jusqu'à ce que le paquet atteigne le réseau du serveur.

Pendant tout le trajet, les adresses IP sont restées les mêmes (hors NAT), tandis que les adresses MAC ont changé à chaque saut.

## Pratique : choisir une route

Faites ces calculs, saisissez la réponse et appuyez sur **Vérifier**.

```exercise
Table de routage : `10.0.0.0/8` → A, `10.1.0.0/16` → B, `10.1.2.0/24` → C, `0.0.0.0/0` → D (route par défaut).

Quel saut suivant (A, B, C ou D) le routeur utilise-t-il pour un paquet vers `10.1.2.77` ?
--- answer
C
--- explain
Trois entrées correspondent ; le préfixe le plus long (/24) l'emporte.
--- hint
Plusieurs entrées correspondent : prenez la plus spécifique.
```

```exercise
Table de routage : `10.0.0.0/8` → A, `10.1.0.0/16` → B, `10.1.2.0/24` → C, `0.0.0.0/0` → D (route par défaut).

Avec la même table, quel saut suivant utilise un paquet vers `192.0.2.1` ?
--- answer
D
--- explain
Aucune entrée précise ne correspond, donc la route par défaut 0.0.0.0/0 est utilisée.
--- hint
Que se passe-t-il quand rien d'autre ne correspond ?
```

## Points clés : commutation et routage

- Un commutateur apprend les adresses MAC et transmet les trames à l'intérieur d'un LAN ; ARP associe une adresse IP à une adresse MAC.
- Un routeur utilise sa table de routage avec la correspondance du plus long préfixe, et la route par défaut quand rien d'autre ne correspond.
- Le TTL empêche les paquets de boucler ; OSPF et BGP remplissent les tables de routage dynamiquement.

```quiz
Un routeur possède les routes 10.0.0.0/8 et 10.20.0.0/16. Laquelle est utilisée pour un paquet à destination de 10.20.5.9 ?
- [ ] 10.0.0.0/8
- [x] 10.20.0.0/16
- [ ] Aucune, il utilise la route par défaut
> Les deux correspondent, et le préfixe le plus long (la route la plus spécifique) l'emporte.
```

```quiz
Qu'utilise un commutateur pour décider du port par lequel envoyer une trame ?
- [ ] L'adresse IP de destination
- [x] L'adresse MAC de destination
- [ ] Le port TCP
> Les commutateurs travaillent au niveau de la couche liaison et apprennent quelle adresse MAC se trouve derrière quel port.
```
