import { Component } from '@angular/core';
import { Router } from '@angular/router'
import {TranslateService} from '@ngx-translate/core';

@Component ({
    templateUrl: './scn-gen-007.component.html',
    styleUrls: ['./scn-gen-007.component.scss']
})

export class Page7Component {
    constructor(private router: Router,
                private translate: TranslateService) { }

    nextRoute(next: String) {
        this.router.navigate([next]);
    }
    previousRoute() {
        this.router.navigate(['/scn-gen/gen002']);
        return;
    }

    slipprint() {
        this.router.navigate(['/scn-gen/slipprint']);
        return;
    }
    fingerprint() {
        this.router.navigate(['/scn-gen/fingerprint']);
        return;
    }
    readCard() {
        this.router.navigate(['/scn-gen/readNewCard']);
        return;
    }

    langButton() {
        const browserLang = this.translate.currentLang;
        console.log(browserLang);
        if (browserLang === 'zh-HK') {
            this.translate.use('en-US');
        } else {
            this.translate.use('zh-HK');
        }
    }
}
