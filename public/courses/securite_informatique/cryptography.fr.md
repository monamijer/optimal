# Cryptographie appliquée

La cryptographie est le fondement mathématique de toute la sécurité informatique. Elle permet de chiffrer, de signer et de vérifier l'intégrité des données.

## Chiffrement symétrique

Une seule clé sert à la fois à chiffrer et à déchiffrer. Il est rapide et idéal pour de gros volumes de données. Problème principal : comment échanger la clé de manière sécurisée ?

### AES : Advanced Encryption Standard

AES est le standard mondial depuis 2001. Ses variantes dépendent de la taille de la clé :

- **AES-128** : 128 bits, sûr, bonnes performances
- **AES-256** : 256 bits, le standard actuellement recommandé
- **AES-GCM** : mode authentifié, garantit la confidentialité ET l'intégrité

### Algorithmes à éviter

- **DES** (56 bits) : cassé depuis 1999, ne l'utilisez jamais
- **3DES** : déprécié depuis 2023, remplacez-le par AES
- **RC4** : vulnérable, interdit dans TLS depuis la RFC 7465

---

## Chiffrement asymétrique (PKI)

Une paire de clés mathématiquement liées : la **clé publique** (qui peut être partagée librement) et la **clé privée** (gardée secrète). Il résout le problème d'échange de clés du chiffrement symétrique.

### RSA

Fondé sur la difficulté de factoriser de grands entiers. Tailles recommandées : **RSA-2048 au minimum**, RSA-4096 pour une sécurité maximale. RSA-1024 est considéré comme cassé.

### Courbes elliptiques (ECC)

Plus efficaces que RSA pour une sécurité équivalente. Une clé ECDSA-256 offre une sécurité comparable à RSA-3072.

### Ed25519

Un algorithme moderne fondé sur la courbe Curve25519. Recommandé pour SSH et les signatures numériques. Très rapide et résistant aux attaques par canal temporel.

```bash
# Générer une paire de clés Ed25519 pour SSH
ssh-keygen -t ed25519 -C "user@machine" -f ~/.ssh/id_ed25519

# Générer une paire RSA-4096
openssl genrsa -out private.pem 4096
openssl rsa -in private.pem -pubout -out public.pem
```

---

## Fonctions de hachage

Une transformation à sens unique de données en une empreinte de taille fixe. Propriétés essentielles : **déterministe**, résistance aux collisions, effet avalanche (1 bit modifié = un hachage complètement différent).

### SHA-2 et SHA-3

- **SHA-256** : le standard actuel, utilisé dans Bitcoin et dans les certificats TLS
- **SHA-512** : version 512 bits, plus robuste
- **SHA-3** : une famille alternative, résistante aux attaques contre SHA-2

### Hachage des mots de passe

Les mots de passe ne sont pas chiffrés, ils sont hachés avec des fonctions spécialement conçues pour être lentes :

- **bcrypt** : standard depuis 1999, toujours sûr
- **Argon2id** : vainqueur du Password Hashing Competition de 2015, recommandé en 2024
- **scrypt** : résistant aux attaques matérielles (GPU/ASIC)

### À ne jamais utiliser pour les mots de passe

MD5 et SHA-1 sont **cryptographiquement cassés** et ne doivent jamais servir à stocker des mots de passe. MD5 ne doit être utilisé que comme somme de contrôle non sécurisée.

---

## TLS : Transport Layer Security

TLS est le protocole qui sécurise HTTPS, la messagerie et la plupart des communications modernes.

### TLS 1.3 : fonctionnement

TLS 1.3 (2018) simplifie et renforce son prédécesseur. La négociation prend un seul aller-retour au lieu de deux.

#### 1. Client Hello

Le client envoie les suites de chiffrement prises en charge, un nombre aléatoire et sa clé publique Diffie-Hellman éphémère.

#### 2. Server Hello et certificat

Le serveur choisit la suite de chiffrement et envoie son certificat X.509 signé par une autorité de certification (CA), ainsi que sa propre clé DH éphémère.

#### 3. Échange de clés ECDHE

Les deux parties calculent indépendamment le même secret partagé grâce à Diffie-Hellman. La clé ne circule jamais sur le réseau.

#### 4. Session chiffrée

Toute la communication est chiffrée avec AES-256-GCM ou ChaCha20-Poly1305. La **Perfect Forward Secrecy** (confidentialité persistante) est garantie grâce aux clés éphémères.

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

# Calculer le hachage SHA-256 d'un fichier
sha256sum file.iso

# Hacher une chaîne
echo -n "Hello World" | sha256sum
```

---

## Quiz : la cryptographie

```quiz
Comment faut-il stocker les mots de passe ?
- [ ] Chiffrés avec AES-256, pour pouvoir les récupérer
- [ ] Hachés avec SHA-256 ou MD5
- [x] Hachés avec une fonction lente et salée comme Argon2id ou bcrypt
> Les hachages de mots de passe doivent être lents à calculer pour que les tentatives de devinette coûtent cher. Les hachages rapides comme MD5 et SHA-256 sont vite retrouvés par force brute.
```

```quiz
Quel est le principal avantage du chiffrement asymétrique par rapport au chiffrement symétrique ?
- [ ] Il est beaucoup plus rapide
- [x] Il évite d'avoir à partager une clé secrète à l'avance
- [ ] Il n'a besoin d'aucune clé
> La clé publique peut être partagée ouvertement ; seule la clé privée doit rester secrète. En pratique, TLS utilise des méthodes asymétriques pour convenir d'une clé, puis un chiffrement symétrique rapide pour les données.
```

```quiz
Que garantit la Perfect Forward Secrecy ?
- [ ] Le certificat du serveur ne peut jamais expirer
- [x] Enregistrer le trafic aujourd'hui et voler la clé du serveur plus tard ne révèle pas les sessions passées
- [ ] Les mots de passe ne sont jamais transmis
> Des clés éphémères sont utilisées pour chaque session puis éliminées, donc la compromission d'une clé n'expose pas le trafic plus ancien.
```

```quiz
Qu'apporte le mode AES-GCM qu'un mode de chiffrement simple n'apporte pas ?
- [x] Un chiffrement authentifié : confidentialité et intégrité
- [ ] Une clé plus courte pour la même sécurité
- [ ] Une protection contre les ordinateurs quantiques
> GCM ajoute une étiquette d'authentification : toute modification du texte chiffré est détectée au déchiffrement.
```
