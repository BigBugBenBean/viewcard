import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {MsksService} from '../../../../../shared/msks';

@Component({
    templateUrl: './gen-step-001-03.component.html',
    styleUrls: ['./gen-step-001-03.component.scss']
})
export class GenStep00103Component implements OnInit {
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
     *  readCard info b
     */
    readCardFromChip() {
        console.log('call : readCardFromChip fun.')
        this.service.sendRequest('RR_cardreader', 'readhkicv2citizen', {}).subscribe((resp) => {
            if (resp.errorcode === '0') {
                console.log('readCardFromChip operate success');
                alert(resp);

            }
        });
    }

    /**
     * validate Authority.
     */
    validateAuthority() {
        console.log('call validateAuthority');
        const param = {
            'date_of_registration': null,
            'hkic_no': null
        }
        this.service.sendRequest('RR_cardreader', 'opencard', {'contactless_password': param}).subscribe((resp) => {
            if (resp.errorcode === '0') {
                console.log('call validateAuthority operate success');
                this.readCardFromChip();

            } else {
                console.log('call validateAuthority fail');
            }
        });
    }
}
