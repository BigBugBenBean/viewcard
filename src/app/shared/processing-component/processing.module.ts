import { NgModule } from '@angular/core';
import { ProcessingComponent } from './processing.component';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    declarations: [
        ProcessingComponent
    ],
    imports: [
        CommonModule,
        TranslateModule
    ],
    exports: [
        CommonModule,
        ProcessingComponent,
        TranslateModule
    ]
})
export class ProcessingModule {}
