import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import {PRIV_POL_LBL, HAVE_READ_EN, HAVE_READ_CN, INI_URL} from '../../../shared/var-setting';
import {MsksService} from '../../../shared/msks';
import {CommonService} from '../../../shared/services/common-service/common.service';
import {ConfirmComponent} from '../../../shared/sc2-confirm';
import {ProcessingComponent} from '../../../shared/processing-component';
import {LocalStorageService} from '../../../shared/services/common-service/Local-storage.service';
import {HttpClient} from '../../../../../node_modules/@angular/common/http';
import {TimerComponent} from '../../../shared/sc2-timer';
@Component({
    styleUrls: ['./step-privacy.component.scss'],
    templateUrl: './step-privacy.component.html'
})
export class StepPrivacyComponent implements OnInit {

    @ViewChild('modalFail')
    public modalFail: ConfirmComponent;

    @ViewChild('modalQuit')
    public modalQuit: ConfirmComponent;

    @ViewChild('modalTimeout')
    public modalTimeout: ConfirmComponent;

    @ViewChild('timer')
    public timer: TimerComponent;

    @ViewChild('processing')
    public processing: ProcessingComponent;

    messageFail = 'SCN-GEN-STEPS.RE-SCANER-MAX';
    messageAbort = 'SCN-GEN-STEPS.ABORT_CONFIRM';
    messageTimeout = 'SCN-GEN-STEPS.MESSAGE-TIMEOUT';
    showCheckBox = false;
    enableButton = false;
    isAbort = false;
    isRestore = false;
    isChecked = false;
    isShow = false;
    checkBox: string;
    imgChkbox = require('../../../../assets/images/checkbox.png');
    showScrollUp = false;
    showScrollDown = true;
    timer1: any;
    timeOutPause = false;

    lblPRIV_POL_LBL = PRIV_POL_LBL;
    lblHAVE_READ_EN = HAVE_READ_EN;
    lblHAVE_READ_CN = HAVE_READ_CN;
    PAGE_PRIVACY_QUIT_ITEMOUT = 5000;
    APP_LANG = 'en-US';
    IS_DEFAULT_LANG = 0;

    @ViewChild('policyBox')
    private policyBox: ElementRef;
    private highestScroll = 0;
    private prevDeltaY = 0;

    constructor(private router: Router,
                private commonService: CommonService,
                private route: ActivatedRoute,
                private service: MsksService,
                private httpClient: HttpClient,
                private localStorages: LocalStorageService,
                private translate: TranslateService) { }

    ngOnInit() {
        this.initConfigParam();
    }

