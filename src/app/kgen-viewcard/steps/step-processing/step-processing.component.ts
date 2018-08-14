import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ProcessingComponent} from '../../../shared/processing-component';
import {CommonService} from '../../../shared/services/common-service/common.service';
import {MsksService} from '../../../shared/msks';
import {ConfirmComponent} from '../../../shared/sc2-confirm';
import {LocalStorageService} from '../../../shared/services/common-service/Local-storage.service';
import {TranslateService} from '@ngx-translate/core';
import {CHANNEL_ID_RR_CARDREADER, CHANNEL_ID_RR_ICCOLLECT} from '../../../shared/var-setting';
import {TimerComponent} from '../../../shared/sc2-timer';

@Component({
    templateUrl: './step-processing.component.html',
    styleUrls: ['./step-processing.component.scss']
})
export class StepProcessingComponent implements OnInit {

    @ViewChild('modalRetry')
    public modalRetry: ConfirmComponent;

    @ViewChild('modalFail')
    public modalFail: ConfirmComponent;

    @ViewChild('modalCollect')
    public modalCollect: ConfirmComponent;

    @ViewChild('modalQuit')
    public modalQuit: ConfirmComponent;

    @ViewChild('modalTimeout')
    public modalTimeout: ConfirmComponent;

    @ViewChild('modalNoROP')
    public modalNoROP: ConfirmComponent;

    @ViewChild('processing')
    public processing: ProcessingComponent;

    @ViewChild('timer')
    public timer: TimerComponent;
    messageRetry = 'SCN-GEN-STEPS.RE-SCANER-FINGER';
    retryOpencardVal = 0;
    messageFail = 'SCN-GEN-STEPS.RE-SCANER-MAX';
    messageAbort = 'SCN-GEN-STEPS.ABORT_CONFIRM';
    messageTimeout = 'SCN-GEN-STEPS.MESSAGE-TIMEOUT';

    cardType = 1;
    readType = 1;
    fp_tmpl1_in_base64 = `Aiw3KG7NwbXqRIZfgGzzNPVE+k3x18SUlEGwrmhOabMCVmZMUz4nZbFds2f2x/rYkbgH3yeicpe7`
        + `kgi6Vac2prtPJ2xgdZA9MHOCeX5uYDGDb1mMkWBWf3NtiWytbnhtoZ6Bxlz//2YSRmjWbf9NREE9`;
    fp_tmpl2_in_base64 = `AiQ3JVXNwbWLr4agnL6QMt2uTZSlPcypGKVSvMNGrVJDT75VBcg1X2tMUGy5DxkneF4PHy53haC7` +
        `nJupvpAMR22yaWKDYX/Rw2SSi8aes8t5ler6In5P/FT/20/7TURVPQ==`;
    // old card info
    carddata: any = {};
    carddataJson = '';
    oldCardNoFlag = false;
    isRestore = false;
    isAbort = false;
    timeOutPause = false;

    PAGE_PROCESSING_ABORT_QUIT_ITEMOUT = 5000;
    PAGE_PROCESSING_RETURN_CARD_ITEMOUT = 5000;
    PAGE_PROCESSING_TIME_EXPIRE_ITEMOUT = 5000;
    APP_LANG = '';
    DEVICE_LIGHT_CODE_OCR_READER = '08'
    DEVICE_LIGHT_CODE_IC_READER = '07'
    DEVICE_LIGHT_CODE_PRINTER = '06'
    DEVICE_LIGHT_CODE_FINGERPRINT = '06'

    constructor(private router: Router,
                private commonService: CommonService,
                private route: ActivatedRoute,
                private service: MsksService,
                private localStorages: LocalStorageService,
                private translate: TranslateService) { }

    ngOnInit(): void {
        console.log('init fun');
        this.initConfigParam();
        this.initLanguage();
        this.startBusiness();
    }

    initConfigParam() {
        this.APP_LANG = this.localStorages.get('APP_LANG');
        this.DEVICE_LIGHT_CODE_OCR_READER = this.localStorages.get('DEVICE_LIGHT_CODE_OCR_READER');
        this.DEVICE_LIGHT_CODE_IC_READER = this.localStorages.get('DEVICE_LIGHT_CODE_IC_READER');
        this.DEVICE_LIGHT_CODE_PRINTER = this.localStorages.get('DEVICE_LIGHT_CODE_PRINTER');
        this.DEVICE_LIGHT_CODE_FINGERPRINT = this.localStorages.get('DEVICE_LIGHT_CODE_FINGERPRINT');

        this.PAGE_PROCESSING_ABORT_QUIT_ITEMOUT = Number.parseInt(this.localStorages.get('PAGE_PROCESSING_ABORT_QUIT_ITEMOUT'));
        this.PAGE_PROCESSING_RETURN_CARD_ITEMOUT = Number.parseInt(this.localStorages.get('PAGE_PROCESSING_RETURN_CARD_ITEMOUT'));
        this.PAGE_PROCESSING_TIME_EXPIRE_ITEMOUT = Number.parseInt(this.localStorages.get('PAGE_PROCESSING_TIME_EXPIRE_ITEMOUT'));

        this.cardType = Number.parseInt(this.localStorages.get('cardType'));
        this.readType = Number.parseInt(this.localStorages.get('readType'));
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
        this.quitDisabledAll();
        this.processing.show();
        this.cleanLocalstorageData();
        this.startProcess();
    }

