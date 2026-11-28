# Responding to security incidents

An **incident** is an event that threatens the confidentiality, integrity or availability of a system: ransomware, a stolen account, a data leak, a defaced website. You cannot prevent all of them. What distinguishes a minor event from a disaster is how fast and how well the organization reacts.

## Why prepare

During an incident, people are stressed, information is incomplete, and every hour can cost money. Improvised decisions at that moment are usually bad ones. A written **incident response plan**, tested in advance, answers the key questions calmly: who leads, who decides, whom to call, what to do first.

## The lifecycle

A widely used model, from the NIST guidance, has four phases:

| Phase | Goal |
|---|---|
| **1. Preparation** | be ready before anything happens |
| **2. Detection and analysis** | notice the incident and understand what it is |
| **3. Containment, eradication, recovery** | stop it, remove it, restore service |
| **4. Post-incident activity** | learn and improve |

### 1. Preparation

- A response **team** with defined roles and an up-to-date contact list, including out-of-hours numbers.
- **Logging and monitoring** that can actually detect problems (see the defense chapter).
- Tested **backups**, kept offline or immutable, since ransomware also encrypts online backups.
- An **inventory** of assets: you cannot protect or restore what you do not know you have.
- **Playbooks**: step-by-step procedures for frequent cases (phishing, ransomware, lost laptop).
- **Training and exercises**, such as a simulated incident once or twice a year.

### 2. Detection and analysis

Signals come from monitoring alerts, antivirus, user reports ("my files have strange names"), or an outside notice. Then **triage**:

- Is it a real incident or a false alarm?
- **What** is affected, since when, and how far has it spread?
- How **severe** is it? Is sensitive data involved? Is the business stopped?

Record every action and time from the first minute in an **incident log**. This is the material for the later forensic analysis and report.

### 3. Containment, eradication, recovery

**Containment** limits the damage. Short-term: isolate the affected machine from the network (unplug the network cable or disable the port, rather than switching it off, so memory is preserved), disable a compromised account, block a malicious address. Long-term: temporary fixes that let the business continue safely.

**Eradication** removes the cause: delete the malware, close the vulnerability that was used, reset every credential the attacker could have seen. Removing the symptom while leaving the way in lets the attacker come back.

**Recovery** restores systems from clean backups, verifies that they behave normally, and watches them closely for signs of re-infection before declaring the incident over.

A typical error is to rush to restore before understanding how the attacker entered: the same flaw is then exploited again.

### 4. Post-incident activity

Within days, hold a **lessons-learned review**, without blame: what happened, what worked, what did not, what must change. The output is a list of concrete actions with an owner and a date. An incident that teaches nothing is wasted.

## Communication

- Share facts on a **need-to-know** basis inside the team, through a channel that the attacker cannot read: if email is compromised, use another way.
- Designate **one person** to speak to management, customers and the press, so that messages are consistent.
- Check your **legal duties**: in many places, personal data breaches must be reported to the authority and to the people affected within a set time (72 hours in the European GDPR, for example).

## Example: a phishing email leads to a stolen account

1. **Detection**: an employee reports a suspicious email, and the log shows a login to her mailbox from an unusual country.
2. **Analysis**: she did enter her password on a fake page. The attacker has read her mail and created a rule forwarding messages to an outside address.
3. **Containment**: reset her password, revoke active sessions, remove the forwarding rule.
4. **Eradication**: check other accounts for the same sender, block the phishing domain, search for other recipients of the email.
5. **Recovery**: confirm normal activity, enable multi-factor authentication for her account.
6. **Lessons**: roll out MFA to everyone, and add a training session on recognizing phishing.

## Key takeaways: incident response

- Prepare before the incident: team, plan, monitoring, tested offline backups, playbooks.
- Four phases: preparation, detection and analysis, containment/eradication/recovery, post-incident review.
- Contain first, understand the entry point before restoring, and log everything.
- Communicate with one voice, and know your legal reporting duties.

---

## Quiz: incident response

```quiz
A workstation is infected with ransomware. Which first action best preserves evidence while containing the spread?
- [ ] Switch the machine off immediately
- [x] Disconnect it from the network but leave it powered on
- [ ] Reinstall the operating system
> Isolation stops the spread while keeping memory contents for analysis. Reinstalling destroys the evidence and the entry point stays unknown.
```

```quiz
Why identify how the attacker got in before restoring systems?
- [ ] To assign blame
- [x] Otherwise the same flaw is exploited again after recovery
- [ ] Because backups cannot be restored otherwise
> Eradication must remove the cause, not only the symptom.
```

```quiz
Which list gives the four phases of the incident response lifecycle in the right order?
- [ ] Detection, containment, preparation, review
- [x] Preparation, detection and analysis, containment/eradication/recovery, post-incident activity
- [ ] Containment, detection, recovery, preparation
> Preparation comes before any incident, and the lessons-learned review closes the loop and improves preparation.
```

```quiz
Why should backups be kept offline or immutable?
- [x] Because ransomware also encrypts or deletes backups that are reachable online
- [ ] Because offline backups restore faster
- [ ] Because backups are not needed if the disk is encrypted
> A backup the attacker can reach is not a safe recovery option. Tested offline copies make recovery possible.
```
