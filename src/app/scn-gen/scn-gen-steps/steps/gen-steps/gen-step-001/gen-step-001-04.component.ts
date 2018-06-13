import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';

@Component({
    templateUrl: './gen-step-001-04.component.html',
    styleUrls: ['./gen-step-001-04.component.scss']
})
export class GenStep00104Component implements OnInit {
    messageAbort= 'SCN-GEN-STEPS.ABORT_CONFIRM';
    constructor(private router: Router,
                private translate: TranslateService) {}
    public ngOnInit() {
        console.log('call ngOnInit');
        $('#processDiv').show();
        setTimeout(() => { $('#processDiv').hide();
            this.nextRoute()}, 500);
    }
    /**
     * nextPage.
     */
    nextRoute() {
        this.router.navigate(['/scn-gen/steps/step-002-01']);
        return;
    }

    timeExpire() {
        setTimeout(() => {
            this.router.navigate(['/scn-gen/gen002/LV1HKIC']);
        }, 500);
    }

    pass() {
        this.router.navigate(['/scn-gen/steps/step-002-01']);
        return;
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
