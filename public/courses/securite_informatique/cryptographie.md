# Cryptographie Appliquée

La cryptographie est le fondement mathématique de toute la sécurité informatique. Elle permet de chiffrer, signer et vérifier l'intégrité des données.

## Chiffrement symétrique

Une seule clé sert à la fois à chiffrer et déchiffrer. Rapide, idéal pour les gros volumes de données. Problème principal : comment échanger la clé de façon sécurisée ?

### AES — Advanced Encryption Standard

AES est le standard mondial depuis 2001. Ses variantes selon la taille de clé :

- **AES-128** : 128 bits, sûr, bonnes performances
- **AES-256** : 256 bits, standard actuel recommandé
- **AES-GCM** : mode authentifié, garantit confidentialité ET intégrité

### Algorithmes à éviter

- **DES** (56 bits) : cassé depuis 1999, ne jamais utiliser
- **3DES** : déprécié depuis 2023, remplacer par AES
- **RC4** : vulnérable, interdit dans TLS depuis RFC 7465

---

## Chiffrement asymétrique (PKI)

Une paire de clés mathématiquement liées : la **clé publique** (partageable librement) et la **clé privée** (gardée secrète). Résout le problème d'échange de clé du chiffrement symétrique.

### RSA

Basé sur la difficulté de factoriser de grands entiers. Tailles recommandées : **RSA-2048 minimum**, RSA-4096 pour une sécurité maximale. RSA-1024 est considéré cassé.

### Courbes elliptiques (ECC)

Plus efficaces que RSA à sécurité équivalente. Une clé ECDSA-256 offre une sécurité comparable à RSA-3072.

### Ed25519

Algorithme moderne basé sur la courbe Curve25519. Recommandé pour SSH et les signatures numériques. Très rapide et résistant aux attaques par timing.

```bash
# Générer une paire de clés Ed25519 pour SSH
ssh-keygen -t ed25519 -C "utilisateur@machine" -f ~/.ssh/id_ed25519

# Générer une paire RSA-4096
openssl genrsa -out private.pem 4096
openssl rsa -in private.pem -pubout -out public.pem
```

---

## Fonctions de hachage

Transformation à sens unique d'une donnée en empreinte de taille fixe. Propriétés essentielles : **déterministe**, résistance aux collisions, effet avalanche (1 bit changé = hash totalement différent).

### SHA-2 et SHA-3

- **SHA-256** : standard actuel, utilisé dans Bitcoin, TLS, Git
- **SHA-512** : version 512 bits, plus sûre
- **SHA-3** : famille alternative, résistante aux attaques sur SHA-2

### Hachage de mots de passe

Les mots de passe ne se chiffrent pas, ils se hachent avec des fonctions spécialement conçues pour être lentes :

- **bcrypt** : standard depuis 1999, toujours sûr
- **Argon2id** : gagnant du Password Hashing Competition 2015, recommandé en 2024
- **scrypt** : résistant aux attaques matérielles (GPU/ASIC)

### À ne jamais utiliser pour les mots de passe

MD5 et SHA-1 sont **cryptographiquement cassés** et ne doivent jamais stocker des mots de passe. MD5 ne doit être utilisé que comme checksum non-sécurisé.

---

## TLS — Transport Layer Security

TLS est le protocole qui sécurise HTTPS, les emails, et la plupart des communications modernes.

### TLS 1.3 — Fonctionnement

TLS 1.3 (2018) simplifie et renforce son prédécesseur. La négociation se déroule en une seule aller-retour au lieu de deux.

#### 1. Client Hello

Le client envoie les cipher suites supportées, un nombre aléatoire, et sa clé publique Diffie-Hellman éphémère.

#### 2. Server Hello et Certificate

Le serveur choisit la cipher suite, envoie son certificat X.509 signé par une autorité de certification (CA), et sa propre clé DH éphémère.

#### 3. Échange de clés ECDHE

Les deux parties calculent indépendamment le même secret partagé grâce à Diffie-Hellman. La clé ne transite jamais sur le réseau.

#### 4. Session chiffrée

Toutes les communications sont chiffrées avec AES-256-GCM ou ChaCha20-Poly1305. La **Perfect Forward Secrecy** est garantie grâce aux clés éphémères.

### Vérifier un certificat TLS

```bash
# Inspecter le certificat d'un serveur
openssl s_client -connect google.com:443 2>/dev/null | openssl x509 -text -noout

# Vérifier les dates de validité
echo | openssl s_client -connect google.com:443 2>/dev/null | openssl x509 -noout -dates
```

---

## Chiffrement pratique avec OpenSSL

```bash
# Chiffrer un fichier avec AES-256-CBC
openssl enc -aes-256-cbc -pbkdf2 -salt -in secret.txt -out secret.enc

# Déchiffrer
openssl enc -d -aes-256-cbc -pbkdf2 -in secret.enc -out secret.txt

# Calculer le hash SHA-256 d'un fichier
sha256sum fichier.iso

# Hacher une chaîne
echo -n "Hello World" | sha256sum
```
