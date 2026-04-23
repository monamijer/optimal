# Sécurité Informatique

Bienvenue dans le cours complet de sécurité informatique. Ce cours couvre la théorie et la pratique, du débutant au niveau professionnel.

## La CIA Triad — Les 3 piliers fondamentaux

La sécurité informatique repose sur trois piliers fondamentaux connus sous l'acronyme **CIA Triad**.

### Confidentialité

L'information n'est accessible qu'aux personnes autorisées. Protège contre l'espionnage et les fuites de données.

Mécanismes : chiffrement, contrôle d'accès, authentification.

### Intégrité

L'information n'est pas modifiée de façon non autorisée. Protège contre la falsification.

Mécanismes : hash SHA-256, signatures numériques, checksums.

### Disponibilité

Les ressources sont accessibles aux utilisateurs légitimes quand nécessaire. Protège contre les attaques DDoS et les pannes.

Mécanismes : redondance, load balancing, sauvegardes.

---

## Les piliers étendus

La CIA Triad est complétée par trois piliers supplémentaires essentiels.

### Authentification

Vérification de l'identité d'un utilisateur. Il existe trois facteurs d'authentification : quelque chose qu'on **sait** (mot de passe), qu'on **a** (token physique), ou qu'on **est** (biométrie). L'authentification multi-facteurs (MFA) combine plusieurs facteurs.

### Non-répudiation

Impossibilité de nier avoir effectué une action. Mécanismes : journaux de logs signés, certificats numériques. Base légale de toute transaction numérique.

### Autorisation

Contrôle de ce qu'un utilisateur authentifié peut faire. Modèles principaux : **RBAC** (rôles), **MAC** (obligatoire), **DAC** (discrétionnaire).

---

## Terminologie essentielle

Avant d'aller plus loin, il est indispensable de maîtriser le vocabulaire de la sécurité.

### Vulnérabilité

Faiblesse dans un système qui peut être exploitée. Exemples : buffer overflow, injection SQL, mauvaise configuration.

### Menace

Danger potentiel qui exploite une vulnérabilité. Sources : hackers, malwares, erreurs humaines, catastrophes naturelles.

### Risque

Combinaison de la probabilité et de l'impact d'une menace. Formule : `Risque = Menace × Vulnérabilité × Impact`.

### Exploit

Code ou technique qui exploite une vulnérabilité spécifique. Exemple célèbre : EternalBlue (MS17-010) utilisé par WannaCry.

### CVE

Identifiant standard pour les vulnérabilités publiques. Format : `CVE-ANNÉE-NUMÉRO`. Exemple : CVE-2021-44228 (Log4Shell).

### Zero-day

Vulnérabilité découverte mais non encore corrigée par l'éditeur. Particulièrement dangereuse car aucun patch n'existe.

### Surface d'attaque

Ensemble des points d'entrée potentiels d'un système : ports ouverts, APIs exposées, interfaces utilisateur, employés.