    /**
     * init Batch Save to local storage.
     */
    initConfigParam() {
        this.quitDisabledAll();
        this.processing.show();
        this.isShow = true;
        this.httpClient.get(INI_URL).subscribe(data => {
            this.localStorages.set('LOCATION_IP', data['LOCATION_IP']);
            this.localStorages.set('LOCATION_PORT', data['LOCATION_PORT']);
            this.localStorages.set('UPDATE_LOS_COS_WEBSERVICE_IP', data['UPDATE_LOS_COS_WEBSERVICE_IP']);
            this.localStorages.set('UPDATE_LOL_COS_WEBSERVICE_PORT', data['UPDATE_LOL_COS_WEBSERVICE_PORT']);
            this.localStorages.set('TERMINAL_ID', data['TERMINAL_ID']);
            this.localStorages.set('LOCATION_DEVICE_ID', data['LOCATION_DEVICE_ID']);
            this.localStorages.set('DEVICE_OCR_READER_NAME', data['DEVICE_OCR_READER_NAME']);
            this.localStorages.set('DEVICE_OCR_READER_CODE', data['DEVICE_OCR_READER_CODE']);
            this.localStorages.set('DEVICE_EXISTING_IC_READER_NAME', data['DEVICE_EXISTING_IC_READER_NAME']);
            this.localStorages.set('DEVICE_EXISTING_IC_READER_CODE', data['DEVICE_EXISTING_IC_READER_CODE']);
            this.localStorages.set('DEVICE_SLIP_PRINTER_NAME', data['DEVICE_SLIP_PRINTER_NAME']);
            this.localStorages.set('DEVICE_SLIP_PRINTER_CODE', data['DEVICE_SLIP_PRINTER_CODE']);
            this.localStorages.set('DEVICE_FINGERPRINT_SCANNER_NAME', data['DEVICE_FINGERPRINT_SCANNER_NAME']);
            this.localStorages.set('DEVICE_FINGERPRINT_SCANNER_CODE', data['DEVICE_FINGERPRINT_SCANNER_CODE']);
            this.localStorages.set('DEVICE_LIGHT_CODE_OCR_READER', data['DEVICE_LIGHT_CODE_OCR_READER']);
            this.localStorages.set('DEVICE_LIGHT_CODE_IC_READER', data['DEVICE_LIGHT_CODE_IC_READER']);
            this.localStorages.set('DEVICE_LIGHT_CODE_PRINTER', data['DEVICE_LIGHT_CODE_PRINTER']);
            this.localStorages.set('DEVICE_LIGHT_CODE_FINGERPRINT', data['DEVICE_LIGHT_CODE_FINGERPRINT']);

            this.localStorages.set('FP_TMPL_FORMAT_CARD_TYPE_1', data['FP_TMPL_FORMAT_CARD_TYPE_1']);
            this.localStorages.set('FP_TMPL_FORMAT_CARD_TYPE_2', data['FP_TMPL_FORMAT_CARD_TYPE_2']);
            this.localStorages.set('FP_MATCH_SCORE_CARD_TYPE_1', data['FP_MATCH_SCORE_CARD_TYPE_1']);
            this.localStorages.set('FP_MATCH_SCORE_CARD_TYPE_2', data['FP_MATCH_SCORE_CARD_TYPE_2']);

            this.localStorages.set('ACTION_TYPE_IC_OPENGATE', data['ACTION_TYPE_IC_OPENGATE']);
            this.localStorages.set('ACTION_TYPE_IC_INSERT', data['ACTION_TYPE_IC_INSERT']);
            this.localStorages.set('ACTION_TYPE_IC_OPENCARD', data['ACTION_TYPE_IC_OPENCARD']);
            this.localStorages.set('ACTION_TYPE_IC_READING_INFO', data['ACTION_TYPE_IC_READING_INFO']);
            this.localStorages.set('ACTION_TYPE_IC_CLOSECARD', data['ACTION_TYPE_IC_CLOSECARD']);
            this.localStorages.set('ACTION_TYPE_IC_RETURN_CARD', data['ACTION_TYPE_IC_RETURN_CARD']);
            this.localStorages.set('ACTION_TYPE_OCR_INSERT', data['ACTION_TYPE_OCR_INSERT']);
            this.localStorages.set('ACTION_TYPE_OCR_OPENCARD', data['ACTION_TYPE_OCR_OPENCARD']);
            this.localStorages.set('ACTION_TYPE_OCR_READING_INFO', data['ACTION_TYPE_OCR_READING_INFO']);
            this.localStorages.set('ACTION_TYPE_OCR_CLOSECARD', data['ACTION_TYPE_OCR_CLOSECARD']);
            this.localStorages.set('ACTION_TYPE_OCR_COLLECT_CARD', data['ACTION_TYPE_OCR_COLLECT_CARD']);
            this.localStorages.set('ACTION_TYPE_FINGER_NUMBER', data['ACTION_TYPE_FINGER_NUMBER']);
            this.localStorages.set('ACTION_TYPE_FINGER_SCAN', data['ACTION_TYPE_FINGER_SCAN']);
            this.localStorages.set('ACTION_TYPE_VERIFICATION', data['ACTION_TYPE_VERIFICATION']);
            this.localStorages.set('ACTION_TYPE_QUERY_COS_LOS', data['ACTION_TYPE_QUERY_COS_LOS']);
            this.localStorages.set('ACTION_TYPE_UPDATE_COS_LOS', data['ACTION_TYPE_UPDATE_COS_LOS']);

            this.localStorages.set('IS_DEFAULT_LANG', data['IS_DEFAULT_LANG']);

            this.localStorages.set('PAGE_PRIVACY_QUIT_ITEMOUT', data['PAGE_PRIVACY_QUIT_ITEMOUT']);
            this.localStorages.set('PAGE_READ_OPENGATE_TIMEOUT_PAYLOAD', data['PAGE_READ_OPENGATE_TIMEOUT_PAYLOAD']);
            this.localStorages.set('PAGE_READ_CLOSE_CARD_ITMEOUT_OCR', data['PAGE_READ_CLOSE_CARD_ITMEOUT_OCR']);
            this.localStorages.set('PAGE_READ_CLOSE_CARD_TIMEOUT_IC', data['PAGE_READ_CLOSE_CARD_TIMEOUT_IC']);
            this.localStorages.set('PAGE_READ_RETRY_READER_1_MAX', data['PAGE_READ_RETRY_READER_1_MAX']);
            this.localStorages.set('PAGE_READ_RETRY_READER_2_MAX', data['PAGE_READ_RETRY_READER_2_MAX']);
            this.localStorages.set('PAGE_READ_RETURN_CARD_TIMEOUT_PAYLOAD_BY_RETRY', data['PAGE_READ_RETURN_CARD_TIMEOUT_PAYLOAD_BY_RETRY']);
            this.localStorages.set('PAGE_READ_RETURN_CARD_TIMEOUT_PAYLOAD_BY_OCR', data['PAGE_READ_RETURN_CARD_TIMEOUT_PAYLOAD_BY_OCR']);
            this.localStorages.set('PAGE_READ_TIME_EXPIRE_ITEMOUT', data['PAGE_READ_TIME_EXPIRE_ITEMOUT']);
            this.localStorages.set('PAGE_READ_ABORT_QUIT_ITEMOUT', data['PAGE_READ_ABORT_QUIT_ITEMOUT']);
            this.localStorages.set('PAGE_READ_RETURN_CARD_ITEMOUT', data['PAGE_READ_RETURN_CARD_ITEMOUT']);

            this.localStorages.set('PAGE_PROCESSING_ABORT_QUIT_ITEMOUT', data['PAGE_PROCESSING_ABORT_QUIT_ITEMOUT']);
            this.localStorages.set('PAGE_PROCESSING_RETURN_CARD_ITEMOUT', data['PAGE_PROCESSING_RETURN_CARD_ITEMOUT']);
            this.localStorages.set('PAGE_PROCESSING_TIME_EXPIRE_ITEMOUT', data['PAGE_PROCESSING_TIME_EXPIRE_ITEMOUT']);

            this.localStorages.set('PAGE_FINGERPRINT_ABORT_QUIT_ITEMOUT', data['PAGE_FINGERPRINT_ABORT_QUIT_ITEMOUT']);
            this.localStorages.set('PAGE_FINGERPRINT_RETURN_CARD_ITEMOUT', data['PAGE_FINGERPRINT_RETURN_CARD_ITEMOUT']);
            this.localStorages.set('PAGE_FINGERPRINT_TIME_EXPIRE_ITEMOUT', data['PAGE_FINGERPRINT_TIME_EXPIRE_ITEMOUT']);
            this.localStorages.set('PAGE_FINGERPRINT_SCAN_ITEMOUT_PAYLOAD', data['PAGE_FINGERPRINT_SCAN_ITEMOUT_PAYLOAD']);
            this.localStorages.set('PAGE_FINGERPRINT_MATCH_SCORE', data['PAGE_FINGERPRINT_MATCH_SCORE']);
            this.localStorages.set('PAGE_FINGERPRINT_SCAN_MAX', data['PAGE_FINGERPRINT_SCAN_MAX']);
            this.localStorages.set('PAGE_FINGERPRINT_IS_VALIDATION', data['PAGE_FINGERPRINT_IS_VALIDATION']);
            this.localStorages.set('PAGE_FINGERPRINT_FP_TMPL_FORMAT', data['PAGE_FINGERPRINT_FP_TMPL_FORMAT']);

            this.localStorages.set('PAGE_UPDATE_ABORT_QUIT_ITEMOUT', data['PAGE_UPDATE_ABORT_QUIT_ITEMOUT']);
            this.localStorages.set('PAGE_UPDATE_RETURN_CARD_ITEMOUT', data['PAGE_UPDATE_RETURN_CARD_ITEMOUT']);
            this.localStorages.set('PAGE_UPDATE_TIME_EXPIRE_ITEMOUT', data['PAGE_UPDATE_TIME_EXPIRE_ITEMOUT']);
            this.localStorages.set('PAGE_UPDATE_WEBSERVICE_ITEMOUT', data['PAGE_UPDATE_WEBSERVICE_ITEMOUT']);

            this.localStorages.set('PAGE_VIEW_ABORT_QUIT_ITEMOUT', data['PAGE_VIEW_ABORT_QUIT_ITEMOUT']);
            this.localStorages.set('PAGE_VIEW_RETURN_CARD_ITEMOUT', data['PAGE_VIEW_RETURN_CARD_ITEMOUT']);
            this.localStorages.set('PAGE_VIEW_TIME_EXPIRE_ITEMOUT', data['PAGE_VIEW_TIME_EXPIRE_ITEMOUT']);

            this.localStorages.set('PAGE_COLLECT_ABORT_QUIT_ITEMOUT', data['PAGE_COLLECT_ABORT_QUIT_ITEMOUT']);
            this.localStorages.set('PAGE_COLLECT_RETURN_CARD_ITEMOUT', data['PAGE_COLLECT_RETURN_CARD_ITEMOUT']);
            this.localStorages.set('PAGE_COLLECT_TIME_EXPIRE_ITEMOUT', data['PAGE_COLLECT_TIME_EXPIRE_ITEMOUT']);

            this.PAGE_PRIVACY_QUIT_ITEMOUT = Number.parseInt(this.localStorages.get('PAGE_PRIVACY_QUIT_ITEMOUT'));

            this.APP_LANG = this.localStorages.get('APP_LANG');
            if (this.commonService.checkFpNull(this.APP_LANG)) {
                this.IS_DEFAULT_LANG = Number.parseInt(this.localStorages.get('IS_DEFAULT_LANG'));
                if (this.IS_DEFAULT_LANG === 1) {
                    this.localStorages.set('APP_LANG', data['APP_LANG']);
                    this.APP_LANG = this.localStorages.get('APP_LANG');
                } else {
                    this.APP_LANG = 'en-US'
                }
            }
            this.processing.hide();
            this.isShow = false;
            this.cancelQuitEnabledAll();
            this.initLanguage();
        }, (err) => {
            this.messageFail = 'SCN-GEN-STEPS.INIT_CONFIG_PARAM_ERROR';
            this.processing.hide();
            this.isShow = false;
            if (this.isAbort || this.timeOutPause) {
                return;
            }
            this.processModalFailShow();
        });
    }

