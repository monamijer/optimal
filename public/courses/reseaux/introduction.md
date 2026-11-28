# How computers talk to each other

> Objectives: describe what a network is, name its building blocks, and follow a web request from your browser to a server.

## What is a network?

A computer network is a set of devices that exchange data over a shared medium: cables, radio waves or optical fiber. The internet is a network of networks: thousands of independent networks (universities, operators, companies, homes) that agree to speak the same protocols.

A **protocol** is a set of rules that both sides follow: the format of messages, their order, what to do on error. Without a shared protocol, two machines cannot understand each other, like two people with no common language.

## The building blocks

| Element | Role |
|---|---|
| **Host** | a device that sends or receives data (laptop, phone, server) |
| **Switch** | connects hosts inside one local network and forwards frames to the right port |
| **Router** | connects different networks and forwards packets between them |
| **Access point** | lets wireless devices join a wired network |
| **Link** | the medium between two devices: Ethernet cable, fiber, Wi-Fi |

Networks are classified by reach: a **LAN** (local area network) covers a home, a school or an office; a **WAN** (wide area network) connects distant sites, and the internet is the largest one.

## Packets

Data is not sent as one continuous stream. It is cut into small units called **packets**, each carrying a header (who it is for, where it comes from, its position) and a piece of the data. Packets travel independently, may take different paths, and are reassembled at the destination. This is called **packet switching**, and it lets many conversations share the same links efficiently and survive the failure of one path.

Two measures describe a link:

- **Bandwidth**: how much data can be sent per second (for example 100 Mbit/s);
- **Latency**: how long one packet takes to arrive (for example 30 ms).

They are different: a satellite link may have high bandwidth and still feel slow because of its latency.

## A web request, from start to finish

When you open a page, a lot happens in a fraction of a second:

1. Your browser asks **DNS** to translate the site name into an IP address.
2. Your computer opens a **TCP connection** to that address.
3. It sends an **HTTP request** (`GET /`).
4. Packets cross your switch, your home router, your operator and several routers on the way.
5. The server answers with the page, again as packets.
6. Your browser reassembles the data and displays the page.

The next chapters explain each of these steps, layer by layer.

## Key takeaways: how computers talk

- A network connects hosts through switches and routers; the internet is a network of networks.
- A protocol is a shared set of rules; data travels as independent packets.
- Bandwidth is capacity, latency is delay.
- Opening a web page involves DNS, a TCP connection and an HTTP exchange.

```quiz
Which device connects two different networks and forwards packets between them?
- [ ] A switch
- [x] A router
- [ ] An access point
> A switch works inside one local network; a router moves packets from one network to another.
```

```quiz
A link has high bandwidth but each packet takes 600 ms to arrive. What is high?
- [ ] Its bandwidth is low
- [x] Its latency
- [ ] Nothing, bandwidth and latency are the same
> Bandwidth is the quantity per second; latency is the delay of a single packet.
```

```quiz
What does a browser do first when you open a page, before it can open a TCP connection to the site?
- [ ] It sends an HTTP `GET` request
- [x] It asks DNS to translate the site name into an IP address
- [ ] It reassembles the packets
> The TCP connection needs an IP address, so the name must be resolved by DNS first.
```

```quiz
Why is data cut into packets instead of being sent as one continuous stream?
- [x] Many conversations can share the same links, and traffic can survive the failure of one path
- [ ] Because packets are automatically encrypted
- [ ] Because every packet must follow the same path to stay in order
> Packet switching lets conversations share links efficiently, and packets can take different paths and be reassembled at the destination.
```
