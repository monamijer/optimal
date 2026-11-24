# Securing a network

> Objectives: understand what firewalls, VPNs and segmentation protect against, and recognize common network attacks.

## The goals

Network security aims at three properties, often called the CIA triad:

| Property | Question | Example of failure |
|---|---|---|
| **Confidentiality** | can only the right people read it? | passwords sniffed on open Wi-Fi |
| **Integrity** | has the data been altered? | a page modified on the way |
| **Availability** | is the service reachable? | a server flooded with requests |

## Firewalls

A **firewall** filters traffic according to rules. A packet filter looks at addresses, protocols and ports: "allow TCP to port 443, block everything else". A **stateful** firewall also remembers the connections it has seen, so it can allow the replies to a connection that started from inside, and refuse unsolicited traffic from outside.

Two principles make rules robust:

- **Default deny**: block everything, then allow only what is needed.
- **Least privilege**: open the smallest set of ports, to the smallest set of sources.

Rules are evaluated in order, and the first match wins, so the order matters. An application firewall (layer 7) goes further and inspects the content, such as web requests.

## Segmentation

Do not put everything in one flat network. Place servers, staff, guests and devices such as printers or cameras in **separate segments** (subnets or VLANs), with a firewall between them. A public web server goes in a **DMZ**, a zone exposed to the internet but isolated from the internal network. If one machine is compromised, the attacker cannot move freely to the rest.

## VPN

A **VPN** (virtual private network) creates an encrypted tunnel between two points across an untrusted network. It is used to reach a company network remotely, to connect two sites, or to protect traffic on a public hotspot. A VPN moves trust from the local network to the VPN provider or endpoint: it protects the path, not the destination.

## Common attacks

| Attack | How it works | Main defenses |
|---|---|---|
| **Sniffing** | reading traffic on a shared medium | encryption (TLS, VPN), switches instead of hubs |
| **ARP spoofing** | a host lies about its MAC address to intercept local traffic | dynamic ARP inspection, encryption |
| **Man in the middle** | an attacker sits between two parties | TLS with certificate validation |
| **DNS spoofing** | forged DNS answers send you to the wrong server | DNSSEC, HTTPS, trusted resolvers |
| **Port scan** | probing which ports answer, to find services to attack | firewall, close unused services |
| **DoS / DDoS** | exhausting a service with traffic from one or many sources | rate limiting, filtering at the operator, CDN |
| **Phishing** | tricking people into entering credentials on a fake site | training, MFA, certificate and URL checks |

Many of these attacks exploit the same weakness: the original protocols (ARP, plain DNS, plain HTTP) trust whatever they receive. Security is added on top, which is why **encryption and authentication** (TLS) matter more than any single device.

## Habits that matter

- Keep systems and firmware **updated**: most attacks use known vulnerabilities.
- Use **strong, unique passwords** and **multi-factor authentication**.
- Expose **only the services that need to be public**, and disable the rest.
- Use encrypted protocols: SSH instead of Telnet, HTTPS instead of HTTP.
- **Log and monitor**: you cannot react to what you do not see.
- Assume that the internal network can be breached: do not rely on the perimeter alone ("defense in depth").

## Key takeaways: securing a network

- Protect confidentiality, integrity and availability.
- Firewalls: default deny, least privilege, rules evaluated in order.
- Segment networks and isolate public servers in a DMZ.
- A VPN encrypts the path; TLS authenticates and encrypts the connection end to end.
- Updates, MFA, minimal exposure and monitoring prevent most incidents.

```quiz
A firewall's rules are: 1) allow TCP port 443; 2) deny everything. A packet for TCP port 22 arrives. What happens?
- [ ] It is allowed, because SSH is common
- [x] It is denied by rule 2
- [ ] It is allowed, because rules are evaluated in any order
> Rules are evaluated in order; port 22 does not match rule 1 and is blocked by the default deny rule.
```

```quiz
What does a VPN protect on a public Wi-Fi network?
- [ ] It makes the destination website trustworthy
- [x] It encrypts the traffic between you and the VPN endpoint
- [ ] It removes the need for HTTPS everywhere
> A VPN protects the path between the endpoints; it does not vouch for the site you finally reach.
```
