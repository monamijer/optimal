# Defense mechanisms and hardening

Defense in depth is the central principle: multiply layers of security so that no single failure compromises the whole system.

## Firewall: the first line of defense

A firewall filters network traffic according to defined rules. There are two main approaches: **stateless** (filters packet by packet) and **stateful** (tracks the state of connections).

### Basic rules of a good firewall

```bash
# nftables — recommended configuration on modern Linux
table inet filter {
    chain input {
        type filter hook input priority 0; policy drop;

        # Always accept loopback
        iif "lo" accept

        # Accept already established connections
        ct state established,related accept

        # Accept SSH, HTTP, HTTPS
        tcp dport { 22, 80, 443 } accept

        # Log and reject everything else
        log prefix "DROP: " drop
    }
    chain output { type filter hook output priority 0; policy accept; }
}
```

### Principle of least privilege

Open only the strictly necessary ports. Anything not explicitly allowed is forbidden.

---

## IDS/IPS: intrusion detection

An **IDS** (Intrusion Detection System) detects and alerts. An **IPS** (Intrusion Prevention System) detects and blocks automatically. Two detection approaches:

- **Signature-based**: compares traffic to a database of known rules
- **Behavior-based**: detects anomalies compared with a baseline

### Fail2Ban: brute-force protection

Fail2Ban analyzes logs and automatically bans IPs that attempt repeated logins.

```bash
# Install and enable Fail2Ban
sudo apt install fail2ban
sudo systemctl enable --now fail2ban

# See the IPs banned for SSH
sudo fail2ban-client status sshd
```

---

## SSH hardening

SSH is the most widely used remote administration protocol. Its default configuration can be improved.

### Secure configuration in `/etc/ssh/sshd_config`

```bash
Port 2222                    # Change the default port
PermitRootLogin no           # Forbid direct root login
PasswordAuthentication no    # Key-based authentication only
PubkeyAuthentication yes
MaxAuthTries 3               # Maximum 3 attempts
ClientAliveInterval 300      # Disconnect after 5 minutes of inactivity
AllowUsers myuser            # Whitelist of allowed users
Protocol 2                   # SSH v2 only (obsolete option: current OpenSSH only speaks v2)
```

### SSH keys: good practice

```bash
# Generate an Ed25519 key (recommended)
ssh-keygen -t ed25519 -C "identity@machine"

# Copy the public key to the server
ssh-copy-id -i ~/.ssh/id_ed25519.pub user@server

# Correct permissions (mandatory)
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

---

## Linux system hardening

### Kernel parameters: sysctl

```bash
# /etc/sysctl.d/99-security.conf

# Disable IP forwarding (if not a router)
net.ipv4.ip_forward = 0

# SYN flood protection
net.ipv4.tcp_syncookies = 1

# Disable ICMP redirects
net.ipv4.conf.all.accept_redirects = 0

# Protection against the Smurf attack
net.ipv4.icmp_echo_ignore_broadcasts = 1

# ASLR — memory space randomization
kernel.randomize_va_space = 2
```

Apply the settings:

```bash
sudo sysctl -p /etc/sysctl.d/99-security.conf
```

### Managing permissions

```bash
# Sensitive files to watch
sudo chmod 600 /etc/shadow      # Hashed passwords
sudo chmod 644 /etc/passwd
sudo chmod 700 ~/.ssh

# Find files with the SUID bit (potential privilege escalation)
find / -perm -4000 -type f 2>/dev/null

# Find files writable by everyone
find /etc -perm /o+w -type f 2>/dev/null
```

---

## Disk encryption: LUKS

Disk encryption protects data at rest. Even if the disk is physically stolen, the data stays inaccessible.

```bash
# Create a LUKS2 encrypted volume with AES-256-XTS
sudo cryptsetup luksFormat --type luks2 /dev/sdb1

# Open the encrypted volume
sudo cryptsetup open /dev/sdb1 secure_vol

# Create a filesystem and mount it
sudo mkfs.ext4 /dev/mapper/secure_vol
sudo mount /dev/mapper/secure_vol /mnt/secure

# Back up the LUKS header (crucial — without it = lost data)
sudo cryptsetup luksHeaderBackup /dev/sdb1 --header-backup-file luks-header.img
```

---

## Auditing and monitoring

### System logs with journalctl

```bash
# Errors since the last boot
journalctl -p err -b

# SSH logs for the last 7 days
journalctl -u sshd --since "7 days ago"

# Failed login attempts
grep "Failed password" /var/log/auth.log | awk '{print $11}' | sort | uniq -c | sort -rn
```

### Auditing ports and services

```bash
# Listening TCP ports with the associated process
sudo ss -tlnp

# Running services
sudo systemctl list-units --type=service --state=running

# Active network connections
sudo ss -anp
```