    /**
     * init page.
     */
    startProcess() {
        console.log('call init page fun.');
        if (this.cardType === 1) {
            this.readhkicv1()
        } else {  // show new card
            this.readhkicv2();
        }
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
        if (this.timeOutPause || this.isAbort) {
            return;
        }
        this.storeConfigParam();
        this.router.navigate(['/kgen-viewcard/fingerprint']);
        return;
    }

    storeConfigParam() {
        this.localStorages.set('fp_tmpl1_in_base64', this.fp_tmpl1_in_base64);
        this.localStorages.set('fp_tmpl2_in_base64', this.fp_tmpl2_in_base64);
        // this.localStorages.set('fp_tmpl1_fingernum', '0');
        // this.localStorages.set('fp_tmpl2_fingernum', '5');
        this.localStorages.set('carddataJson', this.carddataJson);
        this.localStorages.set('APP_LANG', this.translate.currentLang);
    }

    /**
     * backPage.
     */
    backRoute() {
        if (this.processing.visible) {
            this.processing.hide();
        }
        if (this.modalRetry.visible) {
            this.modalRetry.hide();
        }
        if (this.modalFail.visible) {
            this.modalFail.hide();
        }
        if (this.modalQuit.visible) {
            this.modalQuit.hide();
        }
        this.commonService.doLightoff(this.DEVICE_LIGHT_CODE_OCR_READER);
        this.commonService.doLightoff(this.DEVICE_LIGHT_CODE_IC_READER);
        this.timer.ngOnDestroy();
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
     * handle ..
     * @param fp_tmpl1_in_base64
     * @param fp_tmpl2_in_base64
     */
    handleFingerNumber(fp_tmpl1_in_base64, fp_tmpl2_in_base64) {
        if (this.isAbort || this.timeOutPause) {
            return;
        }
        if (!this.commonService.checkFpNull(fp_tmpl1_in_base64)) {
            this.getFingerNumber(fp_tmpl1_in_base64, (rp1) => {
                this.localStorages.set('fp_tmpl1_fingernum', rp1.finger_num.toString());
                if (!this.commonService.checkFpNull(fp_tmpl2_in_base64)) {
                    this.getFingerNumber(fp_tmpl2_in_base64, (rp2) => {
                        this.localStorages.set('fp_tmpl2_fingernum', rp2.finger_num.toString());
                        this.processing.hide();
                        this.cancelQuitEnabledAll();
                        this.nextRoute();
                    });
                } else {
                    this.localStorages.set('fp_tmpl2_fingernum', null);
                    this.processing.hide();
                    this.cancelQuitEnabledAll();
                    this.nextRoute();
                }
            });
        } else {
            this.localStorages.set('fp_tmpl1_fingernum', null);
            if (!this.commonService.checkFpNull(fp_tmpl2_in_base64)) {
                this.getFingerNumber(fp_tmpl2_in_base64, (rp2) => {
                    this.localStorages.set('fp_tmpl2_fingernum', rp2.finger_num.toString());
                    this.processing.hide();
                    this.cancelQuitEnabledAll();
                    this.nextRoute();
                });
            } else {
                this.localStorages.set('fp_tmpl2_fingernum', null);
                this.processing.hide();
                this.cancelQuitEnabledAll();
                this.nextRoute();
            }
        }
    }

    /**
     * get finger num.
     * @param fp_tmpl_in_base64
     */
    getFingerNumber(fp_tmpl_in_base64: string,  callback: (resp) => void = (resp) => {}) {
        if (this.isAbort || this.timeOutPause) {
            return;
        }
        const playloadParam =  {
            'arn': '',
            'fp_tmpl_format': 'Morpho_PkCompV2',
            'fp_tmpl_in_base64':  '' +  fp_tmpl_in_base64
        }
        this.service.sendRequestWithLog('RR_fptool', 'getfingernum', playloadParam).subscribe((resp) => {
                console.log(resp);
            if (!$.isEmptyObject(resp)) {
                if (resp.error_info.error_code === '0') {
                    callback(resp);
                } else {
                    this.messageFail = 'SCN-GEN-STEPS.FINGERPRINT-NOT-MATCH-FINGER';
                    if (this.isAbort || this.timeOutPause) {
                        return;
                    }
                    this.processModalFailShow();
                }
            } else {
                this.messageFail = 'SCN-GEN-STEPS.FINGERPRINT-NOT-MATCH-FINGER';
                if (this.isAbort || this.timeOutPause) {
                    return;
                }
                this.processModalFailShow();
            }
        }, (error) => {
            console.log('getfingernum ERROR ' + error);
            this.messageFail = 'SCN-GEN-STEPS.FINGERPRINT-NOT-MATCH-FINGER';
            if (this.isAbort || this.timeOutPause) {
                return;
            }
            this.processModalFailShow();
        });
    }
// ====================================================== New Reader Start =================================================================
    /**
     *  read data from new reader.
     */
    readhkicv2() {
        if (this.isAbort || this.timeOutPause) {
            return;
        }
        this.service.sendRequestWithLog(CHANNEL_ID_RR_CARDREADER, 'readhkicv2').subscribe((resp) => {
            if (!$.isEmptyObject(resp)) {
                this.carddata = {...resp};
                this.fp_tmpl1_in_base64 = resp.morpho_fp_tmpl1_in_base64;
                this.fp_tmpl2_in_base64 = resp.morpho_fp_tmpl2_in_base64;
                this.carddataJson = JSON.stringify(this.carddata);
                this.handleFingerNumber(this.fp_tmpl1_in_base64, this.fp_tmpl2_in_base64);
            } else {
                this.messageFail = 'SCN-GEN-STEPS.PROCESS_SCREEN_S14';
                if (this.isAbort || this.timeOutPause) {
                    return;
                }
                this.processModalFailShow();
            }
        }, (error) => {
            console.log('readhkicv2 ERROR ' + error);
            this.messageFail = 'SCN-GEN-STEPS.PROCESS_SCREEN_S14';
            if (this.isAbort || this.timeOutPause) {
                return;
            }
            this.processModalFailShow();
        });
    }

// ====================================================== New Reader End===================================================================
// ====================================================== Old Reader Start=================================================================
    readhkicv1() {
        if (this.isAbort || this.timeOutPause) {
            return;
        }
        this.service.sendRequestWithLog(CHANNEL_ID_RR_CARDREADER, 'readhkicv1').subscribe((resp) => {
            if (!$.isEmptyObject(resp)) {
                this.carddata = {...resp};
                // this.fp_tmpl1_in_base64 = resp.fingerprint0;
                // this.fp_tmpl2_in_base64 = resp.fingerprint1;
                this.carddataJson = JSON.stringify(this.carddata);
                this.handleFingerNumber(this.fp_tmpl1_in_base64, this.fp_tmpl2_in_base64);
            } else {
                this.messageFail = 'SCN-GEN-STEPS.PROCESS_SCREEN_S14';
                if (this.isAbort || this.timeOutPause) {
                    return;
                }
                this.processModalFailShow();
            }
        }, (error) => {
            console.log('readhkicv1 ERROR ' + error);
            this.messageFail = 'SCN-GEN-STEPS.PROCESS_SCREEN_S14';
            if (this.isAbort || this.timeOutPause) {
                return;
            }
            this.processModalFailShow();
        });
    }
// ====================================================== Old Reader End ================================================================

    timeExpire() {
        this.timer.showTimer = false;
        this.timeOutPause = true;
        if (this.processing.visible) {
            this.processing.hide();
        }
        if (this.modalRetry.visible) {
            this.modalRetry.hide();
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
        }, this.PAGE_PROCESSING_TIME_EXPIRE_ITEMOUT);
    }

