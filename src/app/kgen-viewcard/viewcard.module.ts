import { NgModule, AfterViewInit, AfterContentInit, OnInit, NO_ERRORS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MsksModule } from '../shared/msks';
import { TimerModule } from '../shared/sc2-timer';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import {StepSelectCardComponent} from './steps/step-001/step-selectcard.component';
import {StepPrivacyComponent} from './steps/step-privacy/step-privacy.component';
import {StartComponent} from './start/start.component';
import {StepFingerprintLeftComponent} from './steps/step-002/step-fingerprint-left.component';
import {StepViewcardComponent} from './steps/step-003/step-viewcard.component';
import {ConfirmModule} from '../shared/sc2-confirm';
import {ProcessingModule} from '../shared/processing-component';
import {StepRetrievecardComponent} from './steps/step-004/step-retrievecard.component';
import {StepInsertcardComponent} from './steps/step-001/step-insertcard.component';
import {StepFingerprintRightComponent} from './steps/step-002/step-fingerprint-right.component';
import {LocalStorageService} from '../shared/services/common-service/Local-storage.service';
import {SlipprintService} from '../shared/services/print-service/slipprint.service';
import {ValidatorFingerprintService} from '../shared/services/validator-services/validator.fingerprint.service';
import {FingerprintService} from '../shared/services/fingerprint-service/fingerprint.service';
import {ReadcardService} from '../shared/services/readcard-service/readcard.service';
import {CommonService} from '../shared/services/common-service/common.service';
import {StepProcessingComponent} from './steps/step-processing/step-processing.component';
import {StepFingerprintComponent} from './steps/step-002/step-fingerprint.component';

const routes: Routes = [
    { path: '', redirectTo: 'privacy', pathMatch: 'full' },
    { path: 'start', component: StartComponent },
    { path: 'privacy', component: StepPrivacyComponent },
    { path: 'insertcard', component: StepInsertcardComponent },
    { path: 'processing', component: StepProcessingComponent },
    { path: 'fingerprint', component: StepFingerprintComponent },
    { path: 'viewcard', component: StepViewcardComponent },
    { path: 'retrievecard', component: StepRetrievecardComponent }

];
export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}
@NgModule({
    declarations: [
        StartComponent,
        StepPrivacyComponent,
        StepInsertcardComponent,
        StepProcessingComponent,
        StepFingerprintComponent,
        StepViewcardComponent,
        StepRetrievecardComponent
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        TimerModule,
        ConfirmModule,
        MsksModule,
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
    ],
    providers: [LocalStorageService,
        CommonService,
        ValidatorFingerprintService,
        FingerprintService,
        SlipprintService,
        ReadcardService],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
export class ViewcardModule {}
