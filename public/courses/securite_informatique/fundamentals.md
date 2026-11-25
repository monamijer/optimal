# Computer security

Welcome to the complete computer security course. It covers theory and practice, from beginner to professional level.

## The CIA triad: the 3 core pillars

Computer security rests on three core pillars, known by the acronym **CIA triad**.

### Confidentiality

Information is only accessible to authorized people. It protects against spying and data leaks.

Mechanisms: encryption, access control, authentication.

### Integrity

Information is not modified in an unauthorized way. It protects against tampering.

Mechanisms: SHA-256 hashes, digital signatures, checksums.

### Availability

Resources are accessible to legitimate users when needed. It protects against DDoS attacks and outages.

Mechanisms: redundancy, load balancing, backups.

---

## The extended pillars

The CIA triad is completed by three additional essential pillars.

### Authentication

Verifying a user's identity. There are three authentication factors: something you **know** (a password), something you **have** (a physical token), or something you **are** (biometrics). Multi-factor authentication (MFA) combines several factors.

### Non-repudiation

The impossibility of denying having performed an action. Mechanisms: signed logs, digital certificates. It is the legal basis of any digital transaction.

### Authorization

Controlling what an authenticated user is allowed to do. Main models: **RBAC** (role-based), **MAC** (mandatory), **DAC** (discretionary).

---

## Essential terminology

Before going further, you must master the vocabulary of security.

### Vulnerability

A weakness in a system that can be exploited. Examples: buffer overflow, SQL injection, misconfiguration.

### Threat

A potential danger that exploits a vulnerability. Sources: hackers, malware, human error, natural disasters.

### Risk

The combination of the likelihood and the impact of a threat. Formula: `Risk = Threat × Vulnerability × Impact`.

### Exploit

Code or a technique that exploits a specific vulnerability. Famous example: EternalBlue (MS17-010), used by WannaCry.

### CVE

The standard identifier for public vulnerabilities. Format: `CVE-YEAR-NUMBER`. Example: CVE-2021-44228 (Log4Shell).

### Zero-day

A vulnerability that has been discovered but not yet fixed by the vendor. Particularly dangerous because no patch exists.

### Attack surface

The set of all potential entry points of a system: open ports, exposed APIs, user interfaces, employees.

---

## Quiz: the basics

```quiz
An attacker modifies the amount of a bank transfer while it travels over the network. Which pillar of the CIA triad is broken?
- [ ] Confidentiality
- [x] Integrity
- [ ] Availability
> The data was altered without authorization. Hashes and digital signatures protect integrity.
```

```quiz
A fingerprint scan and a password are combined to log in. How many authentication factors are used?
- [ ] One, because both identify the same person
- [x] Two: something you are and something you know
- [ ] Three
> The password is a "know" factor and the fingerprint is an "are" factor, so this is multi-factor authentication.
```

```quiz
What is a zero-day?
- [ ] A virus that deletes files on the first day
- [x] A vulnerability that is known but not yet fixed by the vendor
- [ ] An attack that lasts less than a day
> With no patch available, systems stay exposed until the vendor publishes a fix.
```
