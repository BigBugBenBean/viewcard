import {Component, OnInit, ViewChild} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute, Router} from '@angular/router';
import {MsksService} from '../../../shared/msks';
import {CHANNEL_ID_RR_CARDREADER, CHANNEL_ID_RR_ICCOLLECT} from '../../../shared/var-setting';
import {CommonService} from '../../../shared/services/common-service/common.service';
import {ConfirmComponent} from '../../../shared/sc2-confirm';
import {ProcessingComponent} from '../../../shared/processing-component';
import {TimerComponent} from '../../../shared/sc2-timer';
import {LocalStorageService} from '../../../shared/services/common-service/Local-storage.service';
@Component({
    templateUrl: './step-retrievecard.component.html',
    styleUrls: ['./step-retrievecard.component.scss']
})
export class StepRetrievecardComponent implements OnInit {
    @ViewChild('modalFail')
    public modalFail: ConfirmComponent;

    @ViewChild('modalCollect')
    public modalCollect: ConfirmComponent;

    @ViewChild('modalQuit')
    public modalQuit: ConfirmComponent;

    @ViewChild('modalTimeout')
    public modalTimeout: ConfirmComponent;

    @ViewChild('processing')
    public processing: ProcessingComponent;

    @ViewChild('timer')
    public timer: TimerComponent;
    messageFail= '';
    messageCollect = 'SCN-GEN-STEPS.COLLECT-CARD-SURE';
    messageAbort= 'SCN-GEN-STEPS.ABORT_CONFIRM';
    messageTimeout = 'SCN-GEN-STEPS.MESSAGE-TIMEOUT';
    PAGE_COLLECT_ABORT_QUIT_ITEMOUT = 2000;
    PAGE_COLLECT__RETURN_CARD_ITEMOUT = 2000;
    PAGE_COLLECT_TIME_EXPIRE_ITEMOUT = 5000;
    APP_LANG = '';
    cardType = 1;
    readType = 1;
    sumSeconds: number;
    isRestore = false;
    isAbort = false;
    timeOutPause = false;
    constructor(private router: Router,
                private commonService: CommonService,
                private route: ActivatedRoute,
                private service: MsksService,
                private localStorages: LocalStorageService,
                private translate: TranslateService) {
    }

    ngOnInit(): void {
        console.log('init fun');
        this.initConfigParam();
        this.initLanguage();
        this.startBusiness();
    }

    initConfigParam() {
        this.APP_LANG = this.localStorages.get('APP_LANG');
        this.cardType = Number.parseInt(this.localStorages.get('cardType'));
        this.readType = Number.parseInt(this.localStorages.get('readType'));
        this.PAGE_COLLECT_ABORT_QUIT_ITEMOUT = Number.parseInt(this.localStorages.get('PAGE_COLLECT_ABORT_QUIT_ITEMOUT'));
        this.PAGE_COLLECT__RETURN_CARD_ITEMOUT = Number.parseInt(this.localStorages.get('PAGE_COLLECT__RETURN_CARD_ITEMOUT'));
        this.PAGE_COLLECT_TIME_EXPIRE_ITEMOUT = Number.parseInt(this.localStorages.get('PAGE_COLLECT_TIME_EXPIRE_ITEMOUT'));
    }

    initLanguage() {
        if ('en-US' === this.APP_LANG) {
            this.translate.use('en-US');
        } else {
            this.translate.use('zh-HK');
        }
        this.translate.currentLang = this.APP_LANG;
    }

    startBusiness() {
        this.processing.show();
        this.commonService.doLightoff('07');
        this.commonService.doLightoff('08');
        setTimeout(() => {
            this.doCloseCard();
        }, this.PAGE_COLLECT_ABORT_QUIT_ITEMOUT);
    }

    // ************************************************************************************************************************************
    /**
     * count time.
     */
    timeExpire() {
        this.timer.showTimer = false;
        this.timeOutPause = true;
        if (this.processing.visible) {
            this.processing.hide();
        }
        if (this.modalFail.visible) {
            this.modalFail.hide();
        }
        if (this.modalQuit.visible) {
            this.modalQuit.hide();
        }
        this.messageTimeout = 'SCN-GEN-STEPS.MESSAGE-TIMEOUT';
        this.modalTimeout.show();
        this.quitDisabledAll();
        setTimeout(() => {
            this.processTimeoutQuit();
        }, this.PAGE_COLLECT_TIME_EXPIRE_ITEMOUT);
    }

    processTimeoutQuit() {
        this.modalTimeout.hide();
        this.doCloseCard();
    }

    processFailQuit() {
        this.modalFail.hide();
        this.doCloseCard();
    }

    quitDisabledAll() {
        $('#exitBtn').attr('disabled', 'false');
        $('#langBtn').attr('disabled', 'false');

    }
    cancelQuitEnabledAll() {
        $('#exitBtn').removeAttr('disabled');
        $('#langBtn').removeAttr('disabled');
    }

    processModalQuitShow() {
        this.modalQuit.show()
        this.isAbort = true;
        this.quitDisabledAll();
        if (this.processing.visible) {
            this.isRestore = true;
            this.processing.hide();
        }
    }

    processConfirmQuit() {
        this.modalQuit.hide();
        if (this.processing.visible) {
            this.isRestore = true;
            this.processing.hide();
        }
        this.isAbort = true;
        this.doCloseCard();
    }
    processCancelQuit() {
        this.modalQuit.hide();
        this.isAbort = false;
        this.cancelQuitEnabledAll();
        if (this.isRestore) {
            this.processing.show();
        }
    }
    doCloseCard() {
        this.processing.show();
        this.service.sendRequestWithLog(CHANNEL_ID_RR_CARDREADER, 'closecard').subscribe((resp) => {
            if (this.readType === 1) {
                this.doReturnDoc();
                setTimeout(() => {
                    this.backRoute();
                }, this.PAGE_COLLECT__RETURN_CARD_ITEMOUT);
            } else {
                this.modalCollectShow();
            }
        }, (error) => {
            console.log('closecard ERROR ' + error);
            setTimeout(() => {
                this.backRoute();
            }, this.PAGE_COLLECT_ABORT_QUIT_ITEMOUT);
        });
    }
    modalCollectShow() {
        if (this.processing.visible) {
            this.isRestore = true;
            this.processing.hide();
        }
        this.modalCollect.show();
    }
    processCollectQuit() {
        this.modalCollect.hide();
        if (this.isRestore) {
            this.processing.show();
        }
        setTimeout(() => {
            this.backRoute();
        }, this.PAGE_COLLECT_ABORT_QUIT_ITEMOUT);
    }

    doReturnDoc() {
        this.service.sendRequestWithLog(CHANNEL_ID_RR_ICCOLLECT, 'returndoc').subscribe(() => {});
    }

    nextRoute() {
        if (this.timeOutPause || this.isAbort) {
            return;
        }
        this.router.navigate(['/kgen-viewcard/privacy'], { queryParams: {'lang': this.translate.currentLang}});
    }

    /**
     * backPage.
     */
    backRoute() {
        if (this.processing.visible) {
            this.processing.hide();
        }
        if (this.modalFail.visible) {
            this.modalFail.hide();
        }
        if (this.modalQuit.visible) {
            this.modalQuit.hide();
        }
        this.commonService.doLightoff('08');
        this.commonService.doLightoff('07');
        this.timer.ngOnDestroy();
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
