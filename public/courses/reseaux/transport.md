# TCP and UDP: the transport layer

> Objectives: use ports to reach the right program, and choose between TCP's reliability and UDP's speed.

## Ports

An IP address identifies a machine. A **port** (16 bits, 0 to 65535) identifies a program on that machine. A connection is therefore identified by four values: source IP, source port, destination IP, destination port. That is how your browser can hold ten tabs open to the same server at once.

| Range | Use |
|---|---|
| 0 to 1023 | well-known ports of standard services |
| 1024 to 49151 | registered ports |
| 49152 to 65535 | ephemeral ports, picked by the client for each connection |

| Port | Service |
|---|---|
| 22 | SSH |
| 25 | SMTP (sending email) |
| 53 | DNS |
| 80 | HTTP |
| 443 | HTTPS |

## UDP: send and forget

UDP (User Datagram Protocol) adds almost nothing to IP: ports and a checksum. It does not establish a connection, does not guarantee delivery, and does not keep order. In exchange it is light and fast.

It suits data where a late packet is worthless: voice and video calls, online games, and short request-answer exchanges such as DNS queries.

## TCP: reliable and ordered

TCP (Transmission Control Protocol) provides a **reliable, ordered stream of bytes** on top of an unreliable network. It does so with several mechanisms:

- a **connection** that both sides establish and close;
- **sequence numbers** on every byte, so the receiver can reorder and detect gaps;
- **acknowledgments**: the receiver confirms what it got; anything not acknowledged in time is sent again;
- **flow control**: the receiver announces how much it can accept (the window), so a fast sender does not drown a slow one;
- **congestion control**: the sender slows down when the network loses packets.

### The three-way handshake

Before data flows, the two sides agree on starting sequence numbers:

```text
Client                                  Server
  | ----- SYN (seq = x) --------------->  |   "I want to talk, my numbers start at x"
  | <---- SYN-ACK (seq = y, ack = x+1) -  |   "OK, mine start at y"
  | ----- ACK (ack = y+1) -------------->  |   "Understood"
  |            data can now flow          |
```

This costs one round trip before the first byte of data, which is one reason why latency matters so much for short web requests. A connection is closed with a similar exchange of `FIN` and `ACK` messages.

## TCP or UDP?

| | TCP | UDP |
|---|---|---|
| Connection | yes (handshake) | no |
| Delivery guaranteed | yes, with retransmission | no |
| Order kept | yes | no |
| Speed and overhead | slower, heavier | faster, lighter |
| Typical use | web, email, file transfer, SSH | DNS, calls, games, streaming |

Retransmission has a cost: if one packet is lost, TCP holds back everything behind it until it is recovered. For a live video call, it is better to skip the lost packet than to freeze the picture. That is the trade-off.

## Practice: ports

Work these out, type the answer and press **Check**.

```exercise
Which TCP port does plain (unencrypted) HTTP use by default? Answer with the number.
--- answer
80
--- explain
HTTP uses 80; HTTPS, its encrypted version, uses 443.
--- hint
See the table of well-known ports.
```

## Key takeaways: TCP and UDP

- A port identifies a program; a connection is the tuple (source IP, source port, destination IP, destination port).
- UDP is connectionless and unreliable but fast; TCP is reliable and ordered, using handshake, acknowledgments, flow and congestion control.
- Choose by need: correctness (TCP) or timeliness (UDP).

```quiz
Which transport protocol would you choose for a live voice call, where a late packet is useless?
- [ ] TCP, to guarantee every packet
- [x] UDP, to avoid waiting for retransmissions
- [ ] Neither, voice cannot use a transport protocol
> A delayed packet is useless in a live call; waiting for it would only add delay.
```

```quiz
What is the purpose of the TCP three-way handshake?
- [ ] To encrypt the connection
- [x] To establish the connection and agree on initial sequence numbers
- [ ] To find the IP address of the server
> SYN, SYN-ACK, ACK: both sides confirm they can communicate and synchronize their numbering.
```
