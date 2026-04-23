# Sécurité Réseau et Protocoles

Comprendre les protocoles réseau est indispensable pour la sécurité. Chaque couche du modèle OSI a ses propres vulnérabilités et mécanismes de protection.

## Le modèle OSI et la sécurité

Le modèle OSI découpe les communications réseau en 7 couches. Chaque couche expose des vulnérabilités spécifiques.

### Couche Application (7) — HTTP, DNS, SMTP

Attaques typiques : XSS, injection SQL, phishing, MITM applicatif.

Défenses : WAF (Web Application Firewall), validation des entrées, HTTPS.

### Couche Transport (4) — TCP, UDP

Attaques typiques : SYN flood, scan de ports, détournement de session TCP.

Défenses : firewall avec inspection d'état, rate limiting, SYN cookies.

### Couche Réseau (3) — IP, ICMP

Attaques typiques : IP spoofing, attaque Smurf, routage malveillant.

Défenses : filtrage ingress/egress, uRPF (Unicast Reverse Path Forwarding).

### Couche Liaison (2) — Ethernet, WiFi

Attaques typiques : ARP poisoning, MAC flooding, attaques WiFi.

Défenses : 802.1X, Dynamic ARP Inspection (DAI), segmentation VLAN.

---

## ARP Poisoning — Man in the Middle

Le protocole ARP fait correspondre une adresse IP à une adresse MAC. Il n'a **aucune authentification** : n'importe qui peut envoyer une réponse ARP falsifiée.

### Comment fonctionne l'attaque

L'attaquant envoie des réponses ARP non sollicitées pour associer son adresse MAC à l'IP d'une victime. Les deux machines communiquent alors en croyant parler directement l'une à l'autre, mais tout le trafic passe par l'attaquant.

### Protection contre ARP Poisoning

Plusieurs mécanismes de défense existent :

- **Entrées ARP statiques** : configurer manuellement l'association IP/MAC pour les équipements critiques
- **Dynamic ARP Inspection** : valider les réponses ARP contre une table de référence
- **Arpwatch** : surveiller les changements dans la table ARP et alerter
- **Chiffrement** : même intercepté, un trafic chiffré (TLS) est inexploitable

---

## Outils réseau essentiels

### Nmap — Scanner de ports

Nmap est l'outil de référence pour la découverte réseau et l'audit de sécurité.

```bash
nmap -sV -O 192.168.1.1           # Détection version + OS
nmap -sS -p 1-65535 192.168.1.1   # Scan TCP SYN tous ports
nmap -A -T4 192.168.1.0/24        # Scan complet réseau local
nmap --script vuln 192.168.1.1    # Scan de vulnérabilités NSE
```

### Tcpdump — Capture de trafic

```bash
sudo tcpdump -i eth0                          # Écoute sur eth0
sudo tcpdump -i any port 80 -w capture.pcap   # Capture HTTP vers fichier
sudo tcpdump -r capture.pcap                  # Lire une capture
```

### Netcat — Le couteau suisse du réseau

```bash
nc -lvp 4444             # Écoute sur port 4444
nc 192.168.1.10 4444     # Connexion vers un hôte
nc -zv 192.168.1.1 20-100  # Scan de ports simple
```

---

## Protocoles sécurisés vs non sécurisés

Il est crucial de connaître les protocoles à éviter et leurs remplaçants sécurisés.

### À éviter absolument

Les protocoles suivants transmettent les données en clair et doivent être remplacés :

- **Telnet** → remplacer par **SSH**
- **FTP** → remplacer par **SFTP** ou **FTPS**
- **HTTP** → remplacer par **HTTPS** (TLS)
- **SMTP sans TLS** → utiliser **STARTTLS** ou **SMTPS**

### DNS Security (DNSSEC)

Le DNS classique est vulnérable au cache poisoning. DNSSEC ajoute des signatures cryptographiques pour valider les réponses DNS et éviter la manipulation.
