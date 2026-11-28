# Réagir aux incidents de sécurité

Un **incident** est un événement qui menace la confidentialité, l'intégrité ou la disponibilité d'un système : rançongiciel, compte volé, fuite de données, site web défiguré. On ne peut pas tous les empêcher. Ce qui distingue un événement mineur d'un désastre, c'est la rapidité et la qualité de la réaction de l'organisation.

## Pourquoi se préparer

Pendant un incident, les personnes sont stressées, l'information est incomplète et chaque heure peut coûter de l'argent. Les décisions improvisées à ce moment sont généralement mauvaises. Un **plan de réponse aux incidents** écrit et testé à l'avance répond calmement aux questions essentielles : qui dirige, qui décide, qui appeler, que faire en premier.

## Le cycle de vie

Un modèle largement utilisé, issu des recommandations du NIST, comporte quatre phases :

| Phase | Objectif |
|---|---|
| **1. Préparation** | être prêt avant que quoi que ce soit n'arrive |
| **2. Détection et analyse** | repérer l'incident et comprendre ce dont il s'agit |
| **3. Confinement, éradication, reprise** | l'arrêter, le supprimer, rétablir le service |
| **4. Activité post-incident** | apprendre et s'améliorer |

### 1. Préparation

- Une **équipe** de réponse avec des rôles définis et une liste de contacts à jour, y compris des numéros hors heures ouvrées.
- Une **journalisation et une supervision** capables de détecter réellement les problèmes (voir le chapitre sur la défense).
- Des **sauvegardes** testées, conservées hors ligne ou immuables, puisque les rançongiciels chiffrent aussi les sauvegardes en ligne.
- Un **inventaire** des actifs : on ne peut pas protéger ni restaurer ce dont on ignore l'existence.
- Des **playbooks** : des procédures pas à pas pour les cas fréquents (hameçonnage, rançongiciel, ordinateur portable perdu).
- Des **formations et exercices**, comme un incident simulé une ou deux fois par an.

### 2. Détection et analyse

Les signaux viennent des alertes de supervision, de l'antivirus, des signalements d'utilisateurs (« mes fichiers ont des noms étranges ») ou d'une alerte externe. Vient ensuite le **tri** :

- S'agit-il d'un vrai incident ou d'une fausse alerte ?
- **Qu'est-ce qui** est touché, depuis quand, et jusqu'où cela s'est-il propagé ?
- Quelle est sa **gravité** ? Des données sensibles sont-elles concernées ? L'activité est-elle arrêtée ?

Consignez chaque action et son heure dès la première minute dans un **journal d'incident**. C'est la matière de l'analyse et du rapport d'investigation ultérieurs.

### 3. Confinement, éradication, reprise

Le **confinement** limite les dégâts. À court terme : isoler la machine touchée du réseau (débrancher le câble réseau ou désactiver le port, plutôt que de l'éteindre, afin de préserver la mémoire), désactiver un compte compromis, bloquer une adresse malveillante. À long terme : des correctifs temporaires qui permettent à l'activité de continuer en sécurité.

L'**éradication** supprime la cause : effacer le logiciel malveillant, fermer la vulnérabilité utilisée, réinitialiser tous les identifiants que l'attaquant a pu voir. Supprimer le symptôme en laissant la porte d'entrée permet à l'attaquant de revenir.

La **reprise** restaure les systèmes à partir de sauvegardes saines, vérifie qu'ils se comportent normalement et les surveille de près pour détecter toute réinfection avant de déclarer l'incident clos.

Une erreur typique est de se précipiter pour restaurer avant de comprendre comment l'attaquant est entré : la même faille est alors exploitée de nouveau.

### 4. Activité post-incident

Dans les jours qui suivent, tenez une **revue des enseignements**, sans recherche de coupable : ce qui s'est passé, ce qui a fonctionné, ce qui n'a pas fonctionné, ce qui doit changer. Le résultat est une liste d'actions concrètes avec un responsable et une date. Un incident dont on n'apprend rien est un incident gâché.

## Communication

- Partagez les faits selon le principe du **besoin d'en connaître** au sein de l'équipe, par un canal que l'attaquant ne peut pas lire : si la messagerie est compromise, utilisez un autre moyen.
- Désignez **une seule personne** pour s'adresser à la direction, aux clients et à la presse, afin que les messages restent cohérents.
- Vérifiez vos **obligations légales** : dans de nombreux pays, les violations de données personnelles doivent être signalées à l'autorité et aux personnes concernées dans un délai fixé (72 heures dans le RGPD européen, par exemple).

## Exemple : un courriel d'hameçonnage mène à un compte volé

1. **Détection** : une employée signale un courriel suspect, et le journal montre une connexion à sa boîte mail depuis un pays inhabituel.
2. **Analyse** : elle a bien saisi son mot de passe sur une fausse page. L'attaquant a lu son courrier et créé une règle qui transfère les messages vers une adresse externe.
3. **Confinement** : réinitialiser son mot de passe, révoquer les sessions actives, supprimer la règle de transfert.
4. **Éradication** : vérifier les autres comptes pour le même expéditeur, bloquer le domaine d'hameçonnage, rechercher les autres destinataires du courriel.
5. **Reprise** : confirmer l'activité normale, activer l'authentification multifacteur pour son compte.
6. **Enseignements** : déployer l'AMF pour tous, et ajouter une session de formation sur la reconnaissance de l'hameçonnage.

## Points clés : réponse aux incidents

- Se préparer avant l'incident : équipe, plan, supervision, sauvegardes hors ligne testées, playbooks.
- Quatre phases : préparation, détection et analyse, confinement/éradication/reprise, revue post-incident.
- Confiner d'abord, comprendre le point d'entrée avant de restaurer, et tout consigner.
- Communiquer d'une seule voix, et connaître ses obligations légales de signalement.

---

## Quiz : réponse aux incidents

```quiz
Un poste de travail est infecté par un rançongiciel. Quelle première action préserve le mieux les preuves tout en contenant la propagation ?
- [ ] Éteindre immédiatement la machine
- [x] La déconnecter du réseau mais la laisser sous tension
- [ ] Réinstaller le système d'exploitation
> L'isolement arrête la propagation tout en conservant le contenu de la mémoire pour l'analyse. Réinstaller détruit les preuves et le point d'entrée reste inconnu.
```

```quiz
Pourquoi identifier comment l'attaquant est entré avant de restaurer les systèmes ?
- [ ] Pour désigner un coupable
- [x] Sinon la même faille est exploitée de nouveau après la reprise
- [ ] Parce que les sauvegardes ne peuvent pas être restaurées autrement
> L'éradication doit supprimer la cause, pas seulement le symptôme.
```

```quiz
Quelle liste donne les quatre phases du cycle de réponse aux incidents dans le bon ordre ?
- [ ] Détection, confinement, préparation, revue
- [x] Préparation, détection et analyse, confinement/éradication/restauration, activité post-incident
- [ ] Confinement, détection, restauration, préparation
> La préparation précède tout incident, et la revue des enseignements boucle le cycle et améliore la préparation.
```

```quiz
Pourquoi conserver les sauvegardes hors ligne ou immuables ?
- [x] Parce qu'un rançongiciel chiffre ou supprime aussi les sauvegardes accessibles en ligne
- [ ] Parce que les sauvegardes hors ligne se restaurent plus vite
- [ ] Parce que les sauvegardes sont inutiles si le disque est chiffré
> Une sauvegarde accessible à l'attaquant n'est pas une solution de reprise fiable. Des copies hors ligne testées rendent la restauration possible.
```
