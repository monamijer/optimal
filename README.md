🎓 Optimal — La Documentation Académique Moderne

    Transformez vos supports de cours en une plateforme de documentation élégante, structurée et ultra-rapide.

Démonstration | Documentation | Signaler un bug
💡 Pourquoi Optimal ?

Inspiré par la clarté de MDN Web Docs, Optimal remplace les PDF éparpillés par un système de documentation centralisé et scalable.

    Focus Étudiant : Navigation intuitive et lecture fluide.

    Focus Professeur : Rédaction simple en Markdown.

    Focus Performance : Architecture Angular 19 de pointe.

🔥 Fonctionnalités Clés
📖 Rendu Markdown Premium

Les cours sont rédigés en Markdown et transformés instantanément en pages web propres avec ancres automatiques.
🧭 Navigation Intelligente

    Sidebar Dynamique : Organisation hiérarchique des modules.

    ScrollSpy & TOC : Table des matières interactive qui suit votre lecture via IntersectionObserver.

    Breadcrumbs : Pour ne jamais se perdre dans les chapitres.

⚡ Architecture Moderne (DX)

    Angular 19 : Utilisation des Signals, Standalone Components et du nouveau Control Flow.

    Performance : Lazy Loading et parsing Markdown optimisé.

    Dark Mode : Support natif (Système/Manuel) via Bootstrap.

🏗️ Architecture du Projet

Le projet suit une structure Scalable Feature-Based :
Bash

src/app/
├── core/       # Services globaux (Markdown, ScrollSpy, Theme)
├── layout/     # Composants de structure (Header, Sidebar)
├── shared/     # UI components réutilisables
└── features/   # Modules métiers (ex: /courses)

🚀 Démarrage Rapide

    Cloner le projet
    Bash

    git clone https://github.com/votre-compte/optimal.git

    Installer & Lancer
    Bash

    npm install && ng serve

    Accéder à l'app : http://localhost:4200

🛠 Tech Stack
Technologie	Rôle
Angular 19	Framework Frontend
Signals	Gestion d'état réactive
Marked	Parsing Markdown
DOMPurify	Sécurisation du HTML
Bootstrap	Système de design & Grille
🤝 Contribution & Support

Les contributions sont ce qui rend la communauté open-source incroyable.

    Fork le projet.

    Créez votre branche (git checkout -b feature/AmazingFeature).

    Commit vos changements (git commit -m 'Add AmazingFeature').

    Push sur la branche (git push origin feature/AmazingFeature).

    Ouvrez une Pull Request.
