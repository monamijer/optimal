# Network security and protocols

Understanding network protocols is essential for security. Each layer of the OSI model has its own vulnerabilities and protection mechanisms.

## The OSI model and security

The OSI model splits network communication into 7 layers. Each layer exposes specific vulnerabilities.

### Application layer (7): HTTP, DNS, SMTP

Typical attacks: XSS, SQL injection, phishing, application-level MITM.

Defenses: WAF (Web Application Firewall), input validation, HTTPS.

### Transport layer (4): TCP, UDP

Typical attacks: SYN flood, port scanning, TCP session hijacking.

Defenses: stateful firewall, rate limiting, SYN cookies.

### Network layer (3): IP, ICMP

Typical attacks: IP spoofing, Smurf attack, malicious routing.

Defenses: ingress/egress filtering, uRPF (Unicast Reverse Path Forwarding).

### Data link layer (2): Ethernet, WiFi

Typical attacks: ARP poisoning, MAC flooding, WiFi attacks.

Defenses: 802.1X, Dynamic ARP Inspection (DAI), VLAN segmentation.

---

## ARP poisoning: man in the middle

The ARP protocol maps an IP address to a MAC address. It has **no authentication**: anyone can send a forged ARP reply.

### How the attack works

The attacker sends unsolicited ARP replies to associate their MAC address with a victim's IP. The two machines then communicate believing they are talking directly to each other, but all the traffic goes through the attacker.

### Protecting against ARP poisoning

Several defense mechanisms exist:

- **Static ARP entries**: manually configure the IP/MAC association for critical equipment
- **Dynamic ARP Inspection**: validate ARP replies against a reference table
- **Arpwatch**: monitor changes in the ARP table and raise alerts
- **Encryption**: even if intercepted, encrypted traffic (TLS) is unusable

---

## Essential network tools

Use these tools only on networks and machines you own or are explicitly authorized to test.

### Nmap: port scanner

Nmap is the reference tool for network discovery and security auditing.

```bash
nmap -sV -O 192.168.1.1           # Version + OS detection
nmap -sS -p 1-65535 192.168.1.1   # TCP SYN scan of all ports
nmap -A -T4 192.168.1.0/24        # Full scan of the local network
nmap --script vuln 192.168.1.1    # NSE vulnerability scan
```

### Tcpdump: traffic capture

```bash
sudo tcpdump -i eth0                          # Listen on eth0
sudo tcpdump -i any port 80 -w capture.pcap   # Capture HTTP to a file
sudo tcpdump -r capture.pcap                  # Read a capture
```

### Netcat: the network Swiss army knife

```bash
nc -lvp 4444               # Listen on port 4444
nc 192.168.1.10 4444       # Connect to a host
nc -zv 192.168.1.1 20-100  # Simple port scan
```

---

## Secure vs insecure protocols

It is crucial to know which protocols to avoid and their secure replacements.

### To avoid at all costs

The following protocols send data in clear text and must be replaced:

- **Telnet** → replace with **SSH**
- **FTP** → replace with **SFTP** or **FTPS**
- **HTTP** → replace with **HTTPS** (TLS)
- **SMTP without TLS** → use **STARTTLS** or **SMTPS**

### DNS security (DNSSEC)

Classic DNS is vulnerable to cache poisoning. DNSSEC adds cryptographic signatures to validate DNS answers and prevent tampering.

---

## Quiz: network security

```quiz
Why is ARP poisoning possible?
- [ ] ARP is encrypted with a weak key
- [x] ARP has no authentication: any host can send a forged reply
- [ ] Switches broadcast all traffic to every port
> Hosts accept unsolicited ARP replies, so an attacker can associate their MAC address with someone else's IP.
```

```quiz
Which protocol should replace Telnet?
- [ ] FTP
- [x] SSH
- [ ] HTTP
> Telnet sends everything, passwords included, in clear text. SSH encrypts the session.
```
