# E-CARTO Angular 17+ Standalone

Application Angular 17+ avec architecture standalone, cartographie Leaflet et authentification JWT.

## 🚀 Installation

```bash
# Cloner le projet
cd angular-frontend

# Installer les dépendances
npm install

# Lancer l'application
ng serve
```

L'application est accessible sur `http://localhost:4200`

## 📋 Prérequis

- Node.js 18+
- Angular CLI 17+
- Backend Spring Boot REST API sur `http://localhost:8080/api`

## 🔧 Stack Technique

- **Angular 17+** (standalone components)
- **TypeScript** (mode strict)
- **Angular Material 17+** (UI components)
- **Tailwind CSS 3.x** (layout, spacing, responsive)
- **FontAwesome 6.x** (icons via CSS)
- **Leaflet 1.9+** (cartographie interactive)
- **RxJS** (programmation réactive)
- **Reactive Forms** (gestion des formulaires)

## 📁 Architecture

```
src/
├── app/
│   ├── auth/                          # Authentification
│   │   ├── login/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   └── services/
│   │
│   ├── features/                      # Modules métier
│   │   ├── projets/                  # Gestion Projets
│   │   ├── sites/                    # Gestion Sites (avec carte)
│   │   ├── rapports/                 # Gestion Rapports
│   │   ├── types-projet/             # Types de Projet
│   │   └── utilisateurs/             # Gestion Utilisateurs
│   │
│   ├── layout/                        # Layouts
│   │   └── dashboard/
│   │
│   ├── shared/                        # Ressources partagées
│   │   ├── models/                   # Interfaces TypeScript
│   │   ├── enums/                    # Énumérations
│   │   └── components/               # Composants réutilisables
│   │       └── map/                  # Composant carte Leaflet
│   │
│   ├── app.component.ts
│   ├── app.config.ts
│   └── app.routes.ts
```

## 🔐 Authentification

### Comptes de Test

```typescript
// Administrateur
Email: admin@test.com
Password: admin123
Role: ADMINISTRATEUR_SYSTEME

// Chef de Projet
Email: chef@test.com
Password: chef123
Role: CHEF_DE_PROJET

// Observateur
Email: obs@test.com
Password: obs123
Role: OBSERVATEUR
```

## 🗺️ Cartographie

La carte Leaflet est disponible à l'URL `/dashboard/sites/carte` avec les fonctionnalités :

- Visualisation des sites avec marqueurs GPS
- Popup interactive avec détails du site
- Filtres par type, statut, région et ville
- Sidebar rétractable (responsive)
- Clustering automatique si +20 sites

## 🚦 Routing

- `/login` - Page de connexion
- `/dashboard` - Tableau de bord
- `/dashboard/projets` - Gestion des projets
- `/dashboard/sites` - Gestion des sites
- `/dashboard/sites/carte` - Carte des sites
- `/dashboard/rapports` - Gestion des rapports
- `/dashboard/types-projet` - Types de projet
- `/dashboard/utilisateurs` - Gestion des utilisateurs

## 🛡️ Guards

- **AuthGuard** : Vérifie l'authentification JWT
- **RoleGuard** : Vérifie les permissions basées sur les rôles

## 📦 Scripts NPM

```bash
npm start          # Lancer l'application en mode développement
npm run build      # Build en mode production
npm run watch      # Build en mode watch
npm run test       # Lancer les tests
npm run lint       # Linter le code
```

## 🎨 Design System

### Material Theme

```scss
$primary: mat.define-palette(mat.$indigo-palette);
$accent: mat.define-palette(mat.$pink-palette);
$warn: mat.define-palette(mat.$red-palette);
```

### Couleurs des Statuts

- **Planifié** : Bleu (#1976d2)
- **En cours** : Vert (#388e3c)
- **Terminé** : Violet (#7b1fa2)
- **Annulé** : Rouge (#c62828)

### Couleurs des Priorités

- **Basse** : Vert (#2e7d32)
- **Moyenne** : Orange (#ff8f00)
- **Haute** : Orange foncé (#ef6c00)
- **Critique** : Rouge (#c62828)

## 🧪 Tests

L'application inclut des comptes de test pour vérifier les différents rôles et permissions.

## 📄 Licence

MIT License

## 🆘 Support

Pour toute question ou problème, veuillez consulter la documentation ou créer une issue.