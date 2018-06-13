import { NgModule, ApplicationRef } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';

import { MsksService } from '../shared/msks';
import { StepsComponent } from './steps.component';
import { ProcessingComponent, ProcessingModule, ConfirmModule, ConfirmBottomModule, TimerComponent, TimerModule,
    ProcessingBigComponent, ProcessingBigModule } from '../shared';

import { HttpService } from '../shared/services/http.service';
import {GenStepsComponent} from './gen-steps.componoent';
 import {GenStep00101Component} from './gen-steps/gen-step-001/gen-step-001-01.component';
import {GenStep00201Component} from './gen-steps/gen-step-002/gen-step-002-01.component';
import {GenStep00202Component} from './gen-steps/gen-step-002/gen-step-002-02.component';
import {GenStep00401Component} from './gen-steps/gen-step-004/gen-step-004-01.component';
import {GenStep00103Component} from './gen-steps/gen-step-001/gen-step-001-03.component';
import {GenStep00102Component} from './gen-steps/gen-step-001/gen-step-001-02.component';
import {GenStep00301Component} from './gen-steps/gen-step-003/gen-step-003-01.component';
import {GenStepPrivacyComponent} from './gen-steps/gen-step-privacy/gen-step-privacy.component';

export const routes: Routes = [
    {
        path: '', component: GenStepsComponent,
        children: [
            { path: 'step-privacy' , component: GenStepPrivacyComponent },
            { path: 'step-001-01' , component: GenStep00101Component },
            { path: 'step-001-02' , component: GenStep00102Component },
            { path: 'step-001-03' , component: GenStep00103Component },
            { path: 'step-002-01' , component: GenStep00201Component },
            { path: 'step-002-02' , component: GenStep00202Component },
            { path: 'step-003-01' , component: GenStep00301Component },
            { path: 'step-004-01' , component: GenStep00401Component }
        ]
    }
];

@NgModule({
    declarations: [
        GenStepsComponent,
        GenStep00101Component,
        GenStep00201Component,
        GenStepPrivacyComponent
    ],
    imports: [
        CommonModule,
        ProcessingModule,
        ProcessingBigModule,
        TimerModule,
        ConfirmModule,
        ConfirmBottomModule,
        RouterModule.forChild(routes)
    ],
    providers: [ MsksService,  HttpService],
    exports: [RouterModule]
})
export class GenStepsModule { }