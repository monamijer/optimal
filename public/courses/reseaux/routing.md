# Switching and routing

> Objectives: explain how a switch and a router each decide where to send data, and read a routing table.

## Switching inside a LAN

A **switch** connects the hosts of one local network. It works with **MAC addresses**. It learns by observing: when a frame arrives on port 3 with source MAC `AA`, the switch records "AA is reachable on port 3" in its **MAC table**. When a frame for `AA` comes later, it is sent only out of port 3. If the destination is unknown, the switch sends the frame out of all other ports (flooding) until the answer reveals where that host is.

To find the MAC address that goes with an IP address on the same network, a host uses **ARP**: it broadcasts "who has 192.168.10.1?" and the owner answers with its MAC address. The result is kept in an ARP cache.

**VLANs** let one physical switch behave as several separate logical networks, for example to isolate guests from staff. Hosts in different VLANs can only communicate through a router.

## Routing between networks

A **router** has an interface in each of the networks it connects, and a **routing table** that says, for each destination network, where to send the packet next (the **next hop**).

```text
Destination         Next hop        Interface
192.168.10.0/24     directly        eth0
10.20.0.0/16        192.168.10.2    eth0
0.0.0.0/0           203.0.113.1     eth1
```

For every packet, the router compares the destination address with the table and picks the **most specific** matching entry, the one with the longest prefix. This is the **longest prefix match**. A packet for `10.20.5.9` matches `10.20.0.0/16` and also the default route `0.0.0.0/0`; the first is longer, so it wins. The entry `0.0.0.0/0` is the **default route**, used when nothing else matches, usually towards the operator.

Each router makes its decision independently, forwards the packet and forgets it. The IP header contains a **TTL** (time to live) that every router decrements; when it reaches 0, the packet is dropped. This prevents a routing loop from circulating packets forever.

## How routing tables are filled

- **Static routes**: written by an administrator. Simple and predictable, fine for small networks.
- **Dynamic routing protocols**: routers exchange information and compute routes by themselves, and adapt to failures. Inside an organization, protocols such as **OSPF** are used; between operators on the internet, **BGP** announces which address blocks each network can reach.

Because BGP relies largely on trust between operators, a wrong announcement can send a part of the world's traffic to the wrong place. This has happened several times and is one of the internet's known fragilities.

## Following one packet

Your laptop (`192.168.10.50/24`) sends data to a server at `203.0.113.20`:

1. The destination is outside the laptop's subnet, so it sends the packet to the **default gateway**, the home router. It uses ARP to find the router's MAC address and addresses the **frame** to it.
2. The router removes the Ethernet header, reads the IP header, finds the default route, and **NATs** the source address to its public address.
3. It sends the packet to the operator's router, in a new frame with new MAC addresses.
4. Each following router repeats the lookup and decrements the TTL until the packet reaches the server's network.

Throughout the journey, the IP addresses stayed the same (apart from NAT), while the MAC addresses changed at each hop.

## Key takeaways: switching and routing

- A switch learns MAC addresses and forwards frames inside a LAN; ARP maps an IP address to a MAC address.
- A router uses its routing table with longest prefix match, and the default route when nothing else matches.
- The TTL stops packets from looping; OSPF and BGP fill routing tables dynamically.

```quiz
A router has the routes 10.0.0.0/8 and 10.20.0.0/16. Which one is used for a packet to 10.20.5.9?
- [ ] 10.0.0.0/8
- [x] 10.20.0.0/16
- [ ] Neither, it uses the default route
> Both match, and the longest prefix (the most specific route) wins.
```

```quiz
What does a switch use to decide the port on which to send a frame?
- [ ] The destination IP address
- [x] The destination MAC address
- [ ] The TCP port
> Switches work at the link layer and learn which MAC address is behind which port.
```
