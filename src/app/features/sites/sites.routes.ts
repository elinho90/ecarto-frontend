import { Routes } from '@angular/router';

export const SITES_ROUTES: Routes = [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  { 
    path: 'list', 
    loadComponent: () => import('./site-list/site-list.component').then(m => m.SiteListComponent) 
  },
  { 
    path: 'carte', 
    loadComponent: () => import('./site-map/site-map.component').then(m => m.SiteMapComponent) 
  },
  { 
    path: 'new', 
    loadComponent: () => import('./site-form/site-form.component').then(m => m.SiteFormComponent) 
  },
  { 
    path: 'edit/:id', 
    loadComponent: () => import('./site-form/site-form.component').then(m => m.SiteFormComponent) 
  },
  { 
    path: ':id', 
    loadComponent: () => import('./site-detail/site-detail.component').then(m => m.SiteDetailComponent) 
  }
];