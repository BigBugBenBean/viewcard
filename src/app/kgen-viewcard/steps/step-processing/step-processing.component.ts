import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ProcessingComponent} from '../../../shared/processing-component';
import {CommonService} from '../../../shared/services/common-service/common.service';
import {MsksService} from '../../../shared/msks';
import {ConfirmComponent} from '../../../shared/sc2-confirm';
import {LocalStorageService} from '../../../shared/services/common-service/Local-storage.service';
import {TranslateService} from '@ngx-translate/core';
import {CHANNEL_ID_RR_CARDREADER, CHANNEL_ID_RR_ICCOLLECT, TIMEOUT_PAYLOAD} from '../../../shared/var-setting';

@Component({
    templateUrl: './step-processing.component.html',
    styleUrls: ['./step-processing.component.scss']
})
export class StepProcessingComponent implements OnInit {

    @ViewChild('modalRetry')
    public modalRetry: ConfirmComponent;

    @ViewChild('modalFail')
    public modalFail: ConfirmComponent;

    @ViewChild('modal1')
    public modal1: ConfirmComponent;

    @ViewChild('modalNoROP')
    public modalNoROP: ConfirmComponent;

    @ViewChild('processing')
    public processing: ProcessingComponent;
    messageRetry = 'SCN-GEN-STEPS.RE-SCANER-FINGER';
    retryOpencardVal = 0;
    messageFail = 'SCN-GEN-STEPS.RE-SCANER-MAX';
    messageAbort = 'SCN-GEN-STEPS.ABORT_CONFIRM';
    cardType = 1;
    fp_tmpl1_in_base64 = `Aiw3KG7NwbXqRIZfgGzzNPVE+k3x18SUlEGwrmhOabMCVmZMUz4nZbFds2f2x/rYkbgH3yeicpe7`
        + `kgi6Vac2prtPJ2xgdZA9MHOCeX5uYDGDb1mMkWBWf3NtiWytbnhtoZ6Bxlz//2YSRmjWbf9NREE9`;
    fp_tmpl2_in_base64 = `AiQ3JVXNwbWLr4agnL6QMt2uTZSlPcypGKVSvMNGrVJDT75VBcg1X2tMUGy5DxkneF4PHy53haC7` +
        `nJupvpAMR22yaWKDYX/Rw2SSi8aes8t5ler6In5P/FT/20/7TURVPQ==`;
    // old card info
    newReader_dor = null;
    newReader_icno = null;
    carddata: any = {};
    carddataJson = '';
    oldCardNoFlag = false;
    isRestore = false;

    constructor(private router: Router,
                private commonService: CommonService,
                private route: ActivatedRoute,
                private service: MsksService,
                private localStorages: LocalStorageService,
                private translate: TranslateService) { }

