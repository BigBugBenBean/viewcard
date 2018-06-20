import { Routes } from '@angular/router';
import { HomeComponent } from './home';
import { NoContentComponent } from './no-content';

import { DataResolver } from './app.resolver';

export const ROUTES: Routes = [
  { path: '', redirectTo: 'scn-gen-viewcard', pathMatch: 'full'},
  { path: 'scn-gen-viewcard', loadChildren: './gen-viewcard#ViewcardModule'},
  { path: '**',    component: NoContentComponent },
];