    /**
     *  init param.
     */

    initLanguage() {
        if ('en-US' === this.APP_LANG) {
            this.translate.use('en-US');
        } else {
            this.translate.use('zh-HK');
        }
        this.translate.currentLang = this.APP_LANG;
        this.showCheckBox = true;
    }

    nextRoute() {
        this.storeConfigParam();
        // 修改調整
        this.router.navigate(['/kgen-viewcard/insertcard']);
        // this.router.navigate(['/kgen-viewcard/processing']);
        return;
    }

    storeConfigParam() {
        this.localStorages.set('APP_LANG', this.translate.currentLang);
    }

    onPanStart() {
        this.prevDeltaY = 0;
    }

    onPanDown(deltaY: number) {
        const maxDeltaY = Math.max(deltaY, this.prevDeltaY);
        const scrollDelta = Math.abs(Math.abs(deltaY) - Math.abs(this.prevDeltaY));
        if (maxDeltaY === deltaY) {
            this.adjustScroll(-scrollDelta);
        } else {
            this.adjustScroll(scrollDelta);
        }
        this.prevDeltaY = deltaY;
    }

    onPanUp(deltaY: number) {
        const minDeltaY = Math.min(deltaY, this.prevDeltaY);
        const scrollDelta = Math.abs(Math.abs(deltaY) - Math.abs(this.prevDeltaY));
        if (minDeltaY === deltaY) {
            this.adjustScroll(scrollDelta);
        } else {
            this.adjustScroll(-scrollDelta);
        }
        this.prevDeltaY = deltaY;
    }

