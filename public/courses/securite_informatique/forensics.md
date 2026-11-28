# Digital forensics

Digital forensics is the discipline of collecting, preserving and analyzing digital evidence to understand what happened on a system: who did what, when, and how. The result must be reliable enough to support a technical decision, and sometimes a legal one.

## Principles

- **Do not alter the evidence.** Every action on a running machine changes it. Work on **copies**, and keep the original untouched.
- **Document everything.** Date, time, who, what, with which tool and which result. Someone else must be able to repeat your steps and reach the same conclusion.
- **Prove integrity** with cryptographic hashes: the fingerprint of the copy must match the fingerprint taken at acquisition.
- **Keep a chain of custody**: a record of who held the evidence, when, and why, from collection to the end of the case.

## Order of volatility

Some data disappears in seconds. Collect the most volatile first:

| Order | Data | Lifetime |
|---|---|---|
| 1 | CPU registers, caches | nanoseconds |
| 2 | **Memory (RAM)**: running processes, network connections, keys | until power off |
| 3 | Network state, routing and ARP tables | short |
| 4 | **Disk**: files, deleted data, logs | until overwritten |
| 5 | Remote logs and backups | long |

The first decision on an incident is therefore delicate: pulling the plug preserves the disk but destroys the memory. If the machine is still running, capture the volatile data first, as far as your procedure allows.

## Acquiring a disk image

A **forensic image** is a bit-by-bit copy of a drive, including unused and deleted space. A **write blocker**, a device or a read-only setting, prevents any change to the source during copy.

```bash
# Bit-by-bit copy of a drive to an image file (use a write blocker on the source)
sudo dd if=/dev/sdb of=evidence.img bs=4M conv=noerror,sync status=progress

# Fingerprint of the original and of the copy: they must be identical
sudo sha256sum /dev/sdb evidence.img
```

`conv=noerror,sync` continues past unreadable sectors and pads them, so offsets stay correct. On a failing disk, a tool built for it such as `ddrescue` is more careful. Write the hash in your notes at once, and recompute it before each analysis.

## Analyzing an image

Never mount the original. Mount the image read-only, or use dedicated tools such as **The Sleuth Kit** and **Autopsy**, which read file systems and list deleted files:

```bash
# Mount a copy read-only, without running anything from it
sudo mount -o ro,noexec,loop evidence.img /mnt/evidence
```

Useful techniques:

- **Timeline analysis**: file systems record when files were created, modified and accessed. Sorting all events by time reconstructs the story: first the suspicious login, then the new file, then the outgoing connection.
- **Deleted files**: deleting a file usually removes its directory entry, not its content. The data stays until overwritten, so it can often be recovered. **File carving** finds files by their signatures (the first bytes of a PNG, a PDF…) even without a directory entry.
- **Strings**: printable text inside binaries, memory dumps or unknown files can reveal addresses, commands or passwords.

```bash
# Identify a file by its content, not its name
file suspicious.bin

# Extract readable strings of at least 8 characters
strings -n 8 suspicious.bin

# Files changed after a given date (the start of the suspected intrusion)
find /mnt/evidence -type f -newermt '2026-03-01' -print
```

A file's **metadata** helps too: `stat file` shows the modification, access and change times. Remember that timestamps are easy to forge for an attacker with sufficient access, so confirm them with other sources.

## Memory forensics

RAM holds what never reaches the disk: running processes, open network connections, decrypted data, encryption keys, and malware that lives only in memory. A memory image is captured with a specialized tool and analyzed with a framework such as **Volatility**, which lists processes and connections as they were at that moment. Comparing the process list with what should be running is a fast way to spot something out of place.

## Linux artifacts

On a Linux system, typical places to look:

| Evidence | Where |
|---|---|
| Logins and `sudo` use | `/var/log/auth.log` (Debian-based) or `journalctl` |
| Login history | `last`, `lastb` (failed logins) |
| Scheduled tasks, a common persistence trick | `crontab -l`, `/etc/cron.*`, systemd timers |
| User accounts and keys | `/etc/passwd`, `~/.ssh/authorized_keys` |
| Shell history | `~/.bash_history` (an attacker may have erased it) |
| Network connections | `ss -tunap` on a live system |
| Recently changed files | `find` with `-newermt` |

An unknown line in `authorized_keys` or a cron job that downloads a script are classic signs of **persistence**: the attacker's way back in.

## Logs: the main witness

Logs are often the best evidence, and attackers know it. Protect them: send logs to a **separate log server** in real time, so that an intruder who erases local logs cannot erase the copy. Keep clocks synchronized with **NTP**, otherwise events from different machines cannot be ordered, and be explicit about the **time zone** (UTC is the safe choice).

## Reporting

A forensic report states the facts observed, the method, the tools and versions, the hashes, and a clear separation between **what was found** and **what is concluded**. Avoid speculation: "the account `bob` logged in at 02:14 UTC from this address" is a fact; "Bob is the attacker" is a conclusion that needs more evidence, since the account may have been stolen.

## Key takeaways: digital forensics

- Preserve evidence: work on copies, hash everything, document each step, keep a chain of custody.
- Collect the most volatile data first (memory before disk).
- Deleted does not mean gone: timelines, carving and strings recover and order events.
- Protect and centralize logs, synchronize clocks, and separate facts from conclusions.

---

## Quiz: forensics

```quiz
You must collect data from a compromised running server. What do you capture first?
- [ ] The disk image
- [x] The memory and the network state
- [ ] The backups
> Order of volatility: memory is lost when the machine powers off, while the disk persists.
```

```quiz
How do you prove that a disk image is identical to the original drive?
- [ ] By comparing the file names
- [x] By comparing their cryptographic hashes, such as SHA-256
- [ ] By copying it twice
> If a single bit differs, the hashes differ. The hash is recorded at acquisition and recomputed before each analysis.
```

```quiz
What does a write blocker do during disk acquisition?
- [ ] It encrypts the image so nobody can read it
- [x] It prevents any change to the source drive while it is copied
- [ ] It speeds up the copy by skipping deleted data
> It guarantees the original evidence is not altered, which is the first principle of forensics.
```

```quiz
A user deleted a sensitive file from a seized disk image. What is the most accurate statement?
- [x] The content is usually still there until overwritten, so it can often be recovered
- [ ] The file is gone for good because deletion wipes the data
- [ ] It can only be recovered from the original running machine
> Deleting usually removes the directory entry, not the content. Tools such as Sleuth Kit and file carving can find the data.
```

```quiz
An intruder with root access erases the local logs. How could this have been prevented from destroying the evidence?
- [ ] By renaming the log files
- [x] By sending the logs in real time to a separate log server
- [ ] By compressing the logs every night
> A remote copy is out of the intruder's reach. Synchronized clocks (NTP) then let you order events across machines.
```