    ngOnInit(): void {
        console.log('init fun');
        this.initParam();
    }
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
            this.newReader_dor = this.localStorages.get('newReader_dor');
            this.newReader_icno = this.localStorages.get('newReader_icno');
            this.cleanLocalstorageData();
            this.initCloseCardForReader();
        });
    }

    /**
     * init clean localstorage data.
     */
    cleanLocalstorageData() {
        this.localStorages.remove('fp_tmpl1_in_base64');
        this.localStorages.remove('fp_tmpl2_in_base64');
        this.localStorages.remove('carddataJson');
    }

    /**
     * nextPage.
     */
    nextRoute() {
        this.localStorages.set('fp_tmpl1_in_base64', this.fp_tmpl1_in_base64);
        this.localStorages.set('fp_tmpl2_in_base64', this.fp_tmpl2_in_base64);
        this.localStorages.set('carddataJson', this.carddataJson);
        this.router.navigate(['/kgen-viewcard/fingerprintLeft'],
            {
                queryParams: {
                    'lang': this.translate.currentLang, 'cardType': this.cardType
                }
            });
        return;
    }

    timeExpire() {
        setTimeout(() => {
            this.commonService.doCloseWindow();
        }, 500);
    }

    /**
     * backPage.
     */
    backRoute() {
        this.commonService.doCloseWindow();
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
     * 重試.
     */
    failTryAgain() {
        this.modalRetry.hide();
        if (this.cardType === 1 && this.oldCardNoFlag) {
            this.commonService.doCloseCard();
            this.commonService.doReturnDoc();
            this.router.navigate(['/kgen-viewcard/insertcard'],
                {
                    queryParams: {
                        'lang': this.translate.currentLang, 'cardType': this.cardType
                    }
                });
            return;
        } else {
            setTimeout(() => {
                    this.processNewReader();
            }, 3000);
        }
    }

    /**
     * init page.
     */
    initPage(cardType) {
        console.log('call init page fun.');
        // show old card
        if (cardType === 1) {
            this.processOldReader();
        } else {  // show new card
            this.doFlashLight('08');
            this.processNewReader();
        }
    }

// ====================================================== Common Start =================================================================
    /**
     * close card fun.
     */
    initCloseCardForReader() {
        this.service.sendRequestWithLog(CHANNEL_ID_RR_CARDREADER, 'closecard').subscribe((resp) => {
            this.initPage(this.cardType);
        });
    }

    /**
     *  open card fun.
     */
    openCardCommonFun(cardType, payloadParam) {
        console.log('call openCardFun fun.');
        this.processing.show();
        this.service.sendRequestWithLog(CHANNEL_ID_RR_CARDREADER, 'opencard', payloadParam).subscribe((resp) => {
            if ((JSON.stringify(resp) !== '{}' && resp.result !== false) || (resp.result !== undefined && resp.result !== false)) {
                if (cardType === 1) {
                    this.doLightOff('07');
                    this.readhkicv1();
                } else {
                    this.readhkicv2();
                }
            } else {
                if (resp.error_info && resp.error_info.error_code === '7') {
                    if (this.cardType === 1) {
                        this.messageRetry = 'SCN-GEN-STEPS.READER-OLD-NO-CARD';
                        this.oldCardNoFlag = true;
                        this.modalRetry.show();
                    } else {
                        this.messageRetry = 'SCN-GEN-STEPS.OPEN-CARD-EXCEPTON-NOCARD';
                        if (this.retryOpencardVal < 2) {
                            this.retryOpencardVal += 1;
                            this.failTryAgain();
                        } else {
                            this.processing.hide();
                            this.messageFail = this.messageRetry;
                            this.modalFail.show();
                        }
                    }
                } else {
                    this.processing.hide();
                    this.messageFail = this.messageRetry;
                    this.modalFail.show();
                }
            }
        });
    }
// ====================================================== Common End =======================================================================
// ====================================================== New Reader Start =================================================================

    /**
     *  read new card data.
     */
    processNewReader() {
        const payload = {
            'card_reader_id':  null,
            'contactless_password': {
                'date_of_registration': this.newReader_dor,
                'hkic_no':  this.newReader_icno
            }
        }
        this.openCardCommonFun(2, payload);
    }
    /**
     *  read data from new reader.
     */
    readhkicv2() {
        this.service.sendRequestWithLog(CHANNEL_ID_RR_CARDREADER, 'readhkicv2').subscribe((resp) => {
            this.carddata = {...resp};
            this.fp_tmpl1_in_base64 = resp.fingerprint0;
            this.fp_tmpl2_in_base64 = resp.fingerprint1;
            this.carddataJson = JSON.stringify(this.carddata);
            this.processing.hide();
            this.nextRoute();
        });
    }

// ====================================================== New Reader End===================================================================
// ====================================================== Old Reader Start=================================================================
    /**
     *  read old card data,call opengate.
     */
    processOldReader() {
        this.doFlashLight('07');
        const payload = {'card_reader_id': null,
            'contactless_password': {
                'date_of_registration': null,
                'hkic_no': null}
        };
        // old Reader open card.
        this.openCardCommonFun(1, payload);
    }

    readhkicv1() {
        this.service.sendRequestWithLog(CHANNEL_ID_RR_CARDREADER, 'readhkicv1').subscribe((resp) => {
            this.carddata = {...resp};
            this.fp_tmpl1_in_base64 = resp.fingerprint0;
            this.fp_tmpl2_in_base64 = resp.fingerprint1;
            this.carddataJson = JSON.stringify(this.carddata);
            this.processing.hide();
            this.nextRoute();
        });
    }
// ====================================================== Old Reader End =================================================================
    /**
     *  do flash Light.
     * @returns {Observable<any>}
     */
    doFlashLight(deviceCode: string)  {
        console.log('call doFlashLight');
        this.service.sendRequestWithLog('CHANNEL_ID_RR_NOTICELIGHT', 'flash', { 'device': deviceCode }).subscribe((resp) => { });
    }

    doLightOff(deviceCode: string) {
        console.log('call doLightOff');
        this.service.sendRequestWithLog('CHANNEL_ID_RR_NOTICELIGHT', 'lightoff', { 'device': deviceCode }).subscribe((resp) => { });
    }

    /**
     * close card fun.
     */
    doCloseCard() {
        this.service.sendRequestWithLog(CHANNEL_ID_RR_CARDREADER, 'closecard').subscribe((resp) => { });
    }
    doReturnDoc() {
        this.service.sendRequestWithLog(CHANNEL_ID_RR_ICCOLLECT, 'returndoc').subscribe(() => {});
    }

    /**
     * process fail quit fun.
     */
    processFailQuit() {

        this.modalFail.hide();
        this.doCloseCard();
        if (this.cardType === 1) {
            this.doReturnDoc();
        }
        this.backRoute();
    }
    processModalShow() {
        this.modal1.show()
        if (this.processing.visible) {
            this.isRestore = true;
            this.processing.hide();
        }
    }
    processCancel() {
        this.modal1.hide();
        if (this.isRestore) {
            this.processing.show();
        }
    }
}
