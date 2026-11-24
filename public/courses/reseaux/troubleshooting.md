# Diagnosing network problems

> Objectives: apply a layer-by-layer method and use the standard tools to find where a connection breaks.

## A method: bottom up

"The internet doesn't work" can mean twenty different failures. The layered model gives a method: check from the bottom, and stop at the first thing that fails.

| Step | Question | Tool |
|---|---|---|
| 1. Link | is the cable plugged in, Wi-Fi connected? | link lights, system status |
| 2. Address | do I have an IP address, a gateway, a DNS server? | `ip addr` (Linux), `ipconfig` (Windows) |
| 3. Local network | can I reach the gateway? | `ping` the gateway |
| 4. Internet | can I reach an outside address? | `ping 8.8.8.8` |
| 5. Names | does DNS work? | `dig` or `nslookup` |
| 6. Service | is the service answering on its port? | `curl`, `ss`, `nc` |

Reading the result tells you where to look. Pinging an outside **address** works but pinging a **name** fails: the problem is DNS. Pinging the gateway fails: the problem is local (cable, Wi-Fi, address). Everything works except one site: the problem is probably on that site or on the path to it.

## The tools

### ping

Sends ICMP echo requests and measures the round-trip time.

```text
$ ping -c 3 192.168.10.1
```

Check three things: do the replies come back at all, how long do they take (latency), and how many are lost. Some servers and firewalls ignore ping, so silence does not always mean "down".

### traceroute

Shows the routers a packet crosses. It sends packets with a TTL of 1, 2, 3, and so on: each router that drops one because the TTL reached 0 reveals itself.

```text
$ traceroute example.org
```

A line of `* * *` means that hop did not answer (often it filters these probes), and the path may still work further along. Look for the hop where the latency suddenly jumps or the replies stop.

### dig

Queries DNS directly, bypassing the browser and its caches.

```text
$ dig example.org A
$ dig example.org MX
$ dig @8.8.8.8 example.org
```

The last form asks a specific resolver, which helps to tell if the problem is your own resolver.

### ip and ss

```text
$ ip addr          # interfaces and their addresses
$ ip route         # the routing table, including the default gateway
$ ss -tlnp         # TCP ports on which this machine is listening
```

### curl

Makes an HTTP request and shows what really happens, with headers and the status code.

```text
$ curl -I https://example.org
```

`curl -v` also shows the TLS handshake, useful for certificate errors.

## Typical symptoms

| Symptom | Likely cause |
|---|---|
| Address starting with `169.254` | no DHCP answer |
| Ping to the gateway fails | link, Wi-Fi, wrong VLAN or address |
| Ping to an IP works, names fail | DNS server wrong or unreachable |
| Name resolves to an unexpected address | stale cache or wrong DNS record |
| `Connection refused` | the machine answers, but nothing listens on that port |
| `Connection timed out` | packets are dropped: firewall, routing or the host is down |
| Certificate warning | expired certificate, wrong name, or a man in the middle |

The difference between "refused" and "timed out" is worth remembering: a refusal is an answer (someone is there), a timeout is silence.

## Key takeaways: diagnosing network problems

- Work bottom up: link, address, gateway, outside address, DNS, service.
- `ping` tests reachability, `traceroute` the path, `dig` the names, `ss` local ports, `curl` the application.
- "Connection refused" means reachable but closed; "timed out" means packets vanish on the way.

```quiz
`ping 8.8.8.8` works, but `ping example.org` fails with "unknown host". Where is the problem?
- [ ] The cable
- [ ] The default gateway
- [x] DNS name resolution
> The network path works, since an address answers. Only the name cannot be translated.
```

```quiz
You get "Connection refused" when connecting to a server's port 8080. What does it tell you?
- [ ] The server is switched off
- [x] The server is reachable, but no program listens on that port
- [ ] A router is dropping your packets silently
> A refusal is an explicit answer from the machine. A dropped packet would end in a timeout.
```