    onScroll(event: any) {
        const currScroll = event.target.scrollTop;
        const scrollHeight = event.target.scrollHeight;
        const clientHeight = event.target.clientHeight;
        this.showScrollUp = true;
        this.showScrollDown = true;
        if ((scrollHeight - clientHeight) <= currScroll) {
            this.showCheckBox = true;
            this.showScrollDown = false;
        } else if (currScroll === 0) {
            this.showScrollUp = false;
        }

    }

    checked(event: any) {
        if (!this.isChecked) {
            this.isChecked = true;
            this.imgChkbox = require('../../../../assets/images/checkbox_tick.png');
            this.enableButton = true;
        } else {
            this.isChecked = false;
            this.imgChkbox = require('../../../../assets/images/checkbox.png');
            this.enableButton = false;
        }
    }

    mouseDown(value: number) {
        this.adjustScroll(value);
        this.timer1 = setInterval(() => {
            this.adjustScroll(value);
        }, 50);
    }

    adjustScroll(value: number) {
        if (value > 0 && this.showScrollDown === true) {
            this.policyBox.nativeElement.scrollTop += value;
        } else if (value < 0 && this.showScrollUp === true) {
            this.policyBox.nativeElement.scrollTop += value;
        } else {
            this.stopHold();
        }
    }

