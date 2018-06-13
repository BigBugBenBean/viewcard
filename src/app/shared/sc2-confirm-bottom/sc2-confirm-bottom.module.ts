import { NgModule } from '@angular/core';
import { ConfirmBottomComponent } from './sc2-confirm-bottom.component';
import { CommonModule } from '@angular/common';

@NgModule({
    declarations: [
        ConfirmBottomComponent
    ],
    imports: [
        CommonModule
    ],
    exports: [
        CommonModule,
        ConfirmBottomComponent
    ]
})
export class ConfirmBottomModule {}
