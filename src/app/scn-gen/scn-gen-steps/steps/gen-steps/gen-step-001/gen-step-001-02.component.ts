import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {MsksService} from '../../../../../shared/msks';

@Component({
    templateUrl: './gen-step-001-02.component.html',
    styleUrls: ['./gen-step-001-02.component.scss']
})
export class GenStep00102Component implements OnInit {
    messageAbort= 'SCN-GEN-STEPS.ABORT_CONFIRM';
    constructor(private router: Router,
                private service: MsksService,
                private translate: TranslateService) {}

    public ngOnInit() {
        console.log('call ngOnInit');
    }
     /**
     * nextPage.
     */
    nextRoute() {
        this.router.navigate(['/scn-gen/steps/step-001-04']);
        return;
    }

    /**
     * backPage.
     */
    backRoute() {
        this.router.navigate(['/scn-gen/gen002/LV1HKIC']);
    }

    timeExpire() {
        setTimeout(() => {
            this.router.navigate(['/scn-gen/gen002/LV1HKIC']);
        }, 500);
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

    /**
     * scan card info.
     */
    scanCardInfo() {
        console.log('call : scanCardInfo fun.')
        this.service.sendRequest('RR_CIDOCR', 'scandata ', {}).subscribe((resp) => {
            if (resp.errorcode === '0') {
                console.log('scanCardInfo operate success');
                this.readCardInfoByNFC();

            }
        });
    }

    /**
     * get card information by NFC.
     */
    readCardInfoByNFC() {
        console.log('call : readCardInfoByNFC fun.')
    }
}
