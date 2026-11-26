# Sécuriser un réseau

> Objectifs : comprendre contre quoi protègent les pare-feu, les VPN et la segmentation, et reconnaître les attaques réseau courantes.

## Les objectifs de sécurité

La sécurité réseau vise trois propriétés, souvent appelées la triade CIA :

| Propriété | Question | Exemple de défaillance |
|---|---|---|
| **Confidentialité** | seules les bonnes personnes peuvent-elles le lire ? | mots de passe interceptés sur un Wi-Fi ouvert |
| **Intégrité** | les données ont-elles été altérées ? | une page modifiée en chemin |
| **Disponibilité** | le service est-il accessible ? | un serveur submergé de requêtes |

## Pare-feu

Un **pare-feu** filtre le trafic selon des règles. Un filtre de paquets examine les adresses, les protocoles et les ports : « autoriser TCP vers le port 443, bloquer tout le reste ». Un pare-feu **à états** (*stateful*) se souvient aussi des connexions qu'il a vues, ce qui lui permet d'autoriser les réponses à une connexion initiée depuis l'intérieur, et de refuser le trafic non sollicité venant de l'extérieur.

Deux principes rendent les règles robustes :

- **Refus par défaut** : tout bloquer, puis n'autoriser que le nécessaire.
- **Moindre privilège** : ouvrir le plus petit ensemble de ports, vers le plus petit ensemble de sources.

Les règles sont évaluées dans l'ordre et la première qui correspond l'emporte, donc l'ordre compte. Un pare-feu applicatif (couche 7) va plus loin et inspecte le contenu, comme les requêtes web.

## Segmentation

Ne mettez pas tout dans un seul réseau plat. Placez les serveurs, le personnel, les invités et les équipements tels que les imprimantes ou les caméras dans des **segments séparés** (sous-réseaux ou VLAN), avec un pare-feu entre eux. Un serveur web public se place dans une **DMZ**, une zone exposée à Internet mais isolée du réseau interne. Si une machine est compromise, l'attaquant ne peut pas se déplacer librement vers le reste.

## VPN

Un **VPN** (réseau privé virtuel) crée un tunnel chiffré entre deux points à travers un réseau non fiable. On l'utilise pour accéder à distance au réseau d'une entreprise, relier deux sites ou protéger le trafic sur un point d'accès public. Un VPN déplace la confiance du réseau local vers le fournisseur ou le point de terminaison du VPN : il protège le chemin, pas la destination.

## Attaques courantes

| Attaque | Fonctionnement | Principales défenses |
|---|---|---|
| **Écoute (sniffing)** | lire le trafic sur un support partagé | chiffrement (TLS, VPN), commutateurs plutôt que concentrateurs |
| **Usurpation ARP** | un hôte ment sur son adresse MAC pour intercepter le trafic local | inspection ARP dynamique, chiffrement |
| **Homme du milieu** | un attaquant se place entre deux parties | TLS avec validation des certificats |
| **Usurpation DNS** | de fausses réponses DNS vous envoient vers le mauvais serveur | DNSSEC, HTTPS, résolveurs de confiance |
| **Scan de ports** | sonder quels ports répondent, pour trouver des services à attaquer | pare-feu, fermer les services inutilisés |
| **DoS / DDoS** | épuiser un service avec du trafic provenant d'une ou de nombreuses sources | limitation de débit, filtrage chez l'opérateur, CDN |
| **Hameçonnage** | pousser des personnes à saisir leurs identifiants sur un faux site | formation, MFA, vérification des certificats et des URL |

Beaucoup de ces attaques exploitent la même faiblesse : les protocoles d'origine (ARP, DNS en clair, HTTP en clair) font confiance à tout ce qu'ils reçoivent. La sécurité est ajoutée par-dessus, c'est pourquoi **le chiffrement et l'authentification** (TLS) comptent plus que n'importe quel équipement isolé.

## Les bonnes habitudes

- Gardez les systèmes et les micrologiciels **à jour** : la plupart des attaques exploitent des vulnérabilités connues.
- Utilisez des mots de passe **robustes et uniques** et l'**authentification multifacteur**.
- N'exposez que **les services qui doivent être publics**, et désactivez les autres.
- Utilisez des protocoles chiffrés : SSH au lieu de Telnet, HTTPS au lieu de HTTP.
- **Journalisez et surveillez** : on ne peut pas réagir à ce que l'on ne voit pas.
- Partez du principe que le réseau interne peut être compromis : ne vous reposez pas sur le seul périmètre (« défense en profondeur »).

## Points clés : la sécurité réseau

- Protégez la confidentialité, l'intégrité et la disponibilité.
- Pare-feu : refus par défaut, moindre privilège, règles évaluées dans l'ordre.
- Segmentez les réseaux et isolez les serveurs publics dans une DMZ.
- Un VPN chiffre le chemin ; TLS authentifie et chiffre la connexion de bout en bout.
- Mises à jour, MFA, exposition minimale et surveillance préviennent la plupart des incidents.

```quiz
Les règles d'un pare-feu sont : 1) autoriser le port TCP 443 ; 2) tout refuser. Un paquet pour le port TCP 22 arrive. Que se passe-t-il ?
- [ ] Il est autorisé, car SSH est courant
- [x] Il est refusé par la règle 2
- [ ] Il est autorisé, car les règles sont évaluées dans n'importe quel ordre
> Les règles sont évaluées dans l'ordre ; le port 22 ne correspond pas à la règle 1 et est bloqué par la règle de refus par défaut.
```

```quiz
Que protège un VPN sur un réseau Wi-Fi public ?
- [ ] Il rend le site web de destination digne de confiance
- [x] Il chiffre le trafic entre vous et le point de terminaison du VPN
- [ ] Il supprime le besoin de HTTPS partout
> Un VPN protège le chemin entre les points de terminaison ; il ne garantit pas le site que vous atteignez au final.
```
