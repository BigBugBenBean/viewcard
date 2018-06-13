import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {MsksService} from '../../../../../shared/msks';
import {FingerprintService} from '../../../../../shared/services/fingerprint-service/fingerprint.service';

@Component({
    templateUrl: './gen-step-002-02.component.html',
    styleUrls: ['./gen-step-002-02.component.scss']
})
export class GenStep00202Component implements OnInit {
    messageAbort= 'SCN-GEN-STEPS.ABORT_CONFIRM';
    fingerprintInfo = '1313213213';
    constructor(private router: Router,
                private service: MsksService,
                private fingers: FingerprintService,
                private translate: TranslateService) {}
    public ngOnInit() {
        console.log('call ngOnInit');
        this.startFingerprintScan();
    }
    /**
     * nextPage.
     */
    nextRoute() {
        this.router.navigate(['/scn-gen/steps/step-003-01']);
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

    startFingerprintScan() {
        console.log('call startFingerprintScan');
        this.startFingerprintScanner();
    }
    /**
     *  start scanner fingerprint
     */
    startFingerprintScanner() {
        console.log('call : startFingerprintScanner fun.')
        this.service.sendRequest('RR_FPSCANNERREG', 'takephoto', {'icno': 'A123456'}).subscribe((resp) => {
            if (resp.errorcode === '0') {
                console.log('fingerprint operate success');
                this.fingerprintInfo = resp.fpdata;
                console.log('fpdata:' +  resp.fpdata)
                this.nextRoute();
                // this.fingerprintInfo = this.base64encode(this.utf16to8(resp.fpdata));
                // $('#fingerImge').attr('src', 'data:image/jpeg;' + this.fingerprintInfo);
            }
        });
    }
}
