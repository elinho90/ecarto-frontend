import { Routes } from '@angular/router';
import { authGuard } from './auth/guards/auth.guard';
import { roleGuard } from './auth/guards/role.guard';
import { Role } from './shared/enums/role.enum';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./layout/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/dashboard-home/dashboard-home.component').then(m => m.DashboardHomeComponent)
      },
      {
        path: 'projets',
        loadChildren: () => import('./features/projets/projets.routes').then(m => m.PROJETS_ROUTES),
        canActivate: [roleGuard],
        data: { allowedRoles: [Role.ADMINISTRATEUR_SYSTEME, Role.CHEF_DE_PROJET, Role.ANALYSTE] }
      },
      {
        path: 'sites',
        loadChildren: () => import('./features/sites/sites.routes').then(m => m.SITES_ROUTES),
        canActivate: [roleGuard],
        data: { allowedRoles: [Role.ADMINISTRATEUR_SYSTEME, Role.CHEF_DE_PROJET, Role.ANALYSTE, Role.DEVELOPPEUR, Role.DECIDEUR, Role.OBSERVATEUR] }
      },
      {
        path: 'rapports',
        loadChildren: () => import('./features/rapports/rapports.routes').then(m => m.RAPPORTS_ROUTES),
        canActivate: [roleGuard],
        data: { allowedRoles: [Role.ADMINISTRATEUR_SYSTEME, Role.CHEF_DE_PROJET, Role.ANALYSTE, Role.DEVELOPPEUR, Role.DECIDEUR, Role.OBSERVATEUR] }
      },
      {
        path: 'types-projet',
        loadChildren: () => import('./features/types-projet/types-projet.routes').then(m => m.TYPES_PROJET_ROUTES),
        canActivate: [roleGuard],
        data: { allowedRoles: [Role.ADMINISTRATEUR_SYSTEME, Role.CHEF_DE_PROJET] }
      },
      {
        path: 'comites',
        loadChildren: () => import('./features/comites/comites.routes').then(m => m.COMITES_ROUTES),
        canActivate: [roleGuard],
        data: { allowedRoles: [Role.ADMINISTRATEUR_SYSTEME, Role.CHEF_DE_PROJET, Role.DECIDEUR] }
      },
      {
        path: 'entites',
        loadChildren: () => import('./features/entites/entites.routes').then(m => m.ENTITES_ROUTES),
        canActivate: [roleGuard],
        data: { allowedRoles: [Role.ADMINISTRATEUR_SYSTEME, Role.CHEF_DE_PROJET, Role.DECIDEUR] }
      },
      {
        path: 'utilisateurs',
        loadChildren: () => import('./features/utilisateurs/utilisateurs.routes').then(m => m.UTILISATEURS_ROUTES),
        canActivate: [roleGuard],
        data: { allowedRoles: [Role.ADMINISTRATEUR_SYSTEME] }
      }
    ]
  },
  { path: '**', redirectTo: '/login' }
];