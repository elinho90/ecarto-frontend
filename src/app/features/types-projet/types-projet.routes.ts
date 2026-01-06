import { Routes } from '@angular/router';

export const TYPES_PROJET_ROUTES: Routes = [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  { 
    path: 'list', 
    loadComponent: () => import('./type-projet-list/type-projet-list.component').then(m => m.TypeProjetListComponent) 
  },
  { 
    path: 'new', 
    loadComponent: () => import('./type-projet-form/type-projet-form.component').then(m => m.TypeProjetFormComponent) 
  },
  { 
    path: 'edit/:id', 
    loadComponent: () => import('./type-projet-form/type-projet-form.component').then(m => m.TypeProjetFormComponent) 
  }
];