import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Component, OnInit, ViewChild} from '@angular/core';
import {FingerprintService} from '../../../shared/services/fingerprint-service/fingerprint.service';
import {MsksService} from '../../../shared/msks';
import {ConfirmComponent} from '../../../shared/sc2-confirm';
import {LocalStorageService} from '../../../shared/services/common-service/Local-storage.service';
import {ProcessingComponent} from '../../../shared/processing-component';
import {HttpClient} from '@angular/common/http';
import {CommonService} from '../../../shared/services/common-service/common.service';
import {TimerComponent} from '../../../shared/sc2-timer';
import {CHANNEL_ID_RR_CARDREADER, CHANNEL_ID_RR_ICCOLLECT} from '../../../shared/var-setting';
@Component({
    templateUrl: './step-fingerprint.component.html',
    styleUrls: ['./step-fingerprint.component.scss']
})

export class StepFingerprintComponent implements OnInit {

    @ViewChild('modalRetry')
    public modalRetry: ConfirmComponent;

    @ViewChild('modalFail')
    public modalFail: ConfirmComponent;

    @ViewChild('modalQuit')
    public modalQuit: ConfirmComponent;

    @ViewChild('modalTimeout')
    public modalTimeout: ConfirmComponent;

    @ViewChild('modalCollect')
    public modalCollect: ConfirmComponent;

    @ViewChild('processing')
    public processing: ProcessingComponent;

    @ViewChild('timer')
    public timer: TimerComponent;
    messageRetry: String = 'SCN-GEN-STEPS.RE-SCANER-FINGER';
    messageFail= 'SCN-GEN-STEPS.RE-SCANER-MAX';
    messageAbort= 'SCN-GEN-STEPS.ABORT_CONFIRM';
    messageTimeout = 'SCN-GEN-STEPS.MESSAGE-TIMEOUT';
    fingerprintInfo = '1313213213';
    fingerCount = 0;
    maxFingerCount = 2;
    isRestore = false;
    isAbort = false;
    timeOutPause = false;
    cardType = 1;
    readType = 1;
    retryVal = 0;
    retryVal_01 = 0;
    retryVal_02 = 0;
    retryVal_03 = 0;

    fp_tmpl1_in_base64 = '';
    fp_tmpl2_in_base64 = '';
    fp_tmpl1_fingernum = '';
    fp_tmpl2_fingernum = '';
    fingerNum = '';
    PAGE_FINGERPRINT_ABORT_QUIT_ITEMOUT = 15000;
    PAGE_FINGERPRINT_RETURN_CARD_ITEMOUT = 13000;
    PAGE_FINGERPRINT_TIME_EXPIRE_ITEMOUT = 15000;
    PAGE_FINGERPRINT_MATCH_SCORE = 5000;
    PAGE_FINGERPRINT_SCAN_MAX = 3;
    PAGE_FINGERPRINT_IS_VALIDATION = 0;
    PAGE_FINGERPRINT_FP_TMPL_FORMAT = 'Morpho_PkCompV2';
    APP_LANG = '';
    DEVICE_LIGHT_CODE_OCR_READER = '08'
    DEVICE_LIGHT_CODE_IC_READER = '07'
    DEVICE_LIGHT_CODE_PRINTER = '06'
    DEVICE_LIGHT_CODE_FINGERPRINT = '06'

    carddata: any = {};
    allFingerNum = [];

    constructor(private router: Router,
                private commonService: CommonService,
                private route: ActivatedRoute,
                private service: MsksService,
                private http: HttpClient,
                private localStorages: LocalStorageService,
                private fingers: FingerprintService,
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
        this.DEVICE_LIGHT_CODE_OCR_READER = this.localStorages.get('DEVICE_LIGHT_CODE_OCR_READER');
        this.DEVICE_LIGHT_CODE_IC_READER = this.localStorages.get('DEVICE_LIGHT_CODE_IC_READER');
        this.DEVICE_LIGHT_CODE_PRINTER = this.localStorages.get('DEVICE_LIGHT_CODE_PRINTER');
        this.DEVICE_LIGHT_CODE_FINGERPRINT = this.localStorages.get('DEVICE_LIGHT_CODE_FINGERPRINT');

        this.PAGE_FINGERPRINT_ABORT_QUIT_ITEMOUT = Number.parseInt(this.localStorages.get('PAGE_FINGERPRINT_ABORT_QUIT_ITEMOUT'));
        this.PAGE_FINGERPRINT_RETURN_CARD_ITEMOUT = Number.parseInt(this.localStorages.get('PAGE_FINGERPRINT_RETURN_CARD_ITEMOUT'));
        this.PAGE_FINGERPRINT_TIME_EXPIRE_ITEMOUT = Number.parseInt(this.localStorages.get('PAGE_FINGERPRINT_TIME_EXPIRE_ITEMOUT'));
        this.PAGE_FINGERPRINT_MATCH_SCORE = Number.parseInt(this.localStorages.get('PAGE_FINGERPRINT_MATCH_SCORE'));
        this.PAGE_FINGERPRINT_SCAN_MAX = Number.parseInt(this.localStorages.get('PAGE_FINGERPRINT_SCAN_MAX'));
        this.PAGE_FINGERPRINT_IS_VALIDATION = Number.parseInt(this.localStorages.get('PAGE_FINGERPRINT_IS_VALIDATION'));
        this.PAGE_FINGERPRINT_FP_TMPL_FORMAT = this.localStorages.get('PAGE_FINGERPRINT_FP_TMPL_FORMAT');

        this.cardType = Number.parseInt(this.localStorages.get('cardType'));
        this.readType = Number.parseInt(this.localStorages.get('readType'));
        this.fp_tmpl1_in_base64 = this.localStorages.get('fp_tmpl1_in_base64');
        this.fp_tmpl2_in_base64 = this.localStorages.get('fp_tmpl2_in_base64');
        this.fp_tmpl1_fingernum = this.localStorages.get('fp_tmpl1_fingernum');
        this.fp_tmpl2_fingernum = this.localStorages.get('fp_tmpl2_fingernum');
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
        this.quitDisabledAll();
        this.startFingerPrint();
    }

    /**
     * init param Data.
     */
    startFingerPrint() {
        if (this.commonService.checkFpNull(this.fp_tmpl1_in_base64) && !this.commonService.checkFpNull(this.fp_tmpl2_in_base64)) {
            this.fp_tmpl1_in_base64 = this.fp_tmpl2_in_base64;
            this.fp_tmpl1_fingernum = this.fp_tmpl2_fingernum;
            this.maxFingerCount = 1;
            this.allFingerNum.push('fp' + this.fp_tmpl2_fingernum);
        } else if (this.commonService.checkFpNull(this.fp_tmpl2_in_base64)) {
            this.maxFingerCount = 1;
            this.allFingerNum.push('fp' + this.fp_tmpl1_fingernum);
        } else {
            this.allFingerNum.push('fp' + this.fp_tmpl1_fingernum);
            this.allFingerNum.push('fp' + this.fp_tmpl2_fingernum);
        }
        this.processing.hide();
        this.doScanFingerPrint();
    }

    nextRoute() {
        if (this.timeOutPause || this.isAbort) {
            return;
        }
        this.storeConfigParam();
        this.router.navigate(['/kgen-viewcard/viewcard']);
        return;
    }

    storeConfigParam() {
        this.localStorages.set('APP_LANG', this.translate.currentLang);
        this.localStorages.set('cardType', this.cardType.toString());
        this.localStorages.set('readType', this.readType.toString());
    }

    /**
     * backPage.
     */
    backRoute() {
        this.timeOutPause = true;
        if (this.processing.visible) {
            this.processing.hide();
        }
        if (this.modalRetry.visible) {
            this.modalRetry.hide();
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

    getFinger() {
        // this.modalInfo.hide();
        console.log('this.fingerCount: ', this.fingerCount);
        this.processing.hide();
        this.cancelQuitEnabledAll();
        this.doScanFingerPrint();
    }

    /**
     *  start scanner fingerprint
     */
    doScanFingerPrint() {
        console.log('call : getphoto fun.')
        if (this.isAbort || this.timeOutPause) {
            return;
        }
        this.service.sendRequestWithLog('RR_FPSCANNERREG', 'takephoto', {}).subscribe((resp) => {
            this.processing.show();
            this.quitDisabledAll();
            if (!$.isEmptyObject(resp)) {
                if (resp.errorcode === '0') {
                    this.processExtractImgtmpl(resp.fpdata);
                } else {
                    this.doFailedScan();
                }
            } else {
                this.messageFail = 'SCN-GEN-STEPS.FINGERPRINT-DEVICE-EXCEPTION';
                this.processing.hide();
                if (this.isAbort || this.timeOutPause) {
                    return;
                }
                this.processModalFailShow();
            }
        }, (error) => {
            console.log('takephoto ERROR ' + error);
            this.messageFail = 'SCN-GEN-STEPS.FINGERPRINT-DEVICE-EXCEPTION';
            this.processing.hide();
            if (this.isAbort || this.timeOutPause) {
                return;
            }
            this.processModalFailShow();
        });
    }

    /**
     * faild try again.
     */
    doFailedScan() {
        if (this.isAbort || this.timeOutPause) {
            return;
        }
        this.retryVal += 1;
        if (this.retryVal < this.PAGE_FINGERPRINT_SCAN_MAX) {
            console.log(this.retryVal);
            this.processing.hide();
            this.quitDisabledAll();
            this.modalRetry.show();
        } else {
            this.messageFail = 'SCN-GEN-STEPS.RE-SCANER-MAX';
            this.isAbort = true;
            this.processing.hide();
            this.processModalFailShow();
        }
    }

    /**
     * scan try again.
     */
    failTryAgain() {
        this.modalRetry.hide();
        this.doScanFingerPrint();
    }

    /**
     *  data type change to Morpho_CFV
     * @param fpdata
     */
    processExtractImgtmpl (fpdata: String) {
        if (this.isAbort || this.timeOutPause) {
            return;
        }
        this.service.sendRequestWithLog('RR_fptool', 'extractimgtmpl',
                    {'finger_num': this.fp_tmpl1_fingernum,
                        'fp_tmpl_format': this.PAGE_FINGERPRINT_FP_TMPL_FORMAT,
                        'fp_img_in_base64': fpdata}).subscribe((resp) => {
                    if (resp.error_info.error_code === '0') {
                        this.compareFingerPrint( resp.fp_tmpl_in_base64);
                    } else {
                        if (this.maxFingerCount > 1) {
                            this.processExtractImgtmplTwo(fpdata);
                        } else {
                            this.doFailedScan();
                        }
            }
        }, (error) => {
            console.log('extractimgtmpl ERROR ' + error);
            this.doCloseCard();
        });
    }

    processExtractImgtmplTwo (fpdata: String) {
        if (this.isAbort || this.timeOutPause) {
            return;
        }
        this.service.sendRequestWithLog('RR_fptool', 'extractimgtmpl',
            {'finger_num': this.fp_tmpl2_fingernum,
                'fp_tmpl_format': this.PAGE_FINGERPRINT_FP_TMPL_FORMAT,
                'fp_img_in_base64': fpdata}).subscribe((resp) => {
            if (resp.error_info.error_code === '0') {
                this.compareFingerPrint( resp.fp_tmpl_in_base64);
            } else {
                this.doFailedScan();
            }
        }, (error) => {
            console.log('extractimgtmpl ERROR ' + error);
            this.doCloseCard();
        });
    }

    /**
     *
     * @param fpdataTemp
     */
    compareFingerPrint(fpdataTemp: String) {
        if (this.isAbort || this.timeOutPause) {
            return;
        }
        this.service.sendRequest('RR_fptool', 'verifytmpl', {
            'fp_tmpl_format': this.PAGE_FINGERPRINT_FP_TMPL_FORMAT,
            'fp_tmpl1_in_base64': fpdataTemp,
            'fp_tmpl2_in_base64': this.fp_tmpl1_in_base64
        }).subscribe((resp) => {
            // is validate
            if (this.PAGE_FINGERPRINT_IS_VALIDATION === 0 || this.cardType === 1) {
                this.nextRoute();
            }
            // resp.match_score = 500;
            if (!$.isEmptyObject(resp)) {
            // if (resp.match_score !== null) {
                if (resp.match_score >= this.PAGE_FINGERPRINT_MATCH_SCORE) {
                    this.nextRoute();
                } else {
                    if (this.maxFingerCount > 1) {
                        this.compareFingerPrintTwo(fpdataTemp);
                    } else {
                        this.doFailedScan();
                    }
                }
            } else {
                console.log('There\'s an error on comparing fingerprints!');
                this.isAbort = true;
                this.doCloseCard();
            }
        }, (error) => {
            console.log('verifytmpl ERROR ' + error);
            this.isAbort = true;
            this.doCloseCard();
        });
    }

    compareFingerPrintTwo(fpdataTemp: String) {
        if (this.isAbort || this.timeOutPause) {
            return;
        }
        this.service.sendRequest('RR_fptool', 'verifytmpl', {
            'fp_tmpl_format': this.PAGE_FINGERPRINT_FP_TMPL_FORMAT,
            'fp_tmpl1_in_base64': fpdataTemp,
            // 'fp_tmpl2_in_base64': this.fingerCount === 1 ? this.fp_tmpl1_in_base64 : this.fp_tmpl2_in_base64
            'fp_tmpl2_in_base64': this.fp_tmpl2_in_base64
        }).subscribe((resp) => {
            // is validate
            if (this.PAGE_FINGERPRINT_IS_VALIDATION === 0 || this.cardType === 1) {
                this.nextRoute();
            }
            if (!$.isEmptyObject(resp)) {
            // resp.match_score = 500;
            // if (resp.match_score !== null) {
                if (resp.match_score >= this.PAGE_FINGERPRINT_MATCH_SCORE) {
                    this.nextRoute();
                } else {
                    this.doFailedScan()
                }
            } else {
                console.log('There\'s an error on comparing fingerprints!');
                this.isAbort = true;
                this.doCloseCard();
            }
        }, (error) => {
            console.log('verifytmpl ERROR ' + error);
            this.isAbort = true;
            this.doCloseCard();
        });
    }

    // *************************************************************************************************************************************

    /**
     *  timeout
     */
    timeExpire() {
        this.timer.showTimer = false;
        this.timeOutPause = true;
        if (this.processing.visible) {
            this.processing.hide();
        }
        if (this.modalRetry.visible) {
            this.modalRetry.hide();
        }
        if (this.modalQuit.visible) {
            this.modalQuit.hide();
        }
        this.messageTimeout = 'SCN-GEN-STEPS.MESSAGE-TIMEOUT';
        this.modalTimeout.show();
        this.quitDisabledAll();
        setTimeout(() => {
            this.processTimeoutQuit();
        }, this.PAGE_FINGERPRINT_TIME_EXPIRE_ITEMOUT);
    }

    processTimeoutQuit() {
        this.modalTimeout.hide();
        this.doCloseCard();
    }
    processModalFailShow() {
        this.quitDisabledAll();
        this.isAbort = true;
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
            this.commonService.doLightoff(this.DEVICE_LIGHT_CODE_OCR_READER);
            this.backRoute();
        }, this.PAGE_FINGERPRINT_ABORT_QUIT_ITEMOUT);
    }

    doCloseCard() {
        this.processing.show();
        this.service.sendRequestWithLog(CHANNEL_ID_RR_CARDREADER, 'closecard').subscribe((resp) => {
            if (this.readType === 1) {
                setTimeout(() => {
                    this.doReturnDoc();
                }, this.PAGE_FINGERPRINT_RETURN_CARD_ITEMOUT);
                setTimeout(() => {
                    this.backRoute();
                }, this.PAGE_FINGERPRINT_ABORT_QUIT_ITEMOUT);
            } else {
               this.modalCollectShow();
            }
        }, (error) => {
            console.log('closecard ERROR ' + error);
            setTimeout(() => {
                this.backRoute();
            }, this.PAGE_FINGERPRINT_ABORT_QUIT_ITEMOUT);
        });
    }

    doReturnDoc() {
        this.commonService.doFlashLight(this.DEVICE_LIGHT_CODE_IC_READER);
        this.service.sendRequestWithLog(CHANNEL_ID_RR_ICCOLLECT, 'returndoc').subscribe(() => {
            this.commonService.doLightoff(this.DEVICE_LIGHT_CODE_IC_READER);
        });
    }
}
