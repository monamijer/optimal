# Sécurité informatique

Bienvenue dans le cours complet de sécurité informatique. Il couvre la théorie et la pratique, du niveau débutant au niveau professionnel.

## La triade CIA : les 3 piliers fondamentaux

La sécurité informatique repose sur trois piliers fondamentaux, connus sous l'acronyme **triade CIA** (confidentialité, intégrité, disponibilité).

### Confidentialité

L'information n'est accessible qu'aux personnes autorisées. Elle protège contre l'espionnage et les fuites de données.

Mécanismes : chiffrement, contrôle d'accès, authentification.

### Intégrité

L'information n'est pas modifiée de manière non autorisée. Elle protège contre la falsification.

Mécanismes : hachages SHA-256, signatures numériques, sommes de contrôle.

### Disponibilité

Les ressources sont accessibles aux utilisateurs légitimes lorsqu'ils en ont besoin. Elle protège contre les attaques DDoS et les pannes.

Mécanismes : redondance, répartition de charge, sauvegardes.

---

## Les piliers étendus

La triade CIA est complétée par trois piliers essentiels supplémentaires.

### Authentification

Vérifier l'identité d'un utilisateur. Il existe trois facteurs d'authentification : quelque chose que vous **connaissez** (un mot de passe), quelque chose que vous **possédez** (un jeton physique) ou quelque chose que vous **êtes** (la biométrie). L'authentification multifacteur (MFA) combine plusieurs facteurs.

### Non-répudiation

L'impossibilité de nier avoir effectué une action. Mécanismes : journaux signés, certificats numériques. C'est le fondement juridique de toute transaction numérique.

### Autorisation

Contrôler ce qu'un utilisateur authentifié a le droit de faire. Principaux modèles : **RBAC** (basé sur les rôles), **MAC** (obligatoire), **DAC** (discrétionnaire).

---

## Terminologie essentielle

Avant d'aller plus loin, vous devez maîtriser le vocabulaire de la sécurité.

### Vulnérabilité

Une faiblesse d'un système qui peut être exploitée. Exemples : dépassement de tampon, injection SQL, mauvaise configuration.

### Menace

Un danger potentiel qui exploite une vulnérabilité. Sources : pirates, logiciels malveillants, erreur humaine, catastrophes naturelles.

### Risque

La combinaison de la probabilité et de l'impact d'une menace. Formule : `Risk = Threat × Vulnerability × Impact`.

### Exploit

Code ou technique qui exploite une vulnérabilité précise. Exemple célèbre : EternalBlue (MS17-010), utilisé par WannaCry.

### CVE

L'identifiant standard des vulnérabilités publiques. Format : `CVE-YEAR-NUMBER`. Exemple : CVE-2021-44228 (Log4Shell).

### Zero-day

Une vulnérabilité qui a été découverte mais pas encore corrigée par l'éditeur. Particulièrement dangereuse car aucun correctif n'existe.

### Surface d'attaque

L'ensemble de tous les points d'entrée potentiels d'un système : ports ouverts, API exposées, interfaces utilisateur, employés.

---

## Quiz : les bases

```quiz
Un attaquant modifie le montant d'un virement bancaire pendant son transit sur le réseau. Quel pilier de la triade CIA est compromis ?
- [ ] La confidentialité
- [x] L'intégrité
- [ ] La disponibilité
> Les données ont été altérées sans autorisation. Les hachages et les signatures numériques protègent l'intégrité.
```

```quiz
Une empreinte digitale et un mot de passe sont combinés pour se connecter. Combien de facteurs d'authentification sont utilisés ?
- [ ] Un seul, car les deux identifient la même personne
- [x] Deux : quelque chose que vous êtes et quelque chose que vous connaissez
- [ ] Trois
> Le mot de passe est un facteur « connaissance » et l'empreinte digitale est un facteur « inhérence », il s'agit donc d'une authentification multifacteur.
```

```quiz
Qu'est-ce qu'un zero-day ?
- [ ] Un virus qui supprime des fichiers le premier jour
- [x] Une vulnérabilité connue mais pas encore corrigée par l'éditeur
- [ ] Une attaque qui dure moins d'une journée
> Sans correctif disponible, les systèmes restent exposés jusqu'à ce que l'éditeur publie une correction.
```

```quiz
Un utilisateur se connecte avec succès mais se voit refuser l'accès à la page d'administration. Quel mécanisme a refusé la requête ?
- [ ] L'authentification
- [x] L'autorisation
- [ ] La non-répudiation
> L'authentification a vérifié qui est l'utilisateur. L'autorisation décide ce que cet utilisateur authentifié a le droit de faire.
```
