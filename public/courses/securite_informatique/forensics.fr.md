# Investigation numérique (forensique)

L'investigation numérique (forensique) est la discipline qui consiste à collecter, préserver et analyser des preuves numériques pour comprendre ce qui s'est passé sur un système : qui a fait quoi, quand et comment. Le résultat doit être suffisamment fiable pour appuyer une décision technique, et parfois juridique.

## Principes fondamentaux

- **Ne pas altérer les preuves.** Chaque action sur une machine en fonctionnement la modifie. Travaillez sur des **copies** et laissez l'original intact.
- **Tout documenter.** Date, heure, qui, quoi, avec quel outil et quel résultat. Une autre personne doit pouvoir refaire vos étapes et aboutir à la même conclusion.
- **Prouver l'intégrité** avec des hachages cryptographiques : l'empreinte de la copie doit correspondre à l'empreinte relevée lors de l'acquisition.
- **Tenir une chaîne de traçabilité** : un registre indiquant qui a détenu la preuve, quand et pourquoi, de la collecte jusqu'à la fin de l'affaire.

## Ordre de volatilité

Certaines données disparaissent en quelques secondes. Collectez d'abord les plus volatiles :

| Ordre | Données | Durée de vie |
|---|---|---|
| 1 | Registres du processeur, caches | nanosecondes |
| 2 | **Mémoire (RAM)** : processus en cours, connexions réseau, clés | jusqu'à l'extinction |
| 3 | État du réseau, tables de routage et ARP | courte |
| 4 | **Disque** : fichiers, données supprimées, journaux | jusqu'à l'écrasement |
| 5 | Journaux distants et sauvegardes | longue |

La première décision face à un incident est donc délicate : débrancher la machine préserve le disque mais détruit la mémoire. Si la machine fonctionne encore, capturez d'abord les données volatiles, dans la mesure où votre procédure le permet.

## Acquérir une image disque

Une **image forensique** est une copie bit à bit d'un disque, y compris de l'espace inutilisé et supprimé. Un **bloqueur d'écriture**, matériel ou paramètre en lecture seule, empêche toute modification de la source pendant la copie.

```bash
# Bit-by-bit copy of a drive to an image file (use a write blocker on the source)
sudo dd if=/dev/sdb of=evidence.img bs=4M conv=noerror,sync status=progress

# Fingerprint of the original and of the copy: they must be identical
sudo sha256sum /dev/sdb evidence.img
```

`conv=noerror,sync` poursuit la copie malgré les secteurs illisibles et les remplit, afin que les décalages restent corrects. Sur un disque défaillant, un outil conçu pour cela comme `ddrescue` est plus prudent. Notez le hachage immédiatement et recalculez-le avant chaque analyse.

## Analyser une image

Ne montez jamais l'original. Montez l'image en lecture seule, ou utilisez des outils dédiés comme **The Sleuth Kit** et **Autopsy**, qui lisent les systèmes de fichiers et listent les fichiers supprimés :

```bash
# Mount a copy read-only, without running anything from it
sudo mount -o ro,noexec,loop evidence.img /mnt/evidence
```

Techniques utiles :

- **Analyse chronologique** : les systèmes de fichiers enregistrent quand les fichiers ont été créés, modifiés et consultés. Trier tous les événements par date permet de reconstituer l'histoire : d'abord la connexion suspecte, puis le nouveau fichier, puis la connexion sortante.
- **Fichiers supprimés** : supprimer un fichier retire généralement son entrée de répertoire, pas son contenu. Les données restent jusqu'à leur écrasement, et peuvent donc souvent être récupérées. Le **file carving** retrouve des fichiers grâce à leurs signatures (les premiers octets d'un PNG, d'un PDF…) même sans entrée de répertoire.
- **Chaînes de caractères** : le texte imprimable présent dans des binaires, des vidages mémoire ou des fichiers inconnus peut révéler des adresses, des commandes ou des mots de passe.

```bash
# Identify a file by its content, not its name
file suspicious.bin

# Extract readable strings of at least 8 characters
strings -n 8 suspicious.bin

# Files changed after a given date (the start of the suspected intrusion)
find /mnt/evidence -type f -newermt '2026-03-01' -print
```

Les **métadonnées** d'un fichier sont également utiles : `stat file` affiche les dates de modification, d'accès et de changement. N'oubliez pas que les horodatages sont faciles à falsifier pour un attaquant disposant de droits suffisants ; confirmez-les donc avec d'autres sources.

## Investigation de la mémoire

La RAM contient ce qui n'atteint jamais le disque : processus en cours, connexions réseau ouvertes, données déchiffrées, clés de chiffrement, et logiciels malveillants qui n'existent qu'en mémoire. Une image mémoire est capturée avec un outil spécialisé puis analysée avec un framework tel que **Volatility**, qui liste les processus et les connexions tels qu'ils étaient à cet instant. Comparer la liste des processus avec ce qui devrait s'exécuter est un moyen rapide de repérer un élément suspect.

