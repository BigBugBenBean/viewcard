import { NgModule } from '@angular/core';
import { ConfirmComponent } from './sc2-confirm.component';
import { CommonModule } from '@angular/common';

@NgModule({
    declarations: [
        ConfirmComponent
    ],
    imports: [
        CommonModule
    ],
    exports: [
        CommonModule,
        ConfirmComponent
    ]
})
export class ConfirmModule {}
