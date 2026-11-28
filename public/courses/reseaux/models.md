# Layers: the OSI and TCP/IP models

> Objectives: explain why networking is organized in layers, and place common protocols and devices in the right layer.

## Why layers

Sending an email involves wires, addresses, reliability, encryption and an application. One giant protocol doing everything would be impossible to build and evolve. Instead, networking is split into **layers**. Each layer offers a service to the layer above and relies on the one below, and knows nothing about the details of the others. Wi-Fi can replace Ethernet without changing your web browser.

## The TCP/IP model

The model the internet actually uses has four layers:

| Layer | Job | Examples | Unit of data |
|---|---|---|---|
| Application | what programs say to each other | HTTP, DNS, SMTP, SSH | message |
| Transport | delivery between programs | TCP, UDP | segment (TCP), datagram (UDP) |
| Internet | addressing and routing across networks | IP, ICMP | packet |
| Link | delivery on one local network | Ethernet, Wi-Fi | frame |

## The OSI model

The OSI model is a teaching reference with seven layers. You will meet its numbers in everyday conversations ("a layer 2 switch", "a layer 7 firewall"):

| # | OSI layer | Matches TCP/IP |
|---|---|---|
| 7 | Application | Application |
| 6 | Presentation (formats, encryption) | Application |
| 5 | Session (dialogues) | Application |
| 4 | Transport | Transport |
| 3 | Network | Internet |
| 2 | Data link | Link |
| 1 | Physical (signals, cables) | Link |

## Encapsulation

When data goes down the layers, each layer wraps it with its own header (and sometimes a trailer). This is **encapsulation**:

```text
Application:  [ HTTP request ]
Transport:    [ TCP header | HTTP request ]
Internet:     [ IP header | TCP header | HTTP request ]
Link:         [ Ethernet header | IP header | TCP header | HTTP request | trailer ]
```

On arrival, each layer reads its own header, removes it and hands the rest up. A switch only reads the Ethernet header, a router goes up to the IP header, and only the end hosts look at TCP and HTTP. That is why the same internet can carry any application.

## Addresses at each layer

The same message uses a different address at each layer, because each layer answers a different question:

| Layer | Address | Answers |
|---|---|---|
| Application | name, such as `example.org` | which service? |
| Transport | port number, such as 443 | which program on the machine? |
| Internet | IP address | which machine in the world? |
| Link | MAC address | which network card on this local network? |

A MAC address (48 bits, written `3c:52:82:aa:10:0b`) is only meaningful on one local network. An IP address is used to cross networks. At each hop, the IP addresses stay the same while the MAC addresses change.

## Key takeaways: layers

- Layers hide details: each one serves the layer above and uses the one below.
- TCP/IP has four layers (application, transport, internet, link); OSI has seven and is a vocabulary.
- Encapsulation: every layer adds its own header on the way down and removes it on the way up.
- Name, port, IP address and MAC address answer four different questions.

```quiz
At which TCP/IP layer does a router mainly work?
- [ ] Link
- [x] Internet
- [ ] Application
> A router reads the IP header to decide where to send a packet.
```

```quiz
What is encapsulation?
- [ ] Encrypting the data
- [x] Each layer wrapping the data with its own header on the way down
- [ ] Compressing packets
> Each layer adds a header that only the same layer on the other side reads.
```

```quiz
A packet crosses three routers between your laptop and a server (ignore NAT). What changes at each hop?
- [ ] The source and destination IP addresses
- [x] The MAC addresses
- [ ] The port numbers
> IP addresses stay the same end to end, while each hop uses a new frame with new MAC addresses.
```

```quiz
Which address answers the question "which program on the machine?"
- [ ] The MAC address
- [ ] The IP address
- [ ] The domain name
- [x] The port number
> The port number lets the transport layer deliver data to the right program on a host.
```
