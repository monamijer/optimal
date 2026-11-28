# Mécanismes de défense et durcissement

La défense en profondeur est le principe central : multipliez les couches de sécurité afin qu'aucune défaillance isolée ne compromette l'ensemble du système.

## Pare-feu : la première ligne de défense

Un pare-feu filtre le trafic réseau selon des règles définies. Il existe deux approches principales : **sans état** (stateless, filtre paquet par paquet) et **avec état** (stateful, suit l'état des connexions).

### Règles de base d'un bon pare-feu

```bash
# nftables — configuration recommandée sur Linux moderne
table inet filter {
    chain input {
        type filter hook input priority 0; policy drop;

        # Toujours accepter la boucle locale
        iif "lo" accept

        # Accepter les connexions déjà établies
        ct state established,related accept

        # Accepter SSH, HTTP, HTTPS
        tcp dport { 22, 80, 443 } accept

        # Journaliser et rejeter tout le reste
        log prefix "DROP: " drop
    }
    chain output { type filter hook output priority 0; policy accept; }
}
```

### Principe du moindre privilège

N'ouvrez que les ports strictement nécessaires. Tout ce qui n'est pas explicitement autorisé est interdit.

---

## IDS/IPS : la détection d'intrusion

Un **IDS** (Intrusion Detection System) détecte et alerte. Un **IPS** (Intrusion Prevention System) détecte et bloque automatiquement. Deux approches de détection :

- **Par signatures** : compare le trafic à une base de données de règles connues
- **Comportementale** : détecte les anomalies par rapport à une référence

### Fail2Ban : protection contre la force brute

Fail2Ban analyse les journaux et bannit automatiquement les adresses IP qui tentent des connexions répétées.

```bash
# Installer et activer Fail2Ban
sudo apt install fail2ban
sudo systemctl enable --now fail2ban

# Voir les IP bannies pour SSH
sudo fail2ban-client status sshd
```

---

## Durcissement de SSH

SSH est le protocole d'administration à distance le plus utilisé. Sa configuration par défaut peut être améliorée.

### Configuration sécurisée dans `/etc/ssh/sshd_config`

```bash
Port 2222                    # Changer le port par défaut
PermitRootLogin no           # Interdire la connexion directe en root
PasswordAuthentication no    # Authentification par clé uniquement
PubkeyAuthentication yes
MaxAuthTries 3               # Maximum 3 tentatives
ClientAliveInterval 300      # Déconnexion après 5 minutes d'inactivité
AllowUsers myuser            # Liste blanche des utilisateurs autorisés
Protocol 2                   # SSH v2 uniquement (option obsolète : OpenSSH actuel ne parle que v2)
```

### Clés SSH : bonnes pratiques

```bash
# Générer une clé Ed25519 (recommandé)
ssh-keygen -t ed25519 -C "identity@machine"

# Copier la clé publique vers le serveur
ssh-copy-id -i ~/.ssh/id_ed25519.pub user@server

# Permissions correctes (obligatoire)
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

---

## Durcissement du système Linux

### Paramètres du noyau : sysctl

```bash
# /etc/sysctl.d/99-security.conf

# Désactiver le routage IP (si la machine n'est pas un routeur)
net.ipv4.ip_forward = 0

# Protection contre le SYN flood
net.ipv4.tcp_syncookies = 1

# Désactiver les redirections ICMP
net.ipv4.conf.all.accept_redirects = 0

# Protection contre l'attaque Smurf
net.ipv4.icmp_echo_ignore_broadcasts = 1

# ASLR — randomisation de l'espace mémoire
kernel.randomize_va_space = 2
```

Appliquez les paramètres :

```bash
sudo sysctl -p /etc/sysctl.d/99-security.conf
```

### Gestion des permissions

```bash
# Fichiers sensibles à surveiller
sudo chmod 600 /etc/shadow      # Mots de passe hachés
sudo chmod 644 /etc/passwd
sudo chmod 700 ~/.ssh

# Trouver les fichiers avec le bit SUID (élévation de privilèges potentielle)
find / -perm -4000 -type f 2>/dev/null

# Trouver les fichiers modifiables par tout le monde
find /etc -perm /o+w -type f 2>/dev/null
```

---

## Chiffrement de disque : LUKS

Le chiffrement de disque protège les données au repos. Même si le disque est volé physiquement, les données restent inaccessibles.

```bash
# Créer un volume chiffré LUKS2 avec AES-256-XTS
sudo cryptsetup luksFormat --type luks2 /dev/sdb1

# Ouvrir le volume chiffré
sudo cryptsetup open /dev/sdb1 secure_vol

# Créer un système de fichiers et le monter
sudo mkfs.ext4 /dev/mapper/secure_vol
sudo mount /dev/mapper/secure_vol /mnt/secure

# Sauvegarder l'en-tête LUKS (crucial — sans lui = données perdues)
sudo cryptsetup luksHeaderBackup /dev/sdb1 --header-backup-file luks-header.img
```

---

## Audit et surveillance

### Journaux système avec journalctl

```bash
# Erreurs depuis le dernier démarrage
journalctl -p err -b

# Journaux SSH des 7 derniers jours
journalctl -u sshd --since "7 days ago"

# Tentatives de connexion échouées
grep "Failed password" /var/log/auth.log | awk '{print $11}' | sort | uniq -c | sort -rn
```

### Audit des ports et des services

```bash
# Ports TCP en écoute avec le processus associé
sudo ss -tlnp

# Services en cours d'exécution
sudo systemctl list-units --type=service --state=running

# Connexions réseau actives
sudo ss -anp
```

---

## Quiz : défense

```quiz
Que signifie `policy drop` dans une chaîne input de pare-feu ?
- [ ] Tous les paquets sont acceptés sauf si une règle les bloque
- [x] Tous les paquets sont rejetés sauf si une règle les accepte explicitement
- [ ] Les paquets sont journalisés mais jamais rejetés
> Refus par défaut : seul ce qui est explicitement autorisé passe. C'est le principe du moindre privilège.
```

```quiz
Quel paramètre fait que SSH n'accepte que les connexions par clé ?
- [ ] `PermitRootLogin no`
- [x] `PasswordAuthentication no`
- [ ] `MaxAuthTries 3`
> Désactiver l'authentification par mot de passe supprime les tentatives de devinette de mots de passe par force brute contre SSH.
```

```quiz
Pourquoi sauvegarder l'en-tête LUKS ?
- [ ] Il contient les fichiers chiffrés
- [x] S'il est endommagé, les données chiffrées ne peuvent plus être déverrouillées
- [ ] Il est nécessaire pour monter n'importe quel disque
> L'en-tête contient les emplacements de clés chiffrées. Sans lui, même la bonne phrase secrète est inutile.
```

```quiz
Quelle est la principale différence entre un IDS et un IPS ?
- [x] Un IDS détecte et alerte seulement, alors qu'un IPS peut aussi bloquer automatiquement
- [ ] Un IDS agit sur le réseau et un IPS seulement sur une machine
- [ ] Un IPS n'utilise que des signatures et un IDS que le comportement
> Les deux peuvent utiliser une détection par signatures ou comportementale. L'IPS est placé dans le flux et peut agir sur ce qu'il détecte.
```
