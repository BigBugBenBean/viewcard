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
import { PrivacyComponent } from './step-003/step-privacy.component';
import { IndicateComponent } from './step-004/step-indicate.component';
import { InsertcardComponent } from './step-005/step-insertcard.component';
import { ViewcardDataComponent } from './step-008/step-data.component';
import { CollectCardComponent } from './step-009/step-collect.component';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ProcessingModule } from '../shared/processing-component';
import { LocalStorageService } from '../shared/services/common-service/Local-storage.service';
import { FingerprintLeftComponent, FingerprintRightComponent } from './step-006';

export const routes: Routes = [
   { path: '', component: PrivacyComponent},
   { path: 'indicate', component: IndicateComponent},
   { path: 'insertcard', component: InsertcardComponent},
   { path: 'left', component: FingerprintLeftComponent},
   { path: 'right', component: FingerprintRightComponent},
   { path: 'data', component: ViewcardDataComponent},
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
        CollectCardComponent,
        FingerprintLeftComponent,
        FingerprintRightComponent
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
    providers: [
        LocalStorageService
    ],
    exports: [
        CommonModule
    ]
})
export class ViewcardModule { }
