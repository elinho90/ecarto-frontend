import { Routes } from '@angular/router';

export const RAPPORTS_ROUTES: Routes = [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  { 
    path: 'list', 
    loadComponent: () => import('./rapport-list/rapport-list.component').then(m => m.RapportListComponent) 
  },
  { 
    path: 'new', 
    loadComponent: () => import('./rapport-form/rapport-form.component').then(m => m.RapportFormComponent) 
  },
  { 
    path: ':id', 
    loadComponent: () => import('./rapport-detail/rapport-detail.component').then(m => m.RapportDetailComponent) 
  }
];