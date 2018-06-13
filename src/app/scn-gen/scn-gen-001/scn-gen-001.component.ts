import { Component } from '@angular/core';
import { Router } from '@angular/router'

import { TranslateService } from '@ngx-translate/core';

@Component ({
    templateUrl: './scn-gen-001.component.html',
    styleUrls: ['./scn-gen-001.component.scss']
})

export class Page1Component {
    constructor(private router: Router,
        private translate: TranslateService) { }

    nextRoute(locale: string) {
        this.translate.use(locale).subscribe((e) => {
            this.router.navigate(['/scn-gen/gen002']);
        });
    }
}
