import { Routes } from '@angular/router';

export const COMITES_ROUTES: Routes = [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  { 
    path: 'list', 
    loadComponent: () => import('./comite-list/comite-list.component').then(m => m.ComiteListComponent) 
  },
  { 
    path: 'new', 
    loadComponent: () => import('./comite-form/comite-form.component').then(m => m.ComiteFormComponent) 
  },
  { 
    path: 'edit/:id', 
    loadComponent: () => import('./comite-form/comite-form.component').then(m => m.ComiteFormComponent) 
  }
];
