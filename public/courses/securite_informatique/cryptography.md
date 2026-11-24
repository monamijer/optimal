# Applied cryptography

Cryptography is the mathematical foundation of all computer security. It makes it possible to encrypt, sign and verify the integrity of data.

## Symmetric encryption

A single key is used both to encrypt and to decrypt. It is fast and ideal for large volumes of data. Main problem: how do you exchange the key securely?

### AES: Advanced Encryption Standard

AES has been the world standard since 2001. Its variants depend on the key size:

- **AES-128**: 128 bits, secure, good performance
- **AES-256**: 256 bits, the currently recommended standard
- **AES-GCM**: authenticated mode, guarantees confidentiality AND integrity

### Algorithms to avoid

- **DES** (56 bits): broken since 1999, never use it
- **3DES**: deprecated since 2023, replace it with AES
- **RC4**: vulnerable, forbidden in TLS since RFC 7465

---

## Asymmetric encryption (PKI)

A pair of mathematically linked keys: the **public key** (which can be shared freely) and the **private key** (kept secret). It solves the key exchange problem of symmetric encryption.

### RSA

Based on the difficulty of factoring large integers. Recommended sizes: **RSA-2048 minimum**, RSA-4096 for maximum security. RSA-1024 is considered broken.

### Elliptic curves (ECC)

More efficient than RSA for equivalent security. An ECDSA-256 key offers security comparable to RSA-3072.

### Ed25519

A modern algorithm based on the Curve25519 curve. Recommended for SSH and digital signatures. Very fast and resistant to timing attacks.

```bash
# Generate an Ed25519 key pair for SSH
ssh-keygen -t ed25519 -C "user@machine" -f ~/.ssh/id_ed25519

# Generate an RSA-4096 pair
openssl genrsa -out private.pem 4096
openssl rsa -in private.pem -pubout -out public.pem
```

---

## Hash functions

A one-way transformation of data into a fixed-size fingerprint. Essential properties: **deterministic**, collision resistance, avalanche effect (1 changed bit = a completely different hash).

### SHA-2 and SHA-3

- **SHA-256**: the current standard, used in Bitcoin and in TLS certificates
- **SHA-512**: 512-bit version, stronger
- **SHA-3**: an alternative family, resistant to attacks on SHA-2

### Password hashing

Passwords are not encrypted, they are hashed with functions specially designed to be slow:

- **bcrypt**: standard since 1999, still secure
- **Argon2id**: winner of the 2015 Password Hashing Competition, recommended in 2024
- **scrypt**: resistant to hardware attacks (GPU/ASIC)

### Never use for passwords

MD5 and SHA-1 are **cryptographically broken** and must never be used to store passwords. MD5 should only be used as a non-secure checksum.

---

## TLS: Transport Layer Security

TLS is the protocol that secures HTTPS, email and most modern communications.

### TLS 1.3: how it works

TLS 1.3 (2018) simplifies and strengthens its predecessor. The negotiation takes a single round trip instead of two.

#### 1. Client Hello

The client sends the supported cipher suites, a random number, and its ephemeral Diffie-Hellman public key.

#### 2. Server Hello and Certificate

The server chooses the cipher suite and sends its X.509 certificate signed by a certificate authority (CA), along with its own ephemeral DH key.

#### 3. ECDHE key exchange

Both parties independently compute the same shared secret thanks to Diffie-Hellman. The key never travels over the network.

#### 4. Encrypted session

All communication is encrypted with AES-256-GCM or ChaCha20-Poly1305. **Perfect Forward Secrecy** is guaranteed thanks to the ephemeral keys.

### Checking a TLS certificate

```bash
# Inspect a server's certificate
openssl s_client -connect google.com:443 2>/dev/null | openssl x509 -text -noout

# Check the validity dates
echo | openssl s_client -connect google.com:443 2>/dev/null | openssl x509 -noout -dates
```

---

## Practical encryption with OpenSSL

```bash
# Encrypt a file with AES-256-CBC
openssl enc -aes-256-cbc -pbkdf2 -salt -in secret.txt -out secret.enc

# Decrypt
openssl enc -d -aes-256-cbc -pbkdf2 -in secret.enc -out secret.txt

# Compute the SHA-256 hash of a file
sha256sum file.iso

# Hash a string
echo -n "Hello World" | sha256sum
```
