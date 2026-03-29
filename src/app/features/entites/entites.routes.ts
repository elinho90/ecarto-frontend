import { Routes } from '@angular/router';

export const ENTITES_ROUTES: Routes = [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  { 
    path: 'list', 
    loadComponent: () => import('./entite-list/entite-list.component').then(m => m.EntiteListComponent) 
  },
  { 
    path: 'new', 
    loadComponent: () => import('./entite-form/entite-form.component').then(m => m.EntiteFormComponent) 
  },
  { 
    path: 'edit/:id', 
    loadComponent: () => import('./entite-form/entite-form.component').then(m => m.EntiteFormComponent) 
  }
];
