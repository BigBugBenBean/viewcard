import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';

@Component({
    templateUrl: './gen-step-003-01.component.html',
    styleUrls: ['./gen-step-003-01.component.scss']
})
export class GenStep00301Component implements OnInit {
    messageAbort= 'SCN-GEN-STEPS.ABORT_CONFIRM';
    conditionOfStay = 'NEW ARRIVAL-FOREIGN DOMESTIC HELPER';
    limitOfStay = '31-12-2018';
    constructor(private router: Router,
                private translate: TranslateService) {}
    public ngOnInit() {
        console.log('call ngOnInit');
    }
    /**
     * nextPage.
     */
    nextRoute() {
        this.router.navigate(['/scn-gen/steps/step-004-01']);
        return;
    }

    timeExpire() {
        setTimeout(() => {
            this.router.navigate(['/scn-gen/gen002/LV1HKIC']);
        }, 500);
    }

    /**
     * backPage.
     */
    backRoute() {
        this.router.navigate(['/scn-gen/gen002/LV1HKIC']);
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
