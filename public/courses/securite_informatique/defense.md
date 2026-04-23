# Mécanismes de Défense et Hardening

La défense en profondeur (Defense in Depth) est le principe central : multiplier les couches de sécurité pour qu'aucune défaillance unique ne compromette tout le système.

## Firewall — Première ligne de défense

Un firewall filtre le trafic réseau selon des règles définies. Deux approches principales : **stateless** (filtre paquet par paquet) et **stateful** (suit l'état des connexions).

### Règles de base d'un bon firewall

```bash
# nftables — Configuration recommandée sur Linux moderne
table inet filter {
    chain input {
        type filter hook input priority 0; policy drop;

        # Toujours accepter le loopback
        iif "lo" accept

        # Accepter les connexions déjà établies
        ct state established,related accept

        # Accepter SSH, HTTP, HTTPS
        tcp dport { 22, 80, 443 } accept

        # Loguer et rejeter tout le reste
        log prefix "DROP: " drop
    }
    chain output { type filter hook output priority 0; policy accept; }
}
```

### Principe du moindre privilège

N'ouvrir que les ports strictement nécessaires. Tout ce qui n'est pas explicitement autorisé est interdit.

---

## IDS/IPS — Détection d'intrusion

Un **IDS** (Intrusion Detection System) détecte et alerte. Un **IPS** (Intrusion Prevention System) détecte et bloque automatiquement. Deux approches de détection :

- **Par signatures** : compare le trafic à une base de règles connues
- **Par comportement** : détecte les anomalies par rapport à une baseline

### Fail2Ban — Protection brute-force

Fail2Ban analyse les logs et bannit automatiquement les IPs qui tentent des connexions répétées.

```bash
# Installer et activer Fail2Ban
sudo apt install fail2ban
sudo systemctl enable --now fail2ban

# Voir les IPs bannies pour SSH
sudo fail2ban-client status sshd
```

---

## Hardening SSH

SSH est le protocole d'administration à distance le plus utilisé. Sa configuration par défaut peut être améliorée.

### Configuration sécurisée `/etc/ssh/sshd_config`

```bash
Port 2222                    # Changer le port par défaut
PermitRootLogin no           # Interdire login root direct
PasswordAuthentication no    # Authentification par clé uniquement
PubkeyAuthentication yes
MaxAuthTries 3               # Maximum 3 tentatives
ClientAliveInterval 300      # Déconnecter après 5min d'inactivité
AllowUsers monuser           # Whitelist des utilisateurs autorisés
Protocol 2                   # SSH v2 seulement
```

### Clés SSH — Bonne pratique

```bash
# Générer une clé Ed25519 (recommandé)
ssh-keygen -t ed25519 -C "identite@machine"

# Copier la clé publique sur le serveur
ssh-copy-id -i ~/.ssh/id_ed25519.pub user@serveur

# Permissions correctes (obligatoires)
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

---

## Hardening système Linux

### Paramètres noyau — sysctl

```bash
# /etc/sysctl.d/99-security.conf

# Désactiver IP forwarding (si pas routeur)
net.ipv4.ip_forward = 0

# Protection SYN flood
net.ipv4.tcp_syncookies = 1

# Désactiver les redirections ICMP
net.ipv4.conf.all.accept_redirects = 0

# Protection contre le Smurf attack
net.ipv4.icmp_echo_ignore_broadcasts = 1

# ASLR — Randomisation de l'espace mémoire
kernel.randomize_va_space = 2

# Appliquer
sudo sysctl -p /etc/sysctl.d/99-security.conf
```

### Gestion des permissions

```bash
# Fichiers sensibles à surveiller
sudo chmod 600 /etc/shadow      # Mots de passe hashés
sudo chmod 644 /etc/passwd
sudo chmod 700 ~/.ssh

# Trouver les fichiers avec bit SUID (escalade de privilèges potentielle)
find / -perm -4000 -type f 2>/dev/null

# Trouver les fichiers modifiables par tous
find /etc -perm /o+w -type f 2>/dev/null
```

---

## Chiffrement de disque — LUKS

Le chiffrement de disque protège les données au repos. Même si le disque est volé physiquement, les données restent inaccessibles.

```bash
# Créer un volume chiffré LUKS2 avec AES-256-XTS
sudo cryptsetup luksFormat --type luks2 /dev/sdb1

# Ouvrir le volume chiffré
sudo cryptsetup open /dev/sdb1 secure_vol

# Créer un filesystem et monter
sudo mkfs.ext4 /dev/mapper/secure_vol
sudo mount /dev/mapper/secure_vol /mnt/secure

# Sauvegarder le header LUKS (crucial — sans lui = données perdues)
sudo cryptsetup luksHeaderBackup /dev/sdb1 --header-backup-file luks-header.img
```

---

## Audit et surveillance

### Journaux système avec journalctl

```bash
# Erreurs depuis le dernier démarrage
journalctl -p err -b

# Logs SSH des 7 derniers jours
journalctl -u sshd --since "7 days ago"

# Tentatives de connexion échouées
grep "Failed password" /var/log/auth.log | awk '{print $11}' | sort | uniq -c | sort -rn
```

### Audit des ports et services

```bash
# Ports TCP en écoute avec le processus associé
sudo ss -tlnp

# Services actifs
sudo systemctl list-units --type=service --state=running

# Connexions réseau actives
sudo ss -anp
```