    processTimeoutQuit() {
        this.modalTimeout.hide();
        this.doCloseCard();
    }

    processModalFailShow() {
        this.quitDisabledAll();
        this.isAbort = true;
        if (this.processing.visible) {
            this.isRestore = true;
            this.processing.hide();
        }
        this.modalFail.show();
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
            this.processing.hide();
        }
        this.isAbort = true;
        this.doCloseCard();
    }
    processCancelQuit() {
        this.modalQuit.hide();
        this.isAbort = false;
        if (this.isRestore) {
            this.processing.show();
        } else {
            this.cancelQuitEnabledAll();
        }
    }
    modalCollectShow() {
        this.commonService.doFlashLight(this.DEVICE_LIGHT_CODE_OCR_READER);
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
            this.commonService.doLightoff(this.DEVICE_LIGHT_CODE_OCR_READER);
        }, this.PAGE_PROCESSING_ABORT_QUIT_ITEMOUT);
    }
    doCloseCard() {
        this.processing.show();
        this.service.sendRequestWithLog(CHANNEL_ID_RR_CARDREADER, 'closecard').subscribe((resp) => {
            if (this.readType === 1) {
                this.doReturnDoc();
                setTimeout(() => {
                    this.backRoute();
                }, this.PAGE_PROCESSING_RETURN_CARD_ITEMOUT);
            } else {
              this.modalCollectShow();
            }
        }, (error) => {
            console.log('extractimgtmpl ERROR ' + error);
            setTimeout(() => {
                this.backRoute();
            }, this.PAGE_PROCESSING_ABORT_QUIT_ITEMOUT);
        });
    }

    doReturnDoc() {
        this.commonService.doFlashLight(this.DEVICE_LIGHT_CODE_IC_READER);
        this.service.sendRequestWithLog(CHANNEL_ID_RR_ICCOLLECT, 'returndoc').subscribe(() => {
            this.commonService.doLightoff(this.DEVICE_LIGHT_CODE_IC_READER);
        });
    }
}
