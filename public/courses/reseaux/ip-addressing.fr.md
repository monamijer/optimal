# Adressage IP et sous-réseaux

> Objectifs : lire une adresse IPv4 avec son préfixe, calculer la plage d'un sous-réseau, et connaître les espaces d'adresses privées et IPv6.

## Les adresses IPv4

Une adresse IPv4 est un nombre de 32 bits, écrit sous la forme de quatre octets en décimal, séparés par des points : `192.168.10.77`. Chaque octet va de 0 à 255. Il existe 2³² ≈ 4,3 milliards d'adresses possibles, ce qui ne suffit plus pour tous les appareils du monde.

Une adresse comporte deux parties : la partie **réseau** (quel réseau) et la partie **hôte** (quelle machine à l'intérieur). La **longueur du préfixe** indique où se situe la séparation, avec la notation CIDR `/n` : les n premiers bits forment la partie réseau.

```text
192.168.10.77/24
11000000.10101000.00001010 . 01001101
|<------ 24 network bits -->| |-- 8 host bits --|
```

La même information peut être donnée sous forme de **masque de sous-réseau** : `/24` correspond à `255.255.255.0`, soit 24 uns suivis de 8 zéros.

## Calculer un sous-réseau

Prenons `192.168.10.0/24` :

| Élément | Valeur |
|---|---|
| Adresse réseau (bits d'hôte tous à 0) | 192.168.10.0 |
| Adresse de diffusion (bits d'hôte tous à 1) | 192.168.10.255 |
| Adresses d'hôtes utilisables | 192.168.10.1 à 192.168.10.254 |
| Nombre d'hôtes utilisables | 2⁸ − 2 = 254 |

La première adresse désigne le réseau lui-même et la dernière atteint tous les hôtes à la fois, donc aucune des deux ne peut être attribuée à une machine. En général, un sous-réseau `/n` a 2^(32−n) − 2 hôtes utilisables.

### Découper un réseau

Pour couper un réseau en quatre parties égales, ajoutez 2 bits au préfixe : `/24` devient `/26`. Chaque partie a 2⁶ = 64 adresses, dont 62 utilisables.

| Sous-réseau | Hôtes utilisables | Diffusion |
|---|---|---|
| 192.168.10.0/26 | .1 à .62 | .63 |
| 192.168.10.64/26 | .65 à .126 | .127 |
| 192.168.10.128/26 | .129 à .190 | .191 |
| 192.168.10.192/26 | .193 à .254 | .255 |

Ainsi, `192.168.10.77` appartient au deuxième sous-réseau, `192.168.10.64/26`. Deux hôtes ne peuvent communiquer directement que s'ils sont dans le même sous-réseau ; sinon, leur trafic passe par un routeur.

## Adresses privées et NAT

Certaines plages sont réservées aux réseaux privés et ne sont jamais routées sur internet :

| Plage | Préfixe |
|---|---|
| 10.0.0.0 à 10.255.255.255 | 10.0.0.0/8 |
| 172.16.0.0 à 172.31.255.255 | 172.16.0.0/12 |
| 192.168.0.0 à 192.168.255.255 | 192.168.0.0/16 |

Chaque foyer utilise les mêmes plages privées. Votre routeur effectue du **NAT** (traduction d'adresses réseau) : il remplace l'adresse source privée des paquets sortants par sa propre adresse publique, et mémorise la correspondance pour renvoyer les réponses vers le bon appareil. Le NAT a sauvé IPv4 de l'épuisement, mais il signifie aussi que les appareils situés derrière lui ne sont pas joignables directement depuis l'extérieur.

## Adresses spéciales

- `127.0.0.1` (`localhost`) : la machine elle-même.
- `0.0.0.0` : « n'importe quelle adresse » ou « inconnue ».
- `169.254.0.0/16` : attribuée automatiquement quand aucun serveur DHCP ne répond ; en voir une signifie généralement « ma configuration réseau a échoué ».

## DHCP et passerelle par défaut

Saisir une adresse sur chaque appareil serait fastidieux. **DHCP** distribue la configuration automatiquement : une adresse IP, le préfixe, la passerelle par défaut et le serveur DNS. La **passerelle par défaut** est le routeur auquel un hôte envoie chaque paquet dont la destination est en dehors de son propre sous-réseau.

## IPv6

IPv6 utilise des adresses de 128 bits, écrites en groupes hexadécimaux : `2001:db8::1`. Des groupes consécutifs de zéros peuvent être remplacés une seule fois par `::`. L'espace d'adresses est de 2¹²⁸, assez pour donner une adresse publique à chaque appareil, donc le NAT n'est pas nécessaire. Un sous-réseau typique est un `/64`. Le bloc `2001:db8::/32` est réservé à la documentation, comme les exemples ci-dessus.

## Pratique : calculs de sous-réseaux

Faites ces calculs, saisissez la réponse et appuyez sur **Vérifier**.

```exercise
Quelle est l'adresse réseau de l'hôte `172.16.5.200/25` ? (Les blocs d'un /25 contiennent 128 adresses.)
--- answer
172.16.5.128
--- explain
Les blocs /25 commencent à .0 et .128, et .200 est dans le second.
--- hint
Listez le début des blocs : 0, 128.
```

```exercise
Combien d'adresses utilisables pour des machines un sous-réseau `/27` contient-il ?
--- answer
30
--- explain
2^(32−27) − 2 = 32 − 2 = 30.
--- hint
Retirez l'adresse réseau et l'adresse de diffusion.
```

```exercise
Quelle est l'adresse de diffusion de `10.4.0.0/22` ?
--- answer
10.4.3.255
--- explain
Un /22 couvre 4 blocs de 256 adresses : de 10.4.0.0 à 10.4.3.255.
--- hint
Un /22 correspond à quatre blocs /24 consécutifs.
```

## Points clés : l'adressage IP

- Une adresse IPv4 fait 32 bits ; le préfixe `/n` donne le nombre de bits du réseau.
- Un sous-réseau `/n` a 2^(32−n) − 2 hôtes utilisables (adresses réseau et de diffusion exclues).
- Les plages privées (10/8, 172.16/12, 192.168/16) sont partagées grâce au NAT derrière une seule adresse publique.
- DHCP configure les hôtes ; la passerelle par défaut mène hors du sous-réseau ; IPv6 a 128 bits.

```quiz
Combien d'adresses d'hôtes utilisables comporte un sous-réseau /26 ?
- [ ] 64
- [x] 62
- [ ] 26
> 32 − 26 = 6 bits d'hôte, donc 2⁶ = 64 adresses, moins les adresses réseau et de diffusion.
```

```quiz
Laquelle de ces adresses est privée ?
- [ ] 8.8.8.8
- [ ] 172.32.0.1
- [x] 172.20.4.9
> 172.16.0.0/12 couvre 172.16.0.0 à 172.31.255.255. 172.32.0.1 est en dehors, et 8.8.8.8 est publique.
```
