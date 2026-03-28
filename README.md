 # BACKEND JAVA SPRING BOOT API

 # 🎓 Projet Optimal - Système de Gestion Universitaire

Ce projet est une plateforme d'apprentissage (LMS) connectée à une base de données MySQL. 
Il utilise **Angular 17** pour le frontend et **Spring Boot (Java)** pour le backend.

---

## 🚀 Guide de démarrage (Pour les collègues)

### 1. Base de données (IMPORTANT)
Pour que l'application fonctionne, vous devez importer la structure de la base de données :
1. Ouvrez **MySQL Workbench**.
2. Allez dans `Server` > `Data Import`.
3. Choisissez **"Import from Self-Contained File"** et sélectionnez le fichier situé dans : 
 `/backend/university_db.sql`.
4. Cliquez sur **Start Import**.

### 2. Lancement du Backend (Java)
1. Ouvrez le dossier `backend` avec **IntelliJ IDEA**.
2. Vérifiez le fichier `src/main/resources/application.properties` (adaptez votre login/password     MySQL si besoin).
3. Lancez l'application (`DemoApplication.java`). Le serveur tourne sur `http://localhost:8080`.

### 3. Lancement du Frontend (Angular)
1. Ouvrez un terminal dans le dossier racine.
2. Tapez `npm install` pour installer les dépendances.
3. Lancez le serveur avec : `npx ng serve`.
4. Ouvrez votre navigateur sur `http://localhost:4200`.

---

## ✅ Ce qui est déjà fait (État actuel)
- **Architecture Full-Stack** : Connexion réussie entre Angular et Spring Boot.
- **Base de données** : Schéma MySQL créé (Tables pour les cours).
- **Service de Cours** : 
    - Récupération dynamique des cours depuis MySQL.
    - Système de "Fallback" : si le backend est éteint, des données locales s'affichent pour éviter les crashs.
- **Affichage Sidebar** : La liste des cours se met à jour automatiquement selon la DB.
- **Contenu Pédagogique** : Chargement des fichiers Markdown (.md) pour le contenu des leçons.

---

## 🛠 Ce qui reste à faire (Prochaines étapes)
- **Interface Administrateur** : Créer les formulaires pour que le professeur puisse ajoutermodifier  un cours directement depuis le site.
- **Gestion des Médias** : Intégrer les vidéos et les quiz dans les leçons.
- **Sécurité** : Restreindre l'accès à la suppression des cours (Seul le prof doit pouvoirsupprimer).
- **Module Étudiant** : Système d'inscription aux cours.

---

## 👨💻 Technologies utilisées
- **Backend** : Spring Boot, Spring Data JPA, Hibernate.
- **DB** : MySQL.
