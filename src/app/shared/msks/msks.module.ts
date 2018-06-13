import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MsksService } from './msks.service';

@NgModule({
    imports: [
        CommonModule
    ],
    providers: [
        MsksService
    ],
    exports: [
        CommonModule
    ]
})
export class MsksModule {}
