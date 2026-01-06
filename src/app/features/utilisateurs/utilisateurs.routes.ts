import { Routes } from '@angular/router';

export const UTILISATEURS_ROUTES: Routes = [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  { 
    path: 'list', 
    loadComponent: () => import('./utilisateur-list/utilisateur-list.component').then(m => m.UtilisateurListComponent) 
  },
  { 
    path: 'new', 
    loadComponent: () => import('./utilisateur-form/utilisateur-form.component').then(m => m.UtilisateurFormComponent) 
  },
  { 
    path: 'edit/:id', 
    loadComponent: () => import('./utilisateur-form/utilisateur-form.component').then(m => m.UtilisateurFormComponent) 
  }
];