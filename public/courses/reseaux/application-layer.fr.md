# DNS, HTTP et TLS

> Objectifs : expliquer comment les noms deviennent des adresses, comment fonctionne un échange web, et ce qu'ajoute HTTPS.

## DNS : l'annuaire d'internet

Les humains retiennent des noms, les réseaux routent des adresses. Le **DNS** (Domain Name System) traduit un nom tel que `www.example.org` en adresse IP. C'est une base de données distribuée et hiérarchique : aucun serveur ne sait tout.

Un nom se lit de droite à gauche : la racine, puis le domaine de premier niveau (`org`), puis le domaine (`example`), puis un hôte (`www`). Quand votre ordinateur a besoin d'une adresse :

1. il interroge son **résolveur** configuré (souvent celui de votre opérateur, ou un résolveur public) ;
2. si le résolveur n'a pas la réponse en cache, il interroge un **serveur racine**, qui renvoie vers les serveurs de `.org` ;
3. puis les serveurs de `.org` renvoient vers les **serveurs faisant autorité** pour `example.org` ;
4. le serveur faisant autorité donne la réponse, et le résolveur la renvoie et la **met en cache** pour une durée appelée TTL.

Types d'enregistrements courants :

| Enregistrement | Contient |
|---|---|
| `A` | une adresse IPv4 |
| `AAAA` | une adresse IPv6 |
| `CNAME` | un alias vers un autre nom |
| `MX` | les serveurs de messagerie d'un domaine |
| `TXT` | du texte libre (utilisé pour la vérification et la sécurité du courriel) |

Le cache rend le DNS rapide, et explique aussi pourquoi un changement peut mettre du temps à être visible partout : les anciennes réponses vivent jusqu'à l'expiration de leur TTL.

## HTTP : le langage du web

HTTP est un protocole requête-réponse au-dessus de TCP. Un client envoie une requête, et le serveur répond.

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

Une requête comporte une **méthode**, un **chemin**, des en-têtes et parfois un corps. Les principales méthodes :

| Méthode | Rôle |
|---|---|
| `GET` | lire une ressource ; ne doit rien modifier |
| `POST` | envoyer des données pour créer quelque chose ou déclencher une action |
| `PUT` | remplacer une ressource |
| `DELETE` | supprimer une ressource |

La réponse commence par un **code de statut** qui indique ce qui s'est passé :

| Code | Signification |
|---|---|
| 200 | OK |
| 301 / 302 | la ressource a été déplacée (redirection) |
| 404 | introuvable |
| 403 | interdit |
| 500 | le serveur a échoué |

Le premier chiffre donne la famille : 2xx succès, 3xx redirection, 4xx le client a fait une erreur, 5xx le serveur a fait une erreur.

HTTP est lui-même **sans état** : chaque requête est indépendante. Les connexions des utilisateurs sont conservées grâce aux **cookies**, de petites données que le serveur demande au navigateur de renvoyer avec chaque requête.

## HTTPS et TLS

Le HTTP simple circule en clair : n'importe qui sur le chemin (un point d'accès Wi-Fi, un opérateur) peut le lire ou le modifier. **HTTPS** est du HTTP à l'intérieur de **TLS**, un protocole qui fournit :

- la **confidentialité** : les données sont chiffrées ;
- l'**intégrité** : les modifications sont détectées ;
- l'**authentification** : le serveur prouve son identité avec un **certificat**, signé par une autorité de certification à laquelle votre navigateur fait confiance.

Pendant la poignée de main TLS, le client et le serveur se mettent d'accord sur des algorithmes et échangent des clés, de sorte qu'un **secret partagé** est établi sans jamais être envoyé sur le réseau. Le reste du trafic est ensuite chiffré avec un chiffrement symétrique rapide. Le cadenas du navigateur signifie : « vous parlez au propriétaire de ce domaine, et personne d'autre ne peut lire ou modifier cette conversation ». Il ne signifie pas que le site est honnête, seulement que la connexion est privée et authentique.

## Points clés : DNS, HTTP et TLS

- Le DNS traduit les noms en adresses grâce à une hiérarchie de serveurs et met les réponses en cache pendant leur TTL.
- HTTP est un protocole requête-réponse sans état ; les méthodes disent quoi faire, les codes de statut disent ce qui s'est passé.
- HTTPS = HTTP sur TLS : chiffrement, intégrité et authentification du serveur grâce aux certificats.

```quiz
Un site a changé l'adresse de son serveur, mais certains utilisateurs atteignent encore l'ancienne pendant quelques heures. Quelle en est la raison la plus probable ?
- [ ] Les routeurs sont en panne
- [x] Les réponses DNS sont mises en cache jusqu'à l'expiration de leur TTL
- [ ] HTTP est sans état
> Les résolveurs conservent les anciennes réponses pendant le TTL de l'enregistrement.
```

```quiz
Que signifie un code de statut HTTP 404 ?
- [ ] Le serveur a planté
- [x] La ressource demandée est introuvable
- [ ] La requête a réussi
> Les codes 4xx signalent un problème côté client, ici un chemin qui n'existe pas.
```
