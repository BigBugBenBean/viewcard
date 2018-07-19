import {Component, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute, Router} from '@angular/router';
import {MsksService} from '../../../shared/msks';
import {CHANNEL_ID_RR_CARDREADER, CHANNEL_ID_RR_ICCOLLECT} from '../../../shared/var-setting';
import {CommonService} from '../../../shared/services/common-service/common.service';
@Component({
    templateUrl: './step-retrievecard.component.html',
    styleUrls: ['./step-retrievecard.component.scss']
})
export class StepRetrievecardComponent implements OnInit {
    messageAbort= 'SCN-GEN-STEPS.ABORT_CONFIRM';
    cardType = 1;
    constructor(private router: Router,
                private commonService: CommonService,
                private route: ActivatedRoute,
                private service: MsksService,
                private translate: TranslateService) {
    }

    ngOnInit(): void {
        console.log('init fun');
        this.initParam();
    }

    /**
     * init param data.
     */
    initParam() {
        this.route.queryParams.subscribe(params => {
            const lang = params['lang'];
            if ('en-US' === lang) {
                this.translate.use('en-US');
            } else {
                this.translate.use('zh-HK');
            }
            this.translate.currentLang = lang;
            this.cardType = Number.parseInt(params['cardType']);
           this.doCloseCard();
        });
    }

    doCloseCard() {
        this.service.sendRequest(CHANNEL_ID_RR_CARDREADER, 'closecard').subscribe((resp) => {
            if (this.cardType === 1) {
                this.doReturnDoc();
            }
        });
    }
    doReturnDoc() {
        this.service.sendRequest(CHANNEL_ID_RR_ICCOLLECT, 'returndoc').subscribe(() => {});
    }

    timeExpire() {
        setTimeout(() => {
            this.commonService.doCloseWindow();
        }, 500);
    }

    nextRoute() {
        this.router.navigate(['/kgen-viewcard/privacy'], { queryParams: {'lang': this.translate.currentLang}});
    }

    /**
     * backPage.
     */
    backRoute() {
        this.commonService.doCloseWindow();
    }

    /**
     * lang.
     */
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