## Artefacts Linux

Sur un système Linux, voici les endroits typiques à examiner :

| Preuve | Où |
|---|---|
| Connexions et usage de `sudo` | `/var/log/auth.log` (basé sur Debian) ou `journalctl` |
| Historique des connexions | `last`, `lastb` (connexions échouées) |
| Tâches planifiées, astuce courante de persistance | `crontab -l`, `/etc/cron.*`, timers systemd |
| Comptes utilisateurs et clés | `/etc/passwd`, `~/.ssh/authorized_keys` |
| Historique du shell | `~/.bash_history` (un attaquant a pu l'effacer) |
| Connexions réseau | `ss -tunap` sur un système en fonctionnement |
| Fichiers récemment modifiés | `find` avec `-newermt` |

Une ligne inconnue dans `authorized_keys` ou une tâche cron qui télécharge un script sont des signes classiques de **persistance** : le chemin de retour de l'attaquant.

## Journaux : le témoin principal

Les journaux sont souvent la meilleure preuve, et les attaquants le savent. Protégez-les : envoyez les journaux en temps réel vers un **serveur de journaux distinct**, afin qu'un intrus qui efface les journaux locaux ne puisse pas effacer la copie. Gardez les horloges synchronisées avec **NTP**, faute de quoi les événements de machines différentes ne peuvent pas être ordonnés, et soyez explicite sur le **fuseau horaire** (UTC est le choix sûr).

## Rédiger le rapport

Un rapport d'investigation indique les faits observés, la méthode, les outils et leurs versions, les hachages, et sépare clairement **ce qui a été constaté** de **ce qui est conclu**. Évitez les spéculations : « le compte `bob` s'est connecté à 02:14 UTC depuis cette adresse » est un fait ; « Bob est l'attaquant » est une conclusion qui nécessite davantage de preuves, puisque le compte a pu être volé.

## Points clés : investigation numérique

- Préserver les preuves : travailler sur des copies, tout hacher, documenter chaque étape, tenir une chaîne de traçabilité.
- Collecter d'abord les données les plus volatiles (la mémoire avant le disque).
- Supprimé ne veut pas dire disparu : chronologies, carving et chaînes de caractères permettent de retrouver et d'ordonner les événements.
- Protéger et centraliser les journaux, synchroniser les horloges, et séparer les faits des conclusions.

---

## Quiz : investigation numérique

```quiz
Vous devez collecter des données sur un serveur compromis en fonctionnement. Que capturez-vous en premier ?
- [ ] L'image du disque
- [x] La mémoire et l'état du réseau
- [ ] Les sauvegardes
> Ordre de volatilité : la mémoire est perdue à l'extinction de la machine, alors que le disque persiste.
```

```quiz
Comment prouvez-vous qu'une image disque est identique au disque d'origine ?
- [ ] En comparant les noms de fichiers
- [x] En comparant leurs hachages cryptographiques, tels que SHA-256
- [ ] En la copiant deux fois
> Si un seul bit diffère, les hachages diffèrent. Le hachage est enregistré lors de l'acquisition et recalculé avant chaque analyse.
```

```quiz
Que fait un bloqueur d'écriture pendant l'acquisition d'un disque ?
- [ ] Il chiffre l'image pour que personne ne puisse la lire
- [x] Il empêche toute modification du disque source pendant la copie
- [ ] Il accélère la copie en ignorant les données supprimées
> Il garantit que la preuve originale n'est pas altérée, ce qui est le premier principe de la forensique.
```

```quiz
Un utilisateur a supprimé un fichier sensible d'une image disque saisie. Quelle affirmation est la plus exacte ?
- [x] Le contenu est généralement encore présent tant qu'il n'est pas écrasé, donc souvent récupérable
- [ ] Le fichier est perdu pour de bon, car la suppression efface les données
- [ ] Il ne peut être récupéré que depuis la machine d'origine en fonctionnement
> Supprimer retire en général l'entrée du répertoire, pas le contenu. Des outils comme Sleuth Kit et le file carving peuvent retrouver les données.
```

```quiz
Un intrus disposant des droits root efface les journaux locaux. Comment aurait-on pu éviter la perte de cette preuve ?
- [ ] En renommant les fichiers de journaux
- [x] En envoyant les journaux en temps réel vers un serveur de journaux séparé
- [ ] En compressant les journaux chaque nuit
> Une copie distante est hors de portée de l'intrus. Des horloges synchronisées (NTP) permettent ensuite d'ordonner les événements entre machines.
```
