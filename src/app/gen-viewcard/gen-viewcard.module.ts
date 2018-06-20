import { NgModule, AfterViewInit, AfterContentInit, OnInit, NO_ERRORS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { MsksModule } from '../shared/msks';
import { TimerModule } from '../shared/sc2-timer';
import { ConfirmBottomModule } from '../shared/sc2-confirm-bottom';
import { MenuModule } from '../shared/menu';
import { ConfirmModule } from '../shared/sc2-confirm';
import { PrivacyComponent } from './scn-gen-003/gen-viewcard-privacy.component';
import { IndicateComponent } from './scn-gen-004/gen-viewcard-indicate.component';
import { InsertcardComponent } from './scn-gen-005/gen-viewcard-insertcard.component';
import { ViewcardDataComponent } from './scn-gen-008/gen-viewcard-data.component';
import { CollectCardComponent } from './scn-gen-009/gen-viewcard-collect.component';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ProcessingModule } from '../shared/processing-component';

export const routes: Routes = [
   { path: '', component: PrivacyComponent},
   { path: 'indicate', component: IndicateComponent},
   { path: 'insertcard/:cardType', component: InsertcardComponent},
   { path: 'data/:cardType', component: ViewcardDataComponent},
   { path: 'data/:cardType/:icno/:dor', component: ViewcardDataComponent},
   { path: 'collect', component: CollectCardComponent}
  ];
export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
  }
@NgModule({
    declarations: [
        PrivacyComponent,
        IndicateComponent,
        InsertcardComponent,
        ViewcardDataComponent,
        CollectCardComponent
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MsksModule,
        TimerModule,
        ConfirmModule,
        MenuModule,
        ConfirmBottomModule,
        ProcessingModule,
        TranslateModule.forRoot({
            loader: {
              provide: TranslateLoader,
              useFactory: HttpLoaderFactory,
              deps: [HttpClient]
            }
          }),
        RouterModule.forChild(routes)
    ],
    exports: [
        CommonModule
    ]
})
export class ViewcardModule { }
