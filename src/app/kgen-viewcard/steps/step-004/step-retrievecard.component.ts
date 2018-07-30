import {Component, OnInit, ViewChild} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute, Router} from '@angular/router';
import {MsksService} from '../../../shared/msks';
import {CHANNEL_ID_RR_CARDREADER, CHANNEL_ID_RR_ICCOLLECT} from '../../../shared/var-setting';
import {CommonService} from '../../../shared/services/common-service/common.service';
import {ConfirmComponent} from '../../../shared/sc2-confirm';
import {ProcessingComponent} from '../../../shared/processing-component';
import {TimerComponent} from '../../../shared/sc2-timer';
@Component({
    templateUrl: './step-retrievecard.component.html',
    styleUrls: ['./step-retrievecard.component.scss']
})
export class StepRetrievecardComponent implements OnInit {
    @ViewChild('modalFail')
    public modalFail: ConfirmComponent;

    @ViewChild('modalCollect')
    public modalCollect: ConfirmComponent;

    @ViewChild('timer')
    public timer: TimerComponent;
    messageFail= '';
    messageCollect = '';
    messageAbort= 'SCN-GEN-STEPS.ABORT_CONFIRM';
    cardType = 1;
    sumSeconds: number;
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
            this.commonService.doLightoff('07');
            this.commonService.doLightoff('08');
        });
    }

    doCloseCard() {
        this.service.sendRequest(CHANNEL_ID_RR_CARDREADER, 'closecard').subscribe((resp) => {
            if (this.cardType === 1) {
                this.doReturnDoc();
            } else {
                this.messageCollect = 'SCN-GEN-STEPS.COLLECT-CARD-SURE';
                this.modalCollect.show();
                this.timerOutFn();
            }
        });
    }
    doReturnDoc() {
        this.service.sendRequest(CHANNEL_ID_RR_ICCOLLECT, 'returndoc').subscribe((resp) => {
            if (resp) {
                console.log('suess!');
                this.timeExpire();
            } else {
                this.messageFail = 'SCN-GEN-STEPS.READER-COLLECT-FAIL';
                this.modalFail.show();
            }
        });
    }
    timerOutFn() {
        this.timer.sumSeconds = 1;
        this.timer.initInterval();
    }

    processFailQuit() {
        this.modalFail.hide();
        this.backRoute();
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
