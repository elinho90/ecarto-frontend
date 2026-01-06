import { Routes } from '@angular/router';

export const PROJETS_ROUTES: Routes = [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  { 
    path: 'list', 
    loadComponent: () => import('./projet-list/projet-list.component').then(m => m.ProjetListComponent) 
  },
  { 
    path: 'new', 
    loadComponent: () => import('./projet-form/projet-form.component').then(m => m.ProjetFormComponent) 
  },
  { 
    path: 'edit/:id', 
    loadComponent: () => import('./projet-form/projet-form.component').then(m => m.ProjetFormComponent) 
  },
  { 
    path: ':id', 
    loadComponent: () => import('./projet-detail/projet-detail.component').then(m => m.ProjetDetailComponent) 
  }
];