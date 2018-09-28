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
    messageCollect = 'SCN-GEN-STEPS.COLLECT-CARD-SURE';

    cardType = 1;
    readType = 1;
    // fp_tmpl1_in_base64 = '';
        fp_tmpl1_in_base64 = `Aiw3KG7NwbXqRIZfgGzzNPVE+k3x18SUlEGwrmhOabMCVmZMUz4nZbFds2f2x/rYkbgH3yeicpe7`
        + `kgi6Vac2prtPJ2xgdZA9MHOCeX5uYDGDb1mMkWBWf3NtiWytbnhtoZ6Bxlz//2YSRmjWbf9NREE9`;
    fp_tmpl2_in_base64 = `AiQ3JVXNwbWLr4agnL6QMt2uTZSlPcypGKVSvMNGrVJDT75VBcg1X2tMUGy5DxkneF4PHy53haC7` +
        `nJupvpAMR22yaWKDYX/Rw2SSi8aes8t5ler6In5P/FT/20/7TURVPQ==`;
    // fp_tmpl1_in_base64 = 'BAADIxYCAwEMXQAxDAEAIgJoAgATfgAzzcUAyAIDBDdYczlSD1VnA0QSd3xqA2xoRgwAAw0NdAOQbwMkUwAHWgMCgjxXZUNOjGZoBHDtizZkAkg3ToYAA/jySY7xOAJfWQACcgADD3qpTEdW7mt/BJIVFLOKAoGCYBoCAhMVTY6PmgJMLQACkQADk3SFqFhell+MAJGQk6k6Anl4uGACACU1pBo9eAO7uwQDcwYDFd5dWeqKGpqvAHIPFWhvAGs7iCMDAg7gz++iUALVzgIGegYGmdtUUuSlnsfQAFWe5F9eAHI/25sDBIKo0ZOaSwbq4QMGYQIAQZqkitiNJaCsAoGomYmtAKSr2aoAALG9wtabpwKC5QIAkgIAuYORi7i7mcfaAIK9w5uSAEYAAsoAAAIMAetAzjEAG+hgADtZe3kJAGxjSQAHdwJCNwAAZgAChSp0UTFO9VR3Aj3v6VRaB0JUO+MCA9vyee4VmwAiawACawACDia8kTk+EkVGApsTEq6XAqGKZBEAAxUNUBoQhQI1bwACqQMAFVaUiXwaDjY7Aq6MkLu3AoyQTJADA4yOP4eWxQJjWQMAgQACk32hoUhNmU9yAK2QksXFAqt4zJwAAJocdCQWeQbYzwMDXgMA2dxIbICbHKHEAELMz0xvA3t4lqIGBI7p4+GefwC3pQQCfgMAqsBcfsfIm9DRBG2VoX9aBG9n16QEApyd0iURigOLlQIAmwIDI4uRq6KpJL/JApgQMYrBA6vMnkQAAKWskKa6sACqqAQAgAAEsLTcwrS+ts3WAJrU8q2uBKK7uNoDAsbArYK/xgDKwQIAkgLFtN+jn5LW9xpeTec8+CtvCbP35oDVkcQIokyQfxluKl2hO+UpGLIHw/Y61H7CsUugXI/TbRdbSuQ59ShsBrD0433SjsEFn0mNfBZrJ1qeOOImFa8EwPM30Xu/rkidWYzQahRYR+E28iVpA63x4HrPi74CnEaKeRNoJFebNd8jEqwBvfA0zni8q0WaVonNZxFVRN4z7yJmAKru3XfMiLv/mUOHdhBlIVSYMtwgD6n+uu0xy3W5qEKXU4bKZA5SQdsw7B9j/afr2nTJhbj8lkCEcw1iHlGVL9kdDKb7t+ouyHK2pT+UUIPHYQtPPtgt6Rxg+qTo13HGgrX5kz2BcApfG06SLNYaCaP4tOcrxW+zojyRTYDEXghMO9Uq5hld96Hl1G7Df7L2kDp+bQdcGEuPKdMXBqD1seQowmywnzmOSn3BWwVJONIn4xZa9J7i0WvAfK/zjTd7agRZFUiMJtAUA53yruElv2mtnDaLR3q+WAJGNc8k4BNX8Zvfzmi9eazwijR4ZwFWEkWJI5qrvM3e7w==';
    // fp_tmpl2_in_base64 = 'BAADVxYCAwYM1gAxDAEAVgKpAgBobgAn79IA6QIEVD07amw2YmB4AFpnYXt5Bn9iF0YHAlDufe7kZgcnGgkAXgkA5CtuTSwx7jpACVbi4UlDCllBVOYCCtraRMTqWgcgegAKRgoJ40ZAPUto6nokBDzH0zuSBIGGVXcAAm93SfaCngA1FAAElgAAh02ZqE5nkmlsAKedm56UAIGEdJwHAtK7dKWAqQcVdAQAhwAChV+Gi2pygnh+ArO2oozXAKZ3haIAAq9Sfx8IWAnUuQYAVgQEBYFyb56sNMyBAmwSCVI1AjIvmMUGBsjAhK+SSgLUsAMHPQIHyIQrao2YsaGkAG2mnF9qBlpq05YEBKF+sFhbtgDOwwIEpQQGXc/Bk9DaXtuHA49iaae2BNGxjqwAAqi2idezzgCbjwIAiQAA4KSEkaqw07+BA4bT2siXAKGUlrsAAL/OjdfNnAKnmQIAiwAxDAEABgLAAgBrdAAj/b4A+wACazd0UztaZG8/AnpjaWlWAFBsMWUAAl/mVevhVgBINQADfQMA4XBsYnR34B0vADBx24+mBqqOaHsAAARyTXLrggAdLgAChgAA9XqYnUpNf052AIR+66LIAFg5lZIAAFxWgU1PQAC4tgQDNAYHNdN6fdSMSq3IAmplXn59AEVYjkQAAtjXiMbSNQCf0gQAMQQAxcVIPsXGx8jSBjUozdmABIKHoVEAA2txk46BmgCXkgAAqQACnrCiqra6mMLfB5jOm4iNA9eX5NcJBLfO4dx/jQes6wcAjwkAobi2ibvLfs7OAKq6r5u7ALel2akAArO/1+gsGwAKxvk914HFtE6jX5LWcBpeTec8+CtvCbP35oDVkcQIokyQfxluKl2hO+UpGLIHw/Y61H7CsUugXI/TbRdbSuQ59ShsBrD0433SjsEFn0mNfBZrJ1qeOOImFa8EwPM30Xu/rkidWYzQahRYR+E28iVpA63x4HrPi74CnEaKeRNoJFebNd8jEqwBvfA0zni8q0WaVonNZxFVRN4z7yJmAKru3XfMiLv/mUOHdhBlIVSYMtwgD6n+uu0xy3W5qEKXU4bKZA5SQdsw7B9j/afr2nTJhbj8lkCEcw1iHlGVL9kdDKb7t+ouyHK2pT+UUIPHYQtPPtgt6Rxg+qTo13HGgrX5kz2BcApfG06SLNYaCaP4tOcrxW+zojyRTYDEXghMO9Uq5hld96Hl1G7Df7L2kDp+bQdcGEuPKdMXBqD1seQowmywnzmOSn3BWwVJONIn4xZa9J7i0WvAfK/zjTd7agRZFUiMJtAUA53yruElv2mtnDaLR3q+WAJGNc8k4BNX8Zvfzmi9eazwijR4ZwFWEkWJI5qrvM3e7w==';

    // old card info
    carddata: any = {};
    carddataJson = '';
    oldCardNoFlag = false;
    isRestore = false;
    isAbort = false;
    isShowCollect = false;
    timeOutPause = false;
    hkic_number_view = '';
    PAGE_PROCESSING_ABORT_QUIT_ITEMOUT = 5000;
    PAGE_PROCESSING_RETURN_CARD_ITEMOUT = 5000;
    PAGE_PROCESSING_TIME_EXPIRE_ITEMOUT = 5000;
    APP_LANG = '';
    DEVICE_LIGHT_CODE_OCR_READER = '08';
    DEVICE_LIGHT_CODE_IC_READER = '07';
    DEVICE_LIGHT_CODE_PRINTER = '06';
    DEVICE_LIGHT_CODE_FINGERPRINT = '06';
    DEVICE_LIGHT_ALERT_BAR_BLUE_CODE = '11';
    DEVICE_LIGHT_ALERT_BAR_GREEN_CODE = '12';
    DEVICE_LIGHT_ALERT_BAR_RED_CODE = '13';
    LOCATION_DEVICE_ID = 'K1-SCK-01';

    FP_TMPL_FORMAT_CARD_TYPE_1 = 'Cogent';
    FP_TMPL_FORMAT_CARD_TYPE_2 = 'Morpho_PkCompV2';
    PAGE_FINGERPRINT_FP_TMPL_FORMAT = 'Morpho_PkCompV2';

    ACTION_TYPE_IC_READING_INFO = 'READINFO';
    ACTION_TYPE_IC_CLOSECARD = 'CLOSECARD_IC';
    ACTION_TYPE_IC_RETURN_CARD = 'RETNCRD';
    ACTION_TYPE_OCR_READING_INFO = 'READINFOOCR';
    ACTION_TYPE_OCR_CLOSECARD = 'CLOSECARD_IC';
    ACTION_TYPE_OCR_COLLECT_CARD = 'COLLECT_CARD';
    ACTION_TYPE_FINGER_NUMBER = 'FINGER_NUMBER';

    constructor(private router: Router,
                private commonService: CommonService,
                private route: ActivatedRoute,
                private service: MsksService,
                private localStorages: LocalStorageService,
                private translate: TranslateService) { }

    ngOnInit(): void {
        console.log('init fun');
        this.initConfigParam();
        this.initFingerTempFormat();
        this.initLanguage();
        this.startBusiness();
    }

    initConfigParam() {
        this.APP_LANG = this.localStorages.get('APP_LANG');
        this.LOCATION_DEVICE_ID = this.localStorages.get('LOCATION_DEVICE_ID');
        this.DEVICE_LIGHT_CODE_OCR_READER = this.localStorages.get('DEVICE_LIGHT_CODE_OCR_READER');
        this.DEVICE_LIGHT_CODE_IC_READER = this.localStorages.get('DEVICE_LIGHT_CODE_IC_READER');
        this.DEVICE_LIGHT_CODE_PRINTER = this.localStorages.get('DEVICE_LIGHT_CODE_PRINTER');
        this.DEVICE_LIGHT_CODE_FINGERPRINT = this.localStorages.get('DEVICE_LIGHT_CODE_FINGERPRINT');
        this.DEVICE_LIGHT_ALERT_BAR_BLUE_CODE = this.localStorages.get('DEVICE_LIGHT_ALERT_BAR_BLUE_CODE');
        this.DEVICE_LIGHT_ALERT_BAR_GREEN_CODE = this.localStorages.get('DEVICE_LIGHT_ALERT_BAR_GREEN_CODE');
        this.DEVICE_LIGHT_ALERT_BAR_RED_CODE = this.localStorages.get('DEVICE_LIGHT_ALERT_BAR_RED_CODE');

        this.FP_TMPL_FORMAT_CARD_TYPE_1 = this.localStorages.get('FP_TMPL_FORMAT_CARD_TYPE_1');
        this.FP_TMPL_FORMAT_CARD_TYPE_2 = this.localStorages.get('FP_TMPL_FORMAT_CARD_TYPE_2');

        this.ACTION_TYPE_IC_READING_INFO = this.localStorages.get('ACTION_TYPE_IC_READING_INFO');
        this.ACTION_TYPE_IC_CLOSECARD = this.localStorages.get('ACTION_TYPE_IC_CLOSECARD');
        this.ACTION_TYPE_IC_RETURN_CARD = this.localStorages.get('ACTION_TYPE_IC_RETURN_CARD');
        this.ACTION_TYPE_OCR_READING_INFO = this.localStorages.get('ACTION_TYPE_OCR_READING_INFO');
        this.ACTION_TYPE_OCR_CLOSECARD = this.localStorages.get('ACTION_TYPE_OCR_CLOSECARD');
        this.ACTION_TYPE_OCR_COLLECT_CARD = this.localStorages.get('ACTION_TYPE_OCR_COLLECT_CARD');
        this.ACTION_TYPE_FINGER_NUMBER = this.localStorages.get('ACTION_TYPE_FINGER_NUMBER');

        this.PAGE_PROCESSING_ABORT_QUIT_ITEMOUT = Number.parseInt(this.localStorages.get('PAGE_PROCESSING_ABORT_QUIT_ITEMOUT'));
        this.PAGE_PROCESSING_RETURN_CARD_ITEMOUT = Number.parseInt(this.localStorages.get('PAGE_PROCESSING_RETURN_CARD_ITEMOUT'));
        this.PAGE_PROCESSING_TIME_EXPIRE_ITEMOUT = Number.parseInt(this.localStorages.get('PAGE_PROCESSING_TIME_EXPIRE_ITEMOUT'));

        this.cardType = Number.parseInt(this.localStorages.get('cardType'));
        this.readType = Number.parseInt(this.localStorages.get('readType'));
    }

    initFingerTempFormat() {
        this.PAGE_FINGERPRINT_FP_TMPL_FORMAT = this.FP_TMPL_FORMAT_CARD_TYPE_2;
        if (this.cardType === 1) {
            this.PAGE_FINGERPRINT_FP_TMPL_FORMAT = this.FP_TMPL_FORMAT_CARD_TYPE_1;
        }
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
        this.isShowCollect = true;
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
        // this.handleFingerNumber(this.fp_tmpl1_in_base64, this.fp_tmpl2_in_base64);
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
        this.localStorages.set('carddataJson', this.carddataJson);
        this.localStorages.set('APP_LANG', this.translate.currentLang);

        // this.localStorages.set('cardType', '2');
        // this.localStorages.set('readType', '2');
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
        this.commonService.doLightOff(this.DEVICE_LIGHT_CODE_OCR_READER);
        this.commonService.doLightOff(this.DEVICE_LIGHT_CODE_IC_READER);
        this.commonService.doLightOff(this.DEVICE_LIGHT_ALERT_BAR_BLUE_CODE);
        this.commonService.doLightOff(this.DEVICE_LIGHT_ALERT_BAR_GREEN_CODE);
        this.commonService.doLightOff(this.DEVICE_LIGHT_ALERT_BAR_RED_CODE);
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
            'fp_tmpl_format': this.PAGE_FINGERPRINT_FP_TMPL_FORMAT,
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
                if ($.isEmptyObject(this.fp_tmpl1_in_base64) && $.isEmptyObject(this.fp_tmpl2_in_base64)) {
                    this.messageFail = 'SCN-GEN-STEPS.PROCESS_SCREEN_S14';
                    this.commonService.loggerExcp(this.ACTION_TYPE_IC_READING_INFO, this.LOCATION_DEVICE_ID, 'GENERR043', '', this.hkic_number_view, 'readhkicv1 exception');
                    if (this.isAbort || this.timeOutPause) {
                        return;
                    }
                    this.processModalFailShow();
                } else {
                    this.carddataJson = JSON.stringify(this.carddata);
                    this.initHKICNumber();
                    this.commonService.loggerTrans(this.ACTION_TYPE_OCR_READING_INFO, this.LOCATION_DEVICE_ID, 'S', '', this.hkic_number_view, 'call readhkicv2');
                    this.handleFingerNumber(this.fp_tmpl1_in_base64, this.fp_tmpl2_in_base64);
                }

            } else {
                this.commonService.loggerExcp(this.ACTION_TYPE_OCR_READING_INFO, this.LOCATION_DEVICE_ID, 'GENERR044', '', this.hkic_number_view, 'readhkicv2 exception');
                this.messageFail = 'SCN-GEN-STEPS.PROCESS_SCREEN_S14';
                if (this.isAbort || this.timeOutPause) {
                    return;
                }
                this.processModalFailShow();
            }
        }, (error) => {
            console.log('readhkicv2 ERROR ' + error);
            this.commonService.loggerExcp(this.ACTION_TYPE_OCR_READING_INFO, this.LOCATION_DEVICE_ID, 'GENERR044', '', this.hkic_number_view, 'readhkicv2 exception');
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
                this.fp_tmpl1_in_base64 = resp.fingerprint0;
                this.fp_tmpl2_in_base64 = resp.fingerprint1;
                if ($.isEmptyObject(this.fp_tmpl1_in_base64) && $.isEmptyObject(this.fp_tmpl2_in_base64)) {
                    this.messageFail = 'SCN-GEN-STEPS.PROCESS_SCREEN_S14';
                    this.commonService.loggerExcp(this.ACTION_TYPE_IC_READING_INFO, this.LOCATION_DEVICE_ID, 'GENERR043', '', this.hkic_number_view, 'readhkicv1 exception');
                    if (this.isAbort || this.timeOutPause) {
                        return;
                    }
                    this.processModalFailShow();
                } else {
                    this.carddataJson = JSON.stringify(this.carddata);
                    this.initHKICNumber();
                    this.commonService.loggerTrans(this.ACTION_TYPE_IC_READING_INFO, this.LOCATION_DEVICE_ID, 'S', '', this.hkic_number_view, 'call readhkicv1');
                    this.handleFingerNumber(this.fp_tmpl1_in_base64, this.fp_tmpl2_in_base64);
                }
            } else {
                this.messageFail = 'SCN-GEN-STEPS.PROCESS_SCREEN_S14';
                this.commonService.loggerExcp(this.ACTION_TYPE_IC_READING_INFO, this.LOCATION_DEVICE_ID, 'GENERR043', '', this.hkic_number_view, 'readhkicv1 exception');
                if (this.isAbort || this.timeOutPause) {
                    return;
                }
                this.processModalFailShow();
            }
        }, (error) => {
            console.log('readhkicv1 ERROR ' + error);
            this.commonService.loggerExcp(this.ACTION_TYPE_IC_READING_INFO, this.LOCATION_DEVICE_ID, 'GENERR043', '', this.hkic_number_view, 'readhkicv1 exception');
            this.messageFail = 'SCN-GEN-STEPS.PROCESS_SCREEN_S14';
            if (this.isAbort || this.timeOutPause) {
                return;
            }
            this.processModalFailShow();
        });
    }
// ====================================================== Old Reader End ================================================================

    initHKICNumber() {
        if (this.cardType === 1) {
            const icno = this.carddata.icno;
            const lengthNum = icno.length;
            const icon_format = icno.substring(0, lengthNum);
            const last_str = icno.substring(lengthNum - 1, lengthNum - 1);
            this.hkic_number_view = icon_format + '(' + last_str + ')';
        } else {
            this.hkic_number_view = this.carddata.hkic_number;
        }
    }

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
        this.commonService.doLightOn(this.DEVICE_LIGHT_ALERT_BAR_RED_CODE);
        this.commonService.doFlashLight(this.DEVICE_LIGHT_ALERT_BAR_RED_CODE);
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
            this.commonService.doLightOff(this.DEVICE_LIGHT_CODE_OCR_READER);
        }, this.PAGE_PROCESSING_ABORT_QUIT_ITEMOUT);
    }
    doCloseCard() {
        // this.processing.show();
        this.isShowCollect = false;
        this.service.sendRequestWithLog(CHANNEL_ID_RR_CARDREADER, 'closecard').subscribe((resp) => {
            if (this.readType === 1) {
                this.doReturnDoc();
                setTimeout(() => {
                    this.backRoute();
                }, this.PAGE_PROCESSING_RETURN_CARD_ITEMOUT);
            } else {
              // this.modalCollectShow();
                this.commonService.doFlashLight(this.DEVICE_LIGHT_CODE_OCR_READER);
                setTimeout(() => {
                    this.backRoute();
                }, this.PAGE_PROCESSING_RETURN_CARD_ITEMOUT);
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
            this.commonService.doLightOff(this.DEVICE_LIGHT_CODE_IC_READER);
        });
    }
}
