import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'browser', pathMatch: 'full' },
  {
    path: 'browser',
    loadComponent: () => import('./pages/browser/browser').then((m) => m.BrowserPage),
  },
  {
    path: 'forms',
    loadComponent: () => import('./pages/forms/forms').then((m) => m.FormsPage),
  },
  {
    path: 'route/:id',
    data: { title: 'Route Demo Page', env: 'reference-app' },
    loadComponent: () => import('./pages/route/route').then((m) => m.RoutePage),
  },
  {
    path: 'route',
    redirectTo: 'route/user-42',
    pathMatch: 'full',
  },
  {
    path: 'general',
    loadComponent: () => import('./pages/general/general').then((m) => m.GeneralPage),
  },
];
