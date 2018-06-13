import { NgModule } from '@angular/core';
import { PhotoDemoComponent } from './photo.component';
import { MsksModule } from '../shared/msks';
import { Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TesterComponent } from './tester.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MsksDemoComponent } from './msksdemo.component';

import { MenuModule } from '../shared/menu';

const routes: Routes = [
    {
        path: '', component: MsksDemoComponent, children: [
            { path: 'photo', component: PhotoDemoComponent },
            { path: 'tester', component: TesterComponent }
        ]
    },

];

@NgModule({
    declarations: [
        MsksDemoComponent,
        PhotoDemoComponent,
        TesterComponent
    ],
    imports: [
        CommonModule,
        MsksModule,
        MenuModule,
        ReactiveFormsModule,
        RouterModule.forChild(routes)
    ],
    exports: [
        CommonModule
    ]
})
export class MsksDemoModule { }