    stopHold() {
        clearInterval(this.timer1);
    }

    backRoute() {
        this.commonService.doCloseWindow();
    }

    timeExpire() {
        this.timer.showTimer = false;
        this.timeOutPause = true;
        if (this.processing.visible) {
            this.processing.hide();
            this.isShow = false;
        }
        if (this.modalQuit.visible) {
            this.modalQuit.hide();
        }
        this.messageTimeout = 'SCN-GEN-STEPS.MESSAGE-TIMEOUT';
        this.modalTimeout.show();
        this.quitDisabledAll();
        setTimeout(() => {
            this.processTimeoutQuit();
        }, this.PAGE_PRIVACY_QUIT_ITEMOUT);
    }

    processTimeoutQuit() {
        this.modalTimeout.hide();
        this.backRoute();
    }

    processModalFailShow() {
        this.quitDisabledAll();
        this.isAbort = true;
        this.modalFail.show();
    }

    processFailQuit() {
        this.modalFail.hide();
        this.backRoute();

    }

    quitDisabledAll() {
        $('#exitBtn').attr('disabled', 'false');
        $('#nextBtn').attr('disabled', 'false');
        $('#checkedBoxBtn').attr('disabled', 'false');
        $('#scrollUpBtn').attr('disabled', 'false');
        $('#scrollDownBtn').attr('disabled', 'false');
        $('#langBtn').attr('disabled', 'false');

    }
    cancelQuitEnabledAll() {
        $('#exitBtn').removeAttr('disabled');
        $('#nextBtn').removeAttr('disabled');
        $('#checkedBoxBtn').removeAttr('disabled');
        $('#scrollUpBtn').removeAttr('disabled');
        $('#scrollDownBtn').removeAttr('disabled');
        $('#langBtn').removeAttr('disabled');
    }

    processModalQuitShow() {
        this.modalQuit.show()
        this.isAbort = true;
        this.quitDisabledAll();
        if (this.processing.visible) {
            this.isRestore = true;
            this.processing.hide();
            this.isShow = false;
        }
    }

    processConfirmQuit() {
        this.modalQuit.hide();
        if (this.processing.visible) {
            this.processing.hide();
            this.isShow = false;
        }
        this.isAbort = true;
        this.backRoute();

    }
    processCancelQuit() {
        this.modalQuit.hide();
        this.isAbort = false;
        this.cancelQuitEnabledAll();
        if (this.isRestore) {
            this.processing.show();
            this.isShow = true;
        }
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
