# Sécurité réseau et protocoles

Comprendre les protocoles réseau est essentiel pour la sécurité. Chaque couche du modèle OSI a ses propres vulnérabilités et ses propres mécanismes de protection.

## Le modèle OSI et la sécurité

Le modèle OSI découpe la communication réseau en 7 couches. Chaque couche expose des vulnérabilités spécifiques.

### Couche application (7) : HTTP, DNS, SMTP

Attaques typiques : XSS, injection SQL, hameçonnage, MITM au niveau applicatif.

Défenses : WAF (Web Application Firewall, pare-feu applicatif), validation des entrées, HTTPS.

### Couche transport (4) : TCP, UDP

Attaques typiques : SYN flood, balayage de ports, détournement de session TCP.

Défenses : pare-feu à état, limitation de débit, SYN cookies.

### Couche réseau (3) : IP, ICMP

Attaques typiques : usurpation d'adresse IP, attaque Smurf, routage malveillant.

Défenses : filtrage en entrée et en sortie, uRPF (Unicast Reverse Path Forwarding).

### Couche liaison de données (2) : Ethernet, WiFi

Attaques typiques : empoisonnement ARP, saturation de la table MAC, attaques WiFi.

Défenses : 802.1X, Dynamic ARP Inspection (DAI), segmentation en VLAN.

---

## Empoisonnement ARP : l'homme du milieu

Le protocole ARP associe une adresse IP à une adresse MAC. Il n'a **aucune authentification** : n'importe qui peut envoyer une réponse ARP falsifiée.

### Fonctionnement de l'attaque

L'attaquant envoie des réponses ARP non sollicitées pour associer son adresse MAC à l'adresse IP d'une victime. Les deux machines communiquent alors en croyant parler directement l'une à l'autre, mais tout le trafic passe par l'attaquant.

### Se protéger contre l'empoisonnement ARP

Plusieurs mécanismes de défense existent :

- **Entrées ARP statiques** : configurer manuellement l'association IP/MAC pour les équipements critiques
- **Dynamic ARP Inspection** : valider les réponses ARP par rapport à une table de référence
- **Arpwatch** : surveiller les changements dans la table ARP et déclencher des alertes
- **Chiffrement** : même intercepté, le trafic chiffré (TLS) est inexploitable

---

## Outils réseau essentiels

Utilisez ces outils uniquement sur des réseaux et des machines qui vous appartiennent ou que vous êtes explicitement autorisé à tester.

### Nmap : scanner de ports

Nmap est l'outil de référence pour la découverte réseau et l'audit de sécurité.

```bash
nmap -sV -O 192.168.1.1           # Détection de version + OS
nmap -sS -p 1-65535 192.168.1.1   # Scan TCP SYN de tous les ports
nmap -A -T4 192.168.1.0/24        # Scan complet du réseau local
nmap --script vuln 192.168.1.1    # Scan de vulnérabilités NSE
```

### Tcpdump : capture de trafic

```bash
sudo tcpdump -i eth0                          # Écouter sur eth0
sudo tcpdump -i any port 80 -w capture.pcap   # Capturer le HTTP dans un fichier
sudo tcpdump -r capture.pcap                  # Lire une capture
```

### Netcat : le couteau suisse du réseau

```bash
nc -lvp 4444               # Écouter sur le port 4444
nc 192.168.1.10 4444       # Se connecter à un hôte
nc -zv 192.168.1.1 20-100  # Scan de ports simple
```

---

## Protocoles sécurisés et non sécurisés

Il est crucial de savoir quels protocoles éviter et par quoi les remplacer.

### À éviter absolument

Les protocoles suivants envoient les données en clair et doivent être remplacés :

- **Telnet** → remplacer par **SSH**
- **FTP** → remplacer par **SFTP** ou **FTPS**
- **HTTP** → remplacer par **HTTPS** (TLS)
- **SMTP sans TLS** → utiliser **STARTTLS** ou **SMTPS**

### Sécurité du DNS (DNSSEC)

Le DNS classique est vulnérable à l'empoisonnement du cache. DNSSEC ajoute des signatures cryptographiques pour valider les réponses DNS et empêcher leur falsification.

---

## Quiz : la sécurité réseau

```quiz
Pourquoi l'empoisonnement ARP est-il possible ?
- [ ] ARP est chiffré avec une clé faible
- [x] ARP n'a aucune authentification : n'importe quel hôte peut envoyer une réponse falsifiée
- [ ] Les commutateurs diffusent tout le trafic sur chaque port
> Les hôtes acceptent les réponses ARP non sollicitées, un attaquant peut donc associer son adresse MAC à l'adresse IP de quelqu'un d'autre.
```

```quiz
Quel protocole doit remplacer Telnet ?
- [ ] FTP
- [x] SSH
- [ ] HTTP
> Telnet envoie tout, mots de passe compris, en clair. SSH chiffre la session.
```

```quiz
Quelle défense vise une inondation SYN (SYN flood) ?
- [x] Les SYN cookies et la limitation de débit
- [ ] La Dynamic ARP Inspection
- [ ] DNSSEC
> Une inondation SYN vise la poignée de main TCP, au niveau transport. Les SYN cookies évitent de conserver un état pour les connexions à moitié ouvertes.
```

```quiz
Qu'ajoute DNSSEC au DNS ?
- [ ] Le chiffrement de chaque requête DNS
- [x] Des signatures cryptographiques qui permettent aux résolveurs de valider les réponses
- [ ] Un cache plus rapide
> DNSSEC protège l'authenticité et l'intégrité des réponses contre l'empoisonnement de cache, mais ne chiffre pas les requêtes.
```
