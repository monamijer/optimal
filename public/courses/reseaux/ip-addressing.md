# IP addressing and subnets

> Objectives: read an IPv4 address with its prefix, compute the range of a subnet, and know the private and IPv6 address spaces.

## IPv4 addresses

An IPv4 address is a 32-bit number, written as four bytes in decimal, separated by dots: `192.168.10.77`. Each byte goes from 0 to 255. There are 2³² ≈ 4.3 billion possible addresses, which is no longer enough for every device in the world.

An address has two parts: the **network** part (which network) and the **host** part (which machine inside it). The **prefix length** says where the split is, with the CIDR notation `/n`: the first n bits are the network part.

```text
192.168.10.77/24
11000000.10101000.00001010 . 01001101
|<------ 24 network bits -->| |-- 8 host bits --|
```

The same information can be given as a **subnet mask**: `/24` is `255.255.255.0`, that is 24 ones followed by 8 zeros.

## Computing a subnet

Take `192.168.10.0/24`:

| Item | Value |
|---|---|
| Network address (host bits all 0) | 192.168.10.0 |
| Broadcast address (host bits all 1) | 192.168.10.255 |
| Usable host addresses | 192.168.10.1 to 192.168.10.254 |
| Number of usable hosts | 2⁸ − 2 = 254 |

The first address names the network itself and the last one reaches all hosts at once, so neither can be given to a machine. In general, a `/n` subnet has 2^(32−n) − 2 usable hosts.

### Splitting a network

To cut a network in four equal parts, add 2 bits to the prefix: `/24` becomes `/26`. Each part has 2⁶ = 64 addresses, 62 usable.

| Subnet | Usable hosts | Broadcast |
|---|---|---|
| 192.168.10.0/26 | .1 to .62 | .63 |
| 192.168.10.64/26 | .65 to .126 | .127 |
| 192.168.10.128/26 | .129 to .190 | .191 |
| 192.168.10.192/26 | .193 to .254 | .255 |

So `192.168.10.77` belongs to the second subnet, `192.168.10.64/26`. Two hosts can talk directly only if they are in the same subnet; otherwise, their traffic goes through a router.

## Private addresses and NAT

Some ranges are reserved for private networks and are never routed on the internet:

| Range | Prefix |
|---|---|
| 10.0.0.0 to 10.255.255.255 | 10.0.0.0/8 |
| 172.16.0.0 to 172.31.255.255 | 172.16.0.0/12 |
| 192.168.0.0 to 192.168.255.255 | 192.168.0.0/16 |

Every home uses the same private ranges. Your router performs **NAT** (network address translation): it replaces the private source address of outgoing packets by its own public address, and remembers the correspondence to send the answers back to the right device. NAT saved IPv4 from exhaustion, but it also means that devices behind it cannot be reached directly from outside.

## Special addresses

- `127.0.0.1` (`localhost`): the machine itself.
- `0.0.0.0`: "any address" or "unknown".
- `169.254.0.0/16`: assigned automatically when no DHCP server answers; seeing one usually means "my network configuration failed".

## DHCP and the default gateway

Typing an address on every device would be tedious. **DHCP** hands out configuration automatically: an IP address, the prefix, the default gateway, and the DNS server. The **default gateway** is the router to which a host sends every packet whose destination is outside its own subnet.

## IPv6

IPv6 uses 128-bit addresses, written in hexadecimal groups: `2001:db8::1`. Consecutive groups of zeros can be replaced once by `::`. The address space is 2¹²⁸, enough to give a public address to every device, so NAT is not needed. A typical subnet is a `/64`. The block `2001:db8::/32` is reserved for documentation, like the examples above.

## Key takeaways: IP addressing

- An IPv4 address is 32 bits; the prefix `/n` gives the number of network bits.
- A `/n` subnet has 2^(32−n) − 2 usable hosts (network and broadcast addresses excluded).
- Private ranges (10/8, 172.16/12, 192.168/16) are shared by NAT behind one public address.
- DHCP configures hosts; the default gateway leads out of the subnet; IPv6 has 128 bits.

```quiz
How many usable host addresses does a /26 subnet have?
- [ ] 64
- [x] 62
- [ ] 26
> 32 − 26 = 6 host bits, so 2⁶ = 64 addresses, minus the network and broadcast addresses.
```

```quiz
Which of these addresses is private?
- [ ] 8.8.8.8
- [ ] 172.32.0.1
- [x] 172.20.4.9
> 172.16.0.0/12 covers 172.16.0.0 to 172.31.255.255. 172.32.0.1 is outside, and 8.8.8.8 is public.
```

```quiz
In the network 192.168.10.0/24 cut into four /26 subnets, which subnet contains 192.168.10.130?
- [ ] 192.168.10.64/26
- [x] 192.168.10.128/26
- [ ] 192.168.10.192/26
> The /26 blocks are 64 addresses long: .128 to .191 contains .130.
```

```quiz
A laptop shows the address 169.254.12.7. What most likely happened?
- [x] No DHCP server answered, so the laptop gave itself a link-local address
- [ ] The router assigned it a public address
- [ ] It is the loopback address of the laptop
> 169.254.0.0/16 is assigned automatically when DHCP fails; the loopback address is 127.0.0.1.
```
