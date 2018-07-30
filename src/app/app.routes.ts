import { Routes } from '@angular/router';
import { HomeComponent } from './home';
import { NoContentComponent } from './no-content';

import { DataResolver } from './app.resolver';

export const ROUTES: Routes = [
  { path: '', redirectTo: 'kgen-viewcard', pathMatch: 'full'},
  { path: 'kgen-viewcard', loadChildren: './kgen-viewcard#ViewcardModule'},
  { path: '**',    component: NoContentComponent },
];
