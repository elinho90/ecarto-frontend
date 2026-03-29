<h1 align="center">🌍 E-Carto — Frontend Angular</h1>

<p align="center">
  <strong>Interface cartographique de gestion de projets terrain</strong><br/>
  Département <strong>DAPSI</strong> · GS2E (Groupe Eranove)
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Angular-17-DD0031?style=for-the-badge&logo=angular&logoColor=white"/>
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white"/>
  <img src="https://img.shields.io/badge/Leaflet.js-1.9.4-199900?style=for-the-badge&logo=leaflet&logoColor=white"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white"/>
</p>

---

## ✨ Fonctionnalités

- 🗺️ **Cartographie interactive** : Visualisation Leaflet.js des zones d'intervention et projets terrain
- 🔐 **Authentification JWT** : Connexion sécurisée avec rafraîchissement automatique des tokens
- 👥 **Gestion des rôles** : Interface adaptative selon le profil (Admin / Manager / Technicien)
- 📊 **Dashboard** : Vue d'ensemble des métriques et indicateurs projet
- 📝 **Suivi de projets** : Interface de création, modification et suivi du cycle de vie
- 📄 **Rapports** : Téléchargement de rapports PDF générés par le backend

## 🏗️ Architecture Angular 17 Standalone

```
src/
├── app/
│   ├── core/                  # Services singleton (Auth, HTTP Interceptors)
│   │   ├── guards/            # Route guards (auth, roles)
│   │   ├── interceptors/      # JWT interceptor
│   │   └── services/          # API services
│   ├── features/              # Feature components (standalone)
│   │   ├── auth/              # Login / Register
│   │   ├── dashboard/         # Tableau de bord
│   │   ├── projects/          # Gestion de projets
│   │   └── map/               # Module cartographique (Leaflet)
│   └── shared/                # Composants réutilisables
└── assets/
```

> **Architecture Standalone Angular 17** — Sans NgModules traditionnels. Chaque composant est auto-suffisant, réduisant le boilerplate et améliorant le tree-shaking.

## 🔧 Stack Technique

| | |
|---|---|
| Framework | Angular 17.3 (Standalone) |
| Langage | TypeScript |
| Cartographie | Leaflet.js 1.9.4 |
| Styles | Tailwind CSS 3.3 |
| Auth | JWT (HttpOnly cookies / Bearer token) |
| HTTP | Angular HttpClient + Interceptors |

## 🚀 Lancement rapide

```bash
git clone https://github.com/elinho90/ecarto-frontend.git
cd ecarto-frontend
npm install
ng serve
```

> Assurez-vous que le [backend E-Carto](https://github.com/elinho90/ecarto-backend) tourne sur `http://localhost:8080`

## 🔗 Backend

L'API Spring Boot associée : [ecarto-backend](https://github.com/elinho90/ecarto-backend)

## 👨‍💻 Auteur

**Elie Hervé Régis Kayré** — [Portfolio](https://portfolio-kayre.vercel.app) · [LinkedIn](https://www.linkedin.com/in/elie-hervé-régis-kayre-90728b1a4)

