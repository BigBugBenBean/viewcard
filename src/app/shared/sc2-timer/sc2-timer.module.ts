import { TimerComponent } from './';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@NgModule({
    declarations: [
        TimerComponent
    ],
    imports: [
        CommonModule
    ],
    exports: [
        CommonModule,
        TimerComponent
    ]
})
export class TimerModule { }
