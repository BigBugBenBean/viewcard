import {Component, OnInit} from '@angular/core';
import {Router, ActivatedRoute, ParamMap} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import { MsksService } from '../../shared/msks';
import { READ_ROP140_RETRY, TIMEOUT_MILLIS, TIMEOUT_PAYLOAD, ABORT_I18N_KEY,
         ABORT_YES_I18N_KEY, CHANNEL_ID_RR_ICCOLLECT, CHANNEL_ID_RR_CARDREADER } from '../../../shared/var-setting';
@Component({
    templateUrl: './step-processing.component.html',
    styleUrls: ['./step-processing.component.scss']
})
export class ViewcardProcessingComponent implements OnInit {

    public messageRetry: string;
    public messageFail: string;

    messageAbort= 'SCN-GEN-STEPS.ABORT_CONFIRM';
    constructor(private router: Router,
                private route: ActivatedRoute,
                private msksService: MsksService,
                private translate: TranslateService) {}
    public ngOnInit() {
        $('#processDiv').show();
        // setTimeout(() => { $('#processDiv').hide();
        // this.nextRoute()}, 500);
      //   this.route.paramMap.map((params) => params.get('cardType')).subscribe((cardType) => {
      //     if ('new' === cardType) {
      //         this.processNewCard();
      //     }else if ('old' === cardType) {
      //         this.processOldCard();
      //     }
      // });
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
            this.router.navigate(['/scn-gen/gen002']);
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
