# Diagnostiquer les problèmes réseau

> Objectifs : appliquer une méthode couche par couche et utiliser les outils standard pour trouver où une connexion se rompt.

## Une méthode : de bas en haut

« Internet ne marche pas » peut désigner vingt pannes différentes. Le modèle en couches donne une méthode : vérifiez en partant du bas, et arrêtez-vous à la première chose qui échoue.

| Étape | Question | Outil |
|---|---|---|
| 1. Liaison | le câble est-il branché, le Wi-Fi connecté ? | voyants de liaison, état du système |
| 2. Adresse | ai-je une adresse IP, une passerelle, un serveur DNS ? | `ip addr` (Linux), `ipconfig` (Windows) |
| 3. Réseau local | puis-je joindre la passerelle ? | `ping` vers la passerelle |
| 4. Internet | puis-je joindre une adresse extérieure ? | `ping 8.8.8.8` |
| 5. Noms | le DNS fonctionne-t-il ? | `dig` ou `nslookup` |
| 6. Service | le service répond-il sur son port ? | `curl`, `ss`, `nc` |

Lire le résultat vous indique où chercher. Le ping d'une **adresse** extérieure fonctionne mais celui d'un **nom** échoue : le problème vient du DNS. Le ping de la passerelle échoue : le problème est local (câble, Wi-Fi, adresse). Tout fonctionne sauf un site : le problème se situe probablement sur ce site ou sur le chemin qui y mène.

## Les outils de diagnostic

### ping

Envoie des requêtes d'écho ICMP et mesure le temps d'aller-retour.

```text
$ ping -c 3 192.168.10.1
```

Vérifiez trois choses : les réponses reviennent-elles, combien de temps mettent-elles (latence), et combien sont perdues. Certains serveurs et pare-feu ignorent le ping, donc le silence ne signifie pas toujours « hors service ».

### traceroute

Affiche les routeurs que traverse un paquet. Il envoie des paquets avec un TTL de 1, 2, 3, etc. : chaque routeur qui en abandonne un parce que le TTL a atteint 0 se fait connaître.

```text
$ traceroute example.org
```

Une ligne `* * *` signifie que ce saut n'a pas répondu (souvent il filtre ces sondes), et le chemin peut très bien fonctionner plus loin. Cherchez le saut où la latence augmente brusquement ou où les réponses s'arrêtent.

### dig

Interroge directement le DNS, en contournant le navigateur et ses caches.

```text
$ dig example.org A
$ dig example.org MX
$ dig @8.8.8.8 example.org
```

La dernière forme interroge un résolveur précis, ce qui aide à déterminer si le problème vient de votre propre résolveur.

### ip et ss

```text
$ ip addr          # les interfaces et leurs adresses
$ ip route         # la table de routage, y compris la passerelle par défaut
$ ss -tlnp         # ports TCP sur lesquels cette machine écoute
```

### curl

Effectue une requête HTTP et montre ce qui se passe réellement, avec les en-têtes et le code d'état.

```text
$ curl -I https://example.org
```

`curl -v` affiche aussi la négociation TLS, utile pour les erreurs de certificat.

## Symptômes typiques

| Symptôme | Cause probable |
|---|---|
| Adresse commençant par `169.254` | aucune réponse DHCP |
| Le ping vers la passerelle échoue | liaison, Wi-Fi, mauvais VLAN ou mauvaise adresse |
| Le ping vers une IP fonctionne, les noms échouent | serveur DNS incorrect ou injoignable |
| Un nom se résout en une adresse inattendue | cache périmé ou mauvais enregistrement DNS |
| `Connection refused` | la machine répond, mais rien n'écoute sur ce port |
| `Connection timed out` | les paquets sont abandonnés : pare-feu, routage ou hôte hors service |
| Avertissement de certificat | certificat expiré, mauvais nom, ou homme du milieu |

La différence entre « refusée » et « délai dépassé » mérite d'être retenue : un refus est une réponse (quelqu'un est là), un délai dépassé est un silence.

## Points clés : diagnostiquer les problèmes réseau

- Travaillez de bas en haut : liaison, adresse, passerelle, adresse extérieure, DNS, service.
- `ping` teste l'accessibilité, `traceroute` le chemin, `dig` les noms, `ss` les ports locaux, `curl` l'application.
- « Connection refused » signifie joignable mais fermé ; « timed out » signifie que les paquets disparaissent en chemin.

```quiz
`ping 8.8.8.8` fonctionne, mais `ping example.org` échoue avec « unknown host ». Où est le problème ?
- [ ] Le câble
- [ ] La passerelle par défaut
- [x] La résolution de noms DNS
> Le chemin réseau fonctionne, puisqu'une adresse répond. Seul le nom ne peut pas être traduit.
```

```quiz
Vous obtenez « Connection refused » en vous connectant au port 8080 d'un serveur. Que cela vous indique-t-il ?
- [ ] Le serveur est éteint
- [x] Le serveur est joignable, mais aucun programme n'écoute sur ce port
- [ ] Un routeur abandonne vos paquets en silence
> Un refus est une réponse explicite de la machine. Un paquet abandonné se solderait par un délai dépassé.
```
