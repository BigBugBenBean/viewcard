import {Component,  OnInit, ViewChild} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MsksService } from '../../../shared/msks';
import {CHANNEL_ID_RR_CARDREADER, CHANNEL_ID_RR_ICCOLLECT, INI_URL} from '../../../shared/var-setting';
import { ConfirmComponent } from '../../../shared/sc2-confirm';
import { LocalStorageService } from '../../../shared/services/common-service/Local-storage.service';
import {CommonService} from '../../../shared/services/common-service/common.service';
import {ProcessingComponent} from '../../../shared/processing-component';
import {TimerComponent} from '../../../shared/sc2-timer';
import {HttpClient} from '@angular/common/http';

@Component({
    templateUrl: './step-insertcard.component.html',
    styleUrls: ['./step-insertcard.component.scss']
})
export class StepInsertcardComponent implements OnInit {

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

    @ViewChild('modal1Comfirm')
    public modal1Comfirm: ConfirmComponent;

    @ViewChild('modalRetryOpenGate')
    public modalRetryOpenGate: ConfirmComponent;

    @ViewChild('modalRetryOpenCard')
    public modalRetryOpenCard: ConfirmComponent;

    @ViewChild('modalRetryOCR')
    public modalRetryOCR: ConfirmComponent;

    @ViewChild('processing')
    public processing: ProcessingComponent;

    @ViewChild('timer')
    public timer: TimerComponent;

    @ViewChild('modalPrompt')
    public modalPrompt: ConfirmComponent;

    messageRetry = 'SCN-GEN-STEPS.RE-SCANER-FINGER';
    messageTimeout = 'SCN-GEN-STEPS.MESSAGE-TIMEOUT';
    messageFail = 'SCN-GEN-STEPS.RE-SCANER-MAX';
    messageAbort = 'SCN-GEN-STEPS.ABORT_CONFIRM';
    messageCollect = 'SCN-GEN-STEPS.COLLECT-CARD-SURE';

    messageComfirm = '';

    messagePrompt = '';
    cardType = 1;
    readType = 1;
    newReader_dor = null;
    newReader_icno = null;
    flag = false;
    isAbort = false;
    timeOutPause = false;
    isRestore = false;
    retryReaderVal = 0;
    retryReader1Val = 0;
    retryReader2Val = 0;
    showImage = false;
    isShow = false;
    isShowCollect = false;
    isProcessing = false;
    isExit = true;
    APP_LANG = 'zh-HK';
    DEFAULT_LANG = '';
    IS_DEFAULT_LANG = 0;

    detectInsertCardDevice = '';

    PAGE_READ_OPENGATE_TIMEOUT_PAYLOAD = 10;
    PAGE_READ_CLOSE_CARD_ITMEOUT_OCR = 2000;
    PAGE_READ_CLOSE_CARD_TIMEOUT_IC = 2000;
    PAGE_READ_RETRY_READER_1_MAX = 3;
    PAGE_READ_RETRY_READER_2_MAX = 3;
    PAGE_READ_RETURN_CARD_TIMEOUT_PAYLOAD_BY_RETRY = 5;
    PAGE_READ_RETURN_CARD_TIMEOUT_PAYLOAD_BY_OCR = 5;
    PAGE_READ_ABORT_QUIT_ITEMOUT = 8000;
    PAGE_READ_RETURN_CARD_ITEMOUT = 8000;
    PAGE_READ_TIME_EXPIRE_ITEMOUT = 8000;
    DEVICE_LIGHT_CODE_OCR_READER = '08';
    DEVICE_LIGHT_CODE_IC_READER = '07';
    DEVICE_LIGHT_CODE_PRINTER = '06';
    DEVICE_LIGHT_CODE_FINGERPRINT = '06';
    DEVICE_LIGHT_ALERT_BAR_BLUE_CODE = '11';
    DEVICE_LIGHT_ALERT_BAR_GREEN_CODE = '12';
    DEVICE_LIGHT_ALERT_BAR_RED_CODE = '13';
    LOCATION_DEVICE_ID = 'K1-SCK-01';

    ACTION_TYPE_IC_OPENGATE = 'GA01';
    ACTION_TYPE_IC_OPENCARD = 'GA02';
    ACTION_TYPE_IC_READING_INFO = 'GA04';
    ACTION_TYPE_IC_CLOSECARD = 'GA12';
    ACTION_TYPE_IC_RETURN_CARD = 'GA11';
    ACTION_TYPE_OCR_INSERT = 'GA06';
    ACTION_TYPE_OCR_OPENCARD = 'GA07';
    ACTION_TYPE_OCR_READING_INFO = 'GA08';
    ACTION_TYPE_OCR_CLOSECARD = 'GA13';
    ACTION_TYPE_FINGER_NUMBER = 'GA0A';
    ACTION_TYPE_FINGER_SCAN = 'GA09';
    ACTION_TYPE_VERIFICATION = 'GA0A';
    ACTION_TYPE_QUERY_COS_LOS = 'GA0B';
    ACTION_TYPE_UPDATE_COS_LOS = 'GA0C';
    ACTION_TYPE_OCR_COLLECT_CARD = 'GA0D';
    ACTION_TYPE_IC_INSERT = 'GA0E';

    constructor(private router: Router,
                private commonService: CommonService,
                private route: ActivatedRoute,
                private service: MsksService,
                private httpClient: HttpClient,
                private localStorages: LocalStorageService,
                private translate: TranslateService) { }

    ngOnInit(): void {
        console.log('init fun');
        this.initLanguage();
        this.initGetParam();

    }

// ====================================================== Common Start ====================================================================

    initGetParam() {
        this.quitDisabledAll();
        this.isShowCollect = true;
        this.httpClient.get(INI_URL).subscribe(data => {
            // save to local storate param.
            this.saveLocalStorages(data);
            // init param.
            this.initConfigParam();
            this.cancelQuitEnabledAll();
            this.startBusiness();
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
    saveLocalStorages(data) {
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
        this.localStorages.set('DEVICE_LIGHT_ALERT_BAR_BLUE_CODE', data['DEVICE_LIGHT_ALERT_BAR_BLUE_CODE']);
        this.localStorages.set('DEVICE_LIGHT_ALERT_BAR_GREEN_CODE', data['DEVICE_LIGHT_ALERT_BAR_GREEN_CODE']);
        this.localStorages.set('DEVICE_LIGHT_ALERT_BAR_RED_CODE', data['DEVICE_LIGHT_ALERT_BAR_RED_CODE']);

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
        this.localStorages.set('DEFAULT_LANG', data['APP_LANG']);

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
    }

    initConfigParam() {
        this.APP_LANG = this.localStorages.get('APP_LANG');
        this.DEFAULT_LANG = this.localStorages.get('DEFAULT_LANG');
        this.IS_DEFAULT_LANG = Number.parseInt(this.localStorages.get('IS_DEFAULT_LANG'));

        this.LOCATION_DEVICE_ID = this.localStorages.get('LOCATION_DEVICE_ID');
        this.DEVICE_LIGHT_CODE_OCR_READER = this.localStorages.get('DEVICE_LIGHT_CODE_OCR_READER');
        this.DEVICE_LIGHT_CODE_IC_READER = this.localStorages.get('DEVICE_LIGHT_CODE_IC_READER');
        this.DEVICE_LIGHT_CODE_PRINTER = this.localStorages.get('DEVICE_LIGHT_CODE_PRINTER');
        this.DEVICE_LIGHT_ALERT_BAR_BLUE_CODE = this.localStorages.get('DEVICE_LIGHT_ALERT_BAR_BLUE_CODE');
        this.DEVICE_LIGHT_ALERT_BAR_GREEN_CODE = this.localStorages.get('DEVICE_LIGHT_ALERT_BAR_GREEN_CODE');
        this.DEVICE_LIGHT_ALERT_BAR_RED_CODE = this.localStorages.get('DEVICE_LIGHT_ALERT_BAR_RED_CODE');

        this.ACTION_TYPE_IC_OPENGATE = this.localStorages.get('ACTION_TYPE_IC_OPENGATE');
        this.ACTION_TYPE_IC_INSERT = this.localStorages.get('ACTION_TYPE_IC_INSERT');
        this.ACTION_TYPE_IC_OPENCARD = this.localStorages.get('ACTION_TYPE_IC_OPENCARD');
        this.ACTION_TYPE_IC_READING_INFO = this.localStorages.get('ACTION_TYPE_IC_READING_INFO');
        this.ACTION_TYPE_IC_CLOSECARD = this.localStorages.get('ACTION_TYPE_IC_CLOSECARD');
        this.ACTION_TYPE_IC_RETURN_CARD = this.localStorages.get('ACTION_TYPE_IC_RETURN_CARD');
        this.ACTION_TYPE_OCR_INSERT = this.localStorages.get('ACTION_TYPE_OCR_INSERT');
        this.ACTION_TYPE_OCR_OPENCARD = this.localStorages.get('ACTION_TYPE_OCR_OPENCARD');
        this.ACTION_TYPE_OCR_READING_INFO = this.localStorages.get('ACTION_TYPE_OCR_READING_INFO');
        this.ACTION_TYPE_OCR_CLOSECARD = this.localStorages.get('ACTION_TYPE_OCR_CLOSECARD');
        this.ACTION_TYPE_OCR_COLLECT_CARD = this.localStorages.get('ACTION_TYPE_OCR_COLLECT_CARD');

        this.PAGE_READ_OPENGATE_TIMEOUT_PAYLOAD = Number.parseInt(this.localStorages.get('PAGE_READ_OPENGATE_TIMEOUT_PAYLOAD'));
        this.PAGE_READ_CLOSE_CARD_ITMEOUT_OCR = Number.parseInt(this.localStorages.get('PAGE_READ_CLOSE_CARD_ITMEOUT_OCR'));
        this.PAGE_READ_CLOSE_CARD_TIMEOUT_IC = Number.parseInt(this.localStorages.get('PAGE_READ_CLOSE_CARD_TIMEOUT_IC'));
        this.PAGE_READ_RETRY_READER_1_MAX = Number.parseInt(this.localStorages.get('PAGE_READ_RETRY_READER_1_MAX'));
        this.PAGE_READ_RETRY_READER_2_MAX = Number.parseInt(this.localStorages.get('PAGE_READ_RETRY_READER_2_MAX'));

        this.PAGE_READ_RETURN_CARD_TIMEOUT_PAYLOAD_BY_RETRY = Number.parseInt(
            this.localStorages.get('PAGE_READ_RETURN_CARD_TIMEOUT_PAYLOAD_BY_RETRY'));
        this.PAGE_READ_RETURN_CARD_TIMEOUT_PAYLOAD_BY_OCR = Number.parseInt(
            this.localStorages.get('PAGE_READ_RETURN_CARD_TIMEOUT_PAYLOAD_BY_OCR'));
        this.PAGE_READ_ABORT_QUIT_ITEMOUT = Number.parseInt(this.localStorages.get('PAGE_READ_ABORT_QUIT_ITEMOUT'));
        this.PAGE_READ_RETURN_CARD_ITEMOUT = Number.parseInt(this.localStorages.get('PAGE_READ_RETURN_CARD_ITEMOUT'));
        this.PAGE_READ_TIME_EXPIRE_ITEMOUT = Number.parseInt(this.localStorages.get('PAGE_READ_TIME_EXPIRE_ITEMOUT'));
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
        this.commonService.doCloseCard();
        this.commonService.doReturnDoc();
        // this.openGateFun();
        // *****************a later call openGate function *************************************************
        // setTimeout(() => {
        //     console.log('*******start call openGate function *********');
        //     this.openGateFun();
        // }, 1000);

        // this.startInsertCardListener('30');
        this.newFunc('30');

    }

    /**
     * nextPage.
     */
    nextRoute() {
        if (this.timeOutPause || this.isAbort) {
            return;
        }
        this.storeConfigParam();
        this.router.navigate(['/kgen-viewcard/processing']);
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
        if (this.processing.visible) {
            this.processing.hide();
            this.showImage = false;
        }
        if (this.modalRetryOCR.visible) {
            this.modalRetryOCR.hide();
        }
        if (this.modalRetryOpenGate.visible) {
            this.modalRetryOpenGate.hide();
        }
        if (this.modalRetryOpenCard.visible) {
            this.modalRetryOpenCard.hide();
        }
        if (this.modalFail.visible) {
            this.modalFail.hide();
        }
        if (this.modal1Comfirm.visible) {
            this.modal1Comfirm.hide();
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
     * open card gate fun.
     */
    openGateFun() {
        if (this.timeOutPause || this.isAbort) {
            return;
        }
        this.readType = 1;
        this.isExit = false;
        console.log('call openGateFun fun.');
        this.commonService.doFlashLight(this.DEVICE_LIGHT_CODE_IC_READER);

        this.service.sendRequestWithLog(CHANNEL_ID_RR_ICCOLLECT, 'opengate', { 'timeout': this.PAGE_READ_OPENGATE_TIMEOUT_PAYLOAD})
            .subscribe((resp) => {

                if (!$.isEmptyObject(resp)) {
                    if (resp.errorcode === '0') {
                        this.commonService.loggerTrans(this.ACTION_TYPE_IC_OPENGATE, this.LOCATION_DEVICE_ID, 'S', '', this.newReader_icno, 'call takephoto');
                        this.commonService.doLightOff(this.DEVICE_LIGHT_CODE_IC_READER);
                        if (this.timeOutPause || this.isAbort) {
                            return;
                        }
                        this.openCardFun();
                    } else if (resp.errorcode === 'D0009') {
                        this.commonService.loggerExcp(this.ACTION_TYPE_IC_OPENGATE, this.LOCATION_DEVICE_ID, 'GE02', '', this.newReader_icno, 'opengate exception');
                        // S/N3  have card in reader.
                        this.messageFail = 'SCN-GEN-STEPS.INSERT_CARD_SCREEN_S3';
                        if (this.timeOutPause || this.isAbort) {
                            return;
                        }
                        this.isExit = true;
                        this.processModalFailShow();
                    } else if (resp.errorcode === 'D0006') {
                        setTimeout(() => {
                            this.checkCardExist();
                        }, 1000);
                    } else {
                        // reading fail rereading,try again 3 times
                        this.retryReader1Val += 1;
                        if (this.retryReader1Val < this.PAGE_READ_RETRY_READER_1_MAX) {
                            this.messageRetry = 'SCN-GEN-STEPS.INSERT_CARD_SCREEN_S4';
                            if (this.timeOutPause || this.isAbort) {
                                return;
                            }
                            this.modalRetryOpenGate.show();
                        } else {
                            // S/N4 f the retry limitexcess?
                            this.commonService.loggerExcp(this.ACTION_TYPE_IC_OPENGATE, this.LOCATION_DEVICE_ID, 'GE02', '', this.newReader_icno, 'opengate exception');
                            this.commonService.doLightOff(this.DEVICE_LIGHT_CODE_IC_READER);
                            this.messageComfirm = 'SCN-GEN-STEPS.INSERT_CARD_SCREEN_S6';
                            if (this.timeOutPause || this.isAbort) {
                                return;
                            }
                            this.quitDisabledAll();
                            this.modal1Comfirm.show();
                        }
                    }
                } else {
                    // read card  no success .
                    this.commonService.loggerExcp(this.ACTION_TYPE_IC_OPENGATE, this.LOCATION_DEVICE_ID, 'GE01', '', this.newReader_icno, 'opengate exception');
                    this.messageFail = 'SCN-GEN-STEPS.INSERT_CARD_SCREEN_S2';
                    if (this.timeOutPause || this.isAbort) {
                        return;
                    }
                    this.processModalFailShow();
                }

            }, (error) => {
                this.commonService.loggerExcp(this.ACTION_TYPE_IC_OPENGATE, this.LOCATION_DEVICE_ID, 'GE01', '', this.newReader_icno, 'opengate exception');
                console.log('**********opengate:' + error);
                this.messageFail = 'SCN-GEN-STEPS.INSERT_CARD_SCREEN_S2';
                if (this.timeOutPause || this.isAbort) {
                    return;
                }
                this.processModalFailShow();
            });
    }

    /**
     *  检查是否有卡.
     */
    checkCardExist() {
        this.service.sendRequestWithLog(CHANNEL_ID_RR_ICCOLLECT, 'checkcardexist').subscribe((resp) => {
            if (!$.isEmptyObject(resp)) {
                if (resp.errorcode === '0') {
                    this.retryReaderVal += 1;
                    // 判断OCR的读卡次数是否大于最大次数.
                    if (this.retryReader2Val < this.PAGE_READ_RETRY_READER_2_MAX) {
                        this.commonService.doLightOff(this.DEVICE_LIGHT_CODE_IC_READER);
                        this.processNewReader();
                    } else {
                        // 判断超时最大次数.
                        if (this.retryReaderVal < this.PAGE_READ_RETRY_READER_2_MAX) {
                            this.messageRetry = 'SCN-GEN-STEPS.INSERT_CARD_SCREEN_S4';
                            if (this.timeOutPause || this.isAbort) {
                                return;
                            }
                            this.modalRetryOpenGate.show();
                        } else {
                            // 处理超过最大次数提示.
                            this.commonService.doLightOff(this.DEVICE_LIGHT_CODE_OCR_READER);
                            this.commonService.loggerExcp(this.ACTION_TYPE_OCR_INSERT, this.LOCATION_DEVICE_ID, 'GE02', '', this.newReader_icno, ' checkcardexist');
                            this.messageFail = 'SCN-GEN-STEPS.OCR_READER_SCREEN_S13';
                            if (this.timeOutPause || this.isAbort) {
                                return;
                            }
                            this.processModalFailShow();
                        }
                    }
                } else {
                    this.commonService.loggerTrans(this.ACTION_TYPE_IC_OPENGATE, this.LOCATION_DEVICE_ID, 'S', '', this.newReader_icno, 'call checkcardexist');
                    this.commonService.doLightOff(this.DEVICE_LIGHT_CODE_IC_READER);
                    if (this.timeOutPause || this.isAbort) {
                        return;
                    }
                    this.openCardFun();
                }
            }
        });
    }

    failTryAgainOpengate() {
        this.modalRetryOpenGate.hide();
        this.openGateFun();
    }

    /**
     *  open card fun.
     */
    openCardFun() {
        if (this.timeOutPause || this.isAbort) {
            return;
        }
        console.log('call openCardFun fun.');
        this.isProcessing = true;
        this.processing.show();
        this.showImage = true;
        const payload = {
            'card_reader_id': null,
            'contactless_password': {
                'date_of_registration': null,
                'hkic_no': null
            }
        };
        this.service.sendRequestWithLog(CHANNEL_ID_RR_CARDREADER, 'opencard', payload).subscribe((resp) => {
            if (this.timeOutPause || this.isAbort) {
                return;
            }
            // this.processing.hide();
            // this.showImage = false;
            this.cancelQuitEnabledAll();
            // return result not Empty.
            if (!$.isEmptyObject(resp)) {
                if (resp.result === true) {
                    // turn off light.
                    this.commonService.doLightOff(this.DEVICE_LIGHT_CODE_IC_READER);
                    // get card type,
                    this.cardType = resp.card_version;
                    if (this.timeOutPause || this.isAbort) {
                        return;
                    }
                    this.commonService.loggerTrans(this.ACTION_TYPE_IC_OPENCARD, this.LOCATION_DEVICE_ID, 'S', '', this.newReader_icno, 'call opencard');
                    this.nextRoute();
                } else {
                    // open card failed S/N7
                    this.retryReader1Val += 1;
                    if (this.retryReader1Val < this.PAGE_READ_RETRY_READER_1_MAX) {
                        // Clip reading fail. Please retry
                        if (this.timeOutPause || this.isAbort) {
                            return;
                        }
                        this.messageRetry = 'SCN-GEN-STEPS.INSERT_CARD_SCREEN_S7';
                        setTimeout(() => {
                            this.processing.hide();
                            this.showImage = false;
                            this.isProcessing = false;
                            this.modalRetryOpenCard.show();
                        }, 1000);
                    } else {
                        // Card reading fail. If you are the holder of new HKIC, you can continue the application by presenting your card on the optical character reader. Do you want to continue?
                        this.messageComfirm = 'SCN-GEN-STEPS.INSERT_CARD_SCREEN_S6';
                        this.commonService.doLightOff(this.DEVICE_LIGHT_CODE_IC_READER);
                        if (this.timeOutPause || this.isAbort) {
                            return;
                        }

                        setTimeout(() => {
                            this.processing.hide();
                            this.showImage = false;
                            this.isProcessing = false;
                            this.quitDisabledAll();
                            this.modal1Comfirm.show();
                        }, 1000);
                    }
                }
                // return result is Empty.
            } else {
                // Read card fail. Application will be terminated.
                this.messageFail = 'SCN-GEN-STEPS.OCR_READER_SCREEN_S13';
                this.commonService.doLightOff(this.DEVICE_LIGHT_CODE_IC_READER);
                if (this.timeOutPause || this.isAbort) {
                    return;
                }
                this.processModalFailShow();
            }
        }, (error) => {
            this.commonService.loggerExcp(this.ACTION_TYPE_IC_OPENCARD, this.LOCATION_DEVICE_ID, 'GE03', '', this.newReader_icno, 'opengate exception');
            // Read card fail. Application will be terminated.
            this.messageFail = 'SCN-GEN-STEPS.OCR_READER_SCREEN_S13';
            this.commonService.doLightOff(this.DEVICE_LIGHT_CODE_IC_READER);
            if (this.timeOutPause || this.isAbort) {
                return;
            }
            this.processModalFailShow();
        });
    }

    /**
     *  tryagain 3
     */
    failTryAgainOpenCard() {
        this.modalRetryOpenCard.hide();
        // colse  card.
        this.doCloseCardByTryagain();
    }

    /**
     * try again close card.
     */
    doCloseCardByTryagain() {
        if (this.timeOutPause || this.isAbort) {
            return;
        }
        this.service.sendRequestWithLog(CHANNEL_ID_RR_CARDREADER, 'closecard').subscribe((resp) => {
            // return card.
            this.doReturnDocByTryagain();
            setTimeout(() => {
                if (this.timeOutPause || this.isAbort) {
                    return;
                }
                // call opengate fun.
                this.openGateFun();
            }, 500);
        });
    }

    /**
     * try again.returndoc.
     */
    doReturnDocByTryagain() {
        if (this.timeOutPause || this.isAbort) {
            return;
        }
        this.service.sendRequestWithLog(CHANNEL_ID_RR_ICCOLLECT, 'returndoc').subscribe((resp) => {});
    }

// ====================================================== Common End =======================================================================
// ====================================================== New Reader Start =================================================================

    /**
     * 確認開始readOcr.
     */
    comfirmStartOcrFn() {
        // ********************************************開始操作新光學閱讀器*****************************************
        console.log('*************************************開始操作新光學閱讀器*****************************************');
        this.modal1Comfirm.hide();
        this.cancelQuitEnabledAll();
        // closecard
        this.doCloseCardByOcr();

    }

    processAbortQuit() {
        this.isAbort = true;
        this.quitDisabledAll();
        this.modal1Comfirm.hide();
        if (this.processing.visible) {
            this.showImage = false;
            this.processing.hide();
        }
        this.doCloseCard();
    }

    /**
     * closecard
     */
    doCloseCardByOcr() {
        if (this.timeOutPause || this.isAbort) {
            return;
        }
        this.service.sendRequestWithLog(CHANNEL_ID_RR_CARDREADER, 'closecard').subscribe((resp) => {
            this.doReturnDocByOcr();
            setTimeout(() => {
                this.processNewReader();
            }, 1000);
        });
    }

    /**
     * 退卡.
     */
    doReturnDocByOcr() {
        if (this.timeOutPause || this.isAbort) {
            return;
        }
        this.commonService.doFlashLight(this.DEVICE_LIGHT_CODE_IC_READER);
        this.service.sendRequestWithLog(CHANNEL_ID_RR_ICCOLLECT, 'returndoc').subscribe((resp) => {
            this.commonService.doLightOff(this.DEVICE_LIGHT_CODE_IC_READER);
        });
    }

    /**
     *  read new card data.
     */
    processNewReader() {
        if (this.timeOutPause || this.isAbort) {
            return;
        }
        this.isExit = false;
        this.commonService.doFlashLight(this.DEVICE_LIGHT_CODE_OCR_READER);
        this.readType = 2;
        this.readhkicv2ocrdata();
    }
    /**
     *  call readhkicv2ocrdata.
     */
    readhkicv2ocrdata() {
        if (this.timeOutPause || this.isAbort) {
            return;
        }
        console.log('start call readhkicv2ocrdata function');
        const payloadParam = {'ocr_reader_name':  'ARH ComboSmart' };
        this.service.sendRequestWithLog(CHANNEL_ID_RR_CARDREADER, 'readhkicv2ocrdata', payloadParam).subscribe((resp) => {
            if (!$.isEmptyObject(resp) && resp.error_info.error_code === '0') {
                if (resp.ocr_data.length < 1) {
                    this.commonService.doLightOff(this.DEVICE_LIGHT_CODE_OCR_READER);
                    if (this.retryReaderVal < this.PAGE_READ_RETRY_READER_1_MAX) {
                        this.messageRetry = 'SCN-GEN-STEPS.INSERT_CARD_SCREEN_S4';
                        if (this.timeOutPause || this.isAbort) {
                            return;
                        }
                        this.openGateFun();
                        // this.modalRetryOpenGate.show();
                    } else {
                        // S/N4 f the retry limitexcess?
                        this.messageFail = 'SCN-GEN-STEPS.PUT_CARD_TRY_MAX';
                        this.commonService.loggerExcp(this.ACTION_TYPE_OCR_INSERT, this.LOCATION_DEVICE_ID, 'GE05', '', this.newReader_icno, ' readhkicv2ocrdata');
                        if (this.timeOutPause || this.isAbort) {
                            return;
                        }
                        this.processModalFailShow();
                    }
                } else if (resp.ocr_data.length === 1 ||  resp.ocr_data.length === 2) { 
                    // S/N10
                    this.retryReader2Val += 1;
                    if (this.retryReader2Val < this.PAGE_READ_RETRY_READER_2_MAX) {
                        this.messageRetry = 'SCN-GEN-STEPS.OCR_READER_SCREEN_S10';
                        if (this.timeOutPause || this.isAbort) {
                            return;
                        }
                        this.modalRetryOCR.show();
                    } else {
                        this.commonService.doLightOff(this.DEVICE_LIGHT_CODE_OCR_READER);
                        if (this.retryReaderVal < this.PAGE_READ_RETRY_READER_1_MAX) {
                            this.messageRetry = 'SCN-GEN-STEPS.OCR_READER_SCREEN_S16';
                            if (this.timeOutPause || this.isAbort) {
                                return;
                            }
                            this.modalRetryOpenGate.show();
                        } else {
                            this.commonService.doLightOff(this.DEVICE_LIGHT_CODE_OCR_READER);
                            this.commonService.loggerExcp(this.ACTION_TYPE_OCR_INSERT, this.LOCATION_DEVICE_ID, 'GE05', '', this.newReader_icno, 'opengate readhkicv2ocrdata');
                            this.messageFail = 'SCN-GEN-STEPS.OCR_READER_SCREEN_S13';
                            if (this.timeOutPause || this.isAbort) {
                                return;
                            }
                            this.processModalFailShow();
                        }
                    }

/*                } else if (resp.ocr_data.length === 2) {
                    // 无法识别卡时，重试3次，
                    // S/N11
                    this.retryReader2Val += 1;
                    if (this.retryReader2Val < this.PAGE_READ_RETRY_READER_2_MAX) {
                        this.messageRetry = 'SCN-GEN-STEPS.OCR_READER_SCREEN_S11';
                        if (this.timeOutPause || this.isAbort) {
                            return;
                        }
                        this.modalRetryOCR.show();
                    } else {
                        // 超过3次后提示放到ICReader 提示.
                        this.commonService.doLightOff(this.DEVICE_LIGHT_CODE_OCR_READER);
                        if (this.retryReaderVal < this.PAGE_READ_RETRY_READER_1_MAX) {
                            this.messageRetry = 'SCN-GEN-STEPS.OCR_READER_SCREEN_S16';
                            if (this.timeOutPause || this.isAbort) {
                                return;
                            }
                            this.modalRetryOpenGate.show();
                        } else {
                            this.commonService.doLightOff(this.DEVICE_LIGHT_CODE_OCR_READER);
                            this.commonService.loggerExcp(this.ACTION_TYPE_OCR_INSERT, this.LOCATION_DEVICE_ID, 'GE05', '', this.newReader_icno, 'opengate readhkicv2ocrdata');
                            this.messageFail = 'SCN-GEN-STEPS.OCR_READER_SCREEN_S13';
                            if (this.timeOutPause || this.isAbort) {
                                return;
                            }
                            this.processModalFailShow();
                        }
                    }*/
                } else {
                    if (this.timeOutPause || this.isAbort) {
                        return;
                    }
                    // this.newReader_dor = '20180531';
                    // this.newReader_icno = 'M002981(0)';
                    this.processNewReaderData(resp.ocr_data);
                    this.commonService.doLightOff(this.DEVICE_LIGHT_CODE_OCR_READER);
                    // *************************************開始調用光學閱讀器的開卡服務opencard*****************************************
                    console.log('*************************************開始調用光學閱讀器的開卡服務opencard*****************************************');
                    this.commonService.loggerTrans(this.ACTION_TYPE_OCR_INSERT, this.LOCATION_DEVICE_ID, 'S', '', this.newReader_icno, 'call readhkicv2ocrdata');
                    this.openCardNewFun();
                }
            } else {
                this.commonService.doLightOff(this.DEVICE_LIGHT_CODE_OCR_READER);
                this.messageFail = 'SCN-GEN-STEPS.OCR_READER_SCREEN_S8';
                if (this.timeOutPause || this.isAbort) {
                    return;
                }
                this.processModalFailShow();
            }
        }, (error) => {
            this.commonService.loggerExcp(this.ACTION_TYPE_OCR_INSERT, this.LOCATION_DEVICE_ID, 'GE04', '', this.newReader_icno, 'readhkicv2ocrdata');
            this.messageFail = 'SCN-GEN-STEPS.OCR_READER_SCREEN_S8';
            if (this.timeOutPause || this.isAbort) {
                return;
            }
            this.processModalFailShow();
        });
    }

    /**
     * deal New Reader data.
     * @param {any[]} arrParam
     */
    processNewReaderData(arrParam: any[]) {
        if (this.timeOutPause || this.isAbort) {
            return;
        }
        let dor = null, icno = null;
        const datas: any[] = arrParam;
        for (const i in datas) {
            if ('VizIssueDate' === datas[i].field_id) {
                const dor_temp = datas[i].field_value;
                const year = this.commonService.changeDor(dor_temp);
                dor = `${year}${dor_temp.substr(3, 2)}${dor_temp.substr(0, 2)}`;
            }else if ('VizDocumentNumber' === datas[i].field_id) {
                icno = datas[i].field_value;
            }
        }

        if (dor == null || icno == null) {
            this.messageFail = 'SCN-GEN-STEPS.OCR_READER_SCREEN_S12';
            this.processModalFailShow();
        } else {
            this.newReader_dor = dor;
            // this.newReader_icno = icno;
            if (icno.indexOf(')') === -1) {
                this.newReader_icno = icno + ')';
            } else {
                this.newReader_icno = icno;
            }
        }
    }

    /**
     *  open card fun.
     */
    openCardNewFun() {
        if (this.timeOutPause || this.isAbort) {
            return;
        }
        console.log('call openCardNewFun fun.');
        this.processing.show();
        this.showImage = true;
        this.quitDisabledAll();
        const payload = {
            'card_reader_id':  null,
            'contactless_password': {
                'date_of_registration': this.newReader_dor,
                'hkic_no':  this.newReader_icno
            }
        }
        this.service.sendRequestWithLog(CHANNEL_ID_RR_CARDREADER, 'opencard', payload).subscribe((resp) => {
            this.processing.hide();
            this.showImage = false;
            this.cancelQuitEnabledAll();
            if (!$.isEmptyObject(resp)) {
                if (resp.result === true) {
                    this.commonService.doLightOff(this.DEVICE_LIGHT_CODE_OCR_READER);
                    this.cardType = 2;
                    if (this.timeOutPause || this.isAbort) {
                        return;
                    }
                    this.commonService.loggerTrans(this.ACTION_TYPE_OCR_OPENCARD, this.LOCATION_DEVICE_ID, 'S', '', this.newReader_icno, 'call opencard');
                    this.nextRoute();
                } else {
                    // open card failed S/N12
                    this.messageRetry = 'SCN-GEN-STEPS.OCR_READER_SCREEN_S12';
                    this.retryReader2Val += 1;
                    if (this.retryReader2Val < this.PAGE_READ_RETRY_READER_2_MAX) {
                        if (this.timeOutPause || this.isAbort) {
                            return;
                        }
                        this.modalRetryOCR.show();
                    } else {
                        this.commonService.doLightOff(this.DEVICE_LIGHT_CODE_OCR_READER);
                        if (this.retryReaderVal < this.PAGE_READ_RETRY_READER_1_MAX) {
                            this.messageRetry = 'SCN-GEN-STEPS.OCR_READER_SCREEN_S16';
                            if (this.timeOutPause || this.isAbort) {
                                return;
                            }
                            this.modalRetryOpenGate.show();
                        } else {
                            this.commonService.doLightOff(this.DEVICE_LIGHT_CODE_OCR_READER);
                            this.commonService.loggerExcp(this.ACTION_TYPE_OCR_OPENCARD, this.LOCATION_DEVICE_ID, 'GE05', '', this.newReader_icno, 'call opencard');
                            this.messageFail = 'SCN-GEN-STEPS.OCR_READER_SCREEN_S13';
                            if (this.timeOutPause || this.isAbort) {
                                return;
                            }
                            this.processModalFailShow();
                        }
                    }
                }
            } else {
                this.messageFail = 'SCN-GEN-STEPS.OCR_READER_SCREEN_S13';
                this.commonService.loggerExcp(this.ACTION_TYPE_OCR_OPENCARD, this.LOCATION_DEVICE_ID, 'GE05', '', this.newReader_icno, 'call opencard');
                if (this.timeOutPause || this.isAbort) {
                    return;
                }
                this.processModalFailShow();
            }

        }, (error) => {
            console.log('opencard ERROR ' + error);
            this.commonService.loggerExcp(this.ACTION_TYPE_OCR_OPENCARD, this.LOCATION_DEVICE_ID, 'GE05', '', this.newReader_icno, 'call opencard');
            this.messageFail = 'SCN-GEN-STEPS.OCR_READER_SCREEN_S13';
            if (this.timeOutPause || this.isAbort) {
                return;
            }
            this.processModalFailShow();
        });
    }

    openCardNewFunChen() {
        if (this.timeOutPause || this.isAbort) {
            return;
        }
        console.log('call openCardNewFun fun.');
        this.processing.show();
        this.isProcessing = true;
        this.showImage = true;
        this.quitDisabledAll();
        const payload = {
            'card_reader_id':  null,
            'contactless_password': {
                'date_of_registration': this.newReader_dor,
                'hkic_no':  this.newReader_icno
            }
        }
        this.service.sendRequestWithLog(CHANNEL_ID_RR_CARDREADER, 'opencard', payload).subscribe((resp) => {
            this.processing.hide();
            this.showImage = false;
            this.cancelQuitEnabledAll();
            if (!$.isEmptyObject(resp)) {
                if (resp.result === true) {
                    this.commonService.doLightOff(this.DEVICE_LIGHT_CODE_OCR_READER);
                    this.cardType = 2;
                    if (this.timeOutPause || this.isAbort) {
                        return;
                    }
                    this.commonService.loggerTrans(this.ACTION_TYPE_OCR_OPENCARD, this.LOCATION_DEVICE_ID, 'S', '', this.newReader_icno, 'call opencard');
                    this.nextRoute();
                } else {
                    this.messagePrompt = 'SCN-GEN-STEPS.OCR_READER_SCREEN_S12';
                    this.modalPrompt.show();
                    this.isProcessing = false;
                    setTimeout(() => {
                        this.modalPrompt.hide();
                        this.startInsertCardListener('30');
                    }, 4000);
                }
            } else {
                this.messageFail = 'SCN-GEN-STEPS.OCR_READER_SCREEN_S13';
                this.commonService.loggerExcp(this.ACTION_TYPE_OCR_OPENCARD, this.LOCATION_DEVICE_ID, 'GE05', '', this.newReader_icno, 'call opencard');
                if (this.timeOutPause || this.isAbort) {
                    return;
                }
                this.processModalFailShow();
            }

        }, (error) => {
            console.log('opencard ERROR ' + error);
            this.commonService.loggerExcp(this.ACTION_TYPE_OCR_OPENCARD, this.LOCATION_DEVICE_ID, 'GE05', '', this.newReader_icno, 'call opencard');
            this.messageFail = 'SCN-GEN-STEPS.OCR_READER_SCREEN_S13';
            if (this.timeOutPause || this.isAbort) {
                return;
            }
            this.processModalFailShow();
        });
    }

    failTryAgainOCR() {
        this.modalRetryOCR.hide();
        this.processNewReader();
    }

    timeExpire() {
        this.timer.showTimer = false;
        this.timeOutPause = true;
        if (this.processing.visible) {
            this.showImage = false;
            this.processing.hide();
        }
        if (this.modalRetryOCR.visible) {
            this.modalRetryOCR.hide();
        }
        if (this.modalRetryOpenGate.visible) {
            this.modalRetryOpenGate.hide();
        }
        if (this.modalRetryOpenCard.visible) {
            this.modalRetryOpenCard.hide();
        }
        if (this.modalFail.visible) {
            this.modalFail.hide();
        }
        if (this.modal1Comfirm.visible) {
            this.modal1Comfirm.hide();
        }
        if (this.modalQuit.visible) {
            this.modalQuit.hide();
        }
        this.messageTimeout = 'SCN-GEN-STEPS.MESSAGE-TIMEOUT';
        this.quitDisabledAll();
        this.modalTimeout.show();
        setTimeout(() => {
            this.processTimeoutQuit();
        }, 5000);
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
        this.isExit = false;
        this.modalFail.show();
    }

    /**
     * process fail quit fun.
     */
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

    /**
     * show abort modal.
     */
    processModalQuitShow() {
        if (this.processing.visible) {
           return;
        }
        this.isAbort = true;
        this.modalQuit.show()
        this.quitDisabledAll();
        if (this.processing.visible) {
            this.isRestore = true;
            this.showImage = false;
            this.processing.hide();
        }
    }

    /**
     * click abort button.
     */
    processConfirmQuit() {
        this.modalQuit.hide();
        if (this.processing.visible) {
            this.showImage = false;
            this.processing.hide();
        }
        this.doCloseCard();
    }

    /**
     * cancel abort operation
     */
    processCancelQuit() {
        this.modalQuit.hide();
        this.isAbort = false;
        if (this.isRestore) {
            this.processing.show();
            this.showImage = true;
        } else {
            this.cancelQuitEnabledAll();
        }
    }

    modalCollectShow() {
        this.commonService.doFlashLight(this.DEVICE_LIGHT_CODE_OCR_READER);
        if (this.processing.visible) {
            this.isRestore = true;
            this.processing.hide();
            this.showImage = false;
        }
        this.modalCollect.show();
    }
    processCollectQuit() {
        this.modalCollect.hide();
        if (this.isRestore) {
            this.processing.show();
            this.showImage = true;
        }
        setTimeout(() => {
            this.commonService.doLightOff(this.DEVICE_LIGHT_CODE_OCR_READER);
            this.backRoute();
        }, this.PAGE_READ_ABORT_QUIT_ITEMOUT);
    }

    /**
     * close card function.
     */
    doCloseCard() {
        this.showImage = true;
        this.isShowCollect = false;
        this.service.sendRequestWithLog(CHANNEL_ID_RR_CARDREADER, 'closecard').subscribe((resp) => {
            if (this.readType === 1) {
                this.doReturnDoc();
                setTimeout(() => {
                    this.backRoute();
                }, this.PAGE_READ_RETURN_CARD_ITEMOUT);
            } else {
                // this.modalCollectShow();
                this.commonService.doFlashLight(this.DEVICE_LIGHT_CODE_OCR_READER);
                setTimeout(() => {
                    this.backRoute();
                }, this.PAGE_READ_RETURN_CARD_ITEMOUT);
            }
        }, (error) => {
            console.log('closecard ERROR ' + error);
            setTimeout(() => {
                this.backRoute();
            }, this.PAGE_READ_ABORT_QUIT_ITEMOUT);
        });
    }

    /**
     * return card.
     */
    doReturnDoc() {
        this.commonService.doFlashLight(this.DEVICE_LIGHT_CODE_IC_READER);
        this.service.sendRequestWithLog(CHANNEL_ID_RR_ICCOLLECT, 'returndoc').subscribe((resp) => {
            this.commonService.doLightOff(this.DEVICE_LIGHT_CODE_IC_READER);
        }, (error) => {
            console.log('opencard ERROR ' + error);
            this.commonService.loggerExcp(this.ACTION_TYPE_IC_RETURN_CARD, this.LOCATION_DEVICE_ID, 'GE0F', '', this.newReader_icno, 'call returndoc');
            this.messageFail = 'SCN-GEN-STEPS.READER-COLLECT-FAIL';
            if (this.timeOutPause || this.isAbort) {
                return;
            }
            this.processModalFailShow();
        });
    }

    processOCRReaderData(datas, resultObj) {
        let dor = null, icno = null;
        for (const i in datas) {
            if ('VizIssueDate' === datas[i].field_id) {
                const dor_temp = datas[i].field_value;
                const year = this.commonService.changeDor(dor_temp);
                dor = `${year}${dor_temp.substr(3, 2)}${dor_temp.substr(0, 2)}`;
            } else if ('VizDocumentNumber' === datas[i].field_id) {
                icno = datas[i].field_value;
            }
        }
        resultObj.ocr_data = { 'dor': dor, 'icno': icno };
        // resultObj.ocr_data.dor = dor;
        // resultObj.ocr_data.icno = icno;
    }

    startInsertCardListener(openGateTime) {
        this.commonService.doFlashLight(this.DEVICE_LIGHT_CODE_IC_READER);
        // this.doLightOff('08');
        const ATTEMPT_COUNT = 5;
        let num = 0;
        const DELAY	=	3000;
        const IC = this.service.sendRequestWithLog(CHANNEL_ID_RR_ICCOLLECT, 'opengate', { 'timeout': openGateTime }).map((resp) => {
            const result = { type: 'ICCOLLECT', status: null };
            if ($.isEmptyObject(resp)) {
                result.status = 'CRASH';
            } else if (resp.errorcode === '0') {
                result.status = 'SUCCESS';
                return result;
            } else if (resp.errorcode === 'D0009') {
                result.status = 'EXIST';
            } else if (resp.errorcode === 'D0006') {
                result.status = 'TIMEOUT';
            } else {
                result.status = 'ERROR';
            }
            throw new Error(result.status);
        }).retryWhen(stream => stream.scan((count, err) => {
            if (num >= ATTEMPT_COUNT) {
                this.messagePrompt = 'SCN-GEN-STEPS.OCR_READER_SCREEN_S13';
                this.modalPrompt.show();
                setTimeout(() => {
                    this.modalPrompt.hide();
                }, 4000);
                throw err;
            } else {
                if (err.message === 'CRASH' ) {
                    this.messagePrompt = 'SCN-GEN-STEPS.INSERT_CARD_SCREEN_S2';
                }else if (err.message === 'TIMEOUT') {
                    this.messagePrompt = 'SCN-GEN-STEPS.INSERT_CARD_SCREEN_S5';
                }else if (err.message === 'ERROR') {
                    this.messagePrompt = 'SCN-GEN-STEPS.INSERT_CARD_SCREEN_S6';
                }
                this.modalPrompt.show();
                setTimeout(() => {
                    this.modalPrompt.hide();
                }, 4000);
            }
            num++;
            return count + 1;
        }, 0).delay(DELAY));

// 5 X 3
        let ocrNum = 0;
        const payloadParam = {'ocr_reader_name' : 'ARH ComboSmart'};
        const OCR = this.service.sendRequestWithLog(CHANNEL_ID_RR_CARDREADER, 'readhkicv2ocrdata', payloadParam).map((resp) => {
            const result = { type: 'OCR', status: null, ocr_data: null };
            const temp = $.isEmptyObject(resp) || resp.error_info.error_code !== '0';
            if ($.isEmptyObject(resp) || resp.error_info.error_code !== '0') {
                result.status = 'CRASH';
            } else if (resp.ocr_data.length === 0) {
                result.status = 'NOCARD';
            } else if (resp.ocr_data.length <= 2) {
                result.status = 'ERROR';
            } else {
                result.status = 'SUCCESS';
                this.isProcessing = true;
                this.processing.show();
                this.processOCRReaderData(resp.ocr_data, result);
                return result;
            }
            throw new Error(result.status);
        }).retryWhen(stream => stream.scan((count, err) => {
            if (ocrNum >= ATTEMPT_COUNT) {
                this.messagePrompt = 'SCN-GEN-STEPS.OCR_READER_SCREEN_S13';
                this.modalPrompt.show();
                setTimeout(() => {
                    this.modalPrompt.hide();
                }, 4000);
                throw err;
            } else {
                if (err.message === 'CRASH' || err.message === 'ERROR') {
                    this.messagePrompt = 'SCN-GEN-STEPS.OCR_READER_SCREEN_S10';
                    this.modalPrompt.show();
                    setTimeout(() => {
                        this.modalPrompt.hide();
                    }, 4000);
                }
                ocrNum++;
                return count + 1;
            }
        }, 0).delay(DELAY));

        const subscription = IC.merge(OCR).subscribe((resp: any) => {
            if (resp.status === 'SUCCESS') {
                subscription.unsubscribe();
                if (resp.type === 'OCR') {
                    this.commonService.doLightOff(this.DEVICE_LIGHT_CODE_IC_READER);
                    this.newReader_dor = resp.ocr_data.dor;
                    this.newReader_icno = resp.ocr_data.icno;
                    this.openCardNewFunChen();
                } else if (resp.type === 'ICCOLLECT') {
                    this.openCardFun();
                }
            }
        },
        (err) => {
            this.service.sendTrackLog(err);
        },
        () => {
            this.service.sendTrackLog('completed....');
        }
        );
    }

    processOn() {
        this.isProcessing = true;
        this.processing.show();
    }

    processOff() {
        this.isProcessing = false;
        this.processing.hide();
    }

    processPromt(message_key) {
        this.messagePrompt = message_key;
        this.modalPrompt.show();
        setTimeout(() => {
            this.modalPrompt.hide();
        }, 4000);
    }

    processPromtBack(message_key) {
        this.messagePrompt = message_key;
        this.modalPrompt.show();
        setTimeout(() => {
            this.modalPrompt.hide();
            this.backRoute();
        }, 4000);
    }

    processPromtOpenGate(message_key) {
        this.messagePrompt = message_key;
        this.modalPrompt.show();
        setTimeout(() => {
            this.modalPrompt.hide();
            this.commonService.doReturnDoc();
        }, 4000);
    }

    newFunc(openGateTime) {
        this.service.sendTrackLog(`---------------------start------------------------------`);
        this.commonService.doFlashLight(this.DEVICE_LIGHT_CODE_IC_READER);
        // this.doLightOff('08');
        const ATTEMPT_COUNT = 3;
        const DELAY = 4100;
        const card_error = { ocrerrCount: 0, nocardCount: 0, readerrorCount: 0 };
        const IC = this.service.sendRequestWithLog(CHANNEL_ID_RR_ICCOLLECT, 'opengate', { 'timeout': openGateTime }).mergeMap(resp => {
            const result = { type: 'ICCOLLECT', status: null };
            if ($.isEmptyObject(resp)) {
                result.status = 'CRASH';
            } else if (resp.errorcode === '0') {
                result.status = 'FIRSTSUCCESS';
                this.service.sendTrackLog(`<IC>1>>>>>>>>>>${result.status}`);
                return [result];
            } else if (resp.errorcode === 'D0009') {
                return this.service.sendRequestWithLog(CHANNEL_ID_RR_ICCOLLECT, 'returndoc').map(() => {
                    return { type: 'ICCOLLECT', status: 'EXIST' };
                });
                // result.status = 'EXIST';
            } else if (resp.errorcode === 'D0006') {
                result.status = 'TIMEOUT';
            } else {
                result.status = 'ERROR';
            }
            this.service.sendTrackLog(`<IC>1>>>>>>>>>>${result.status}`);
            throw new Error(result.status);
        }).retryWhen(stream => stream.scan((count, err) => { // crash timeout error
            if (err.message === 'TIMEOUT') {
                if (card_error.nocardCount + 1 < ATTEMPT_COUNT) {
                    this.processPromt('请插入卡todo');
                    card_error.nocardCount = card_error.nocardCount + 1;
                } else {
                    throw new Error('NOCARD');
                }
            } else if (err.message === 'CRASH' || err.message === 'ERROR') {
                // ic_error.nocard = 0; // 重置无卡
                if (card_error.readerrorCount <= 1) {
                    this.processPromt('不能正确识别卡,重试todo');
                } else if (card_error.readerrorCount === 2) {
                    this.processPromt('请选择你的卡类型todo');
                } else {
                    throw new Error('OVERCOUNT');
                }
                card_error.readerrorCount = card_error.readerrorCount + 1;
            }
            return count;
        }, 0).delay(DELAY));

        const DELAY_OCR = 3000;
        const payloadParam = { 'ocr_reader_name': 'ARH ComboSmart' };
        const OCR = this.service.sendRequestWithLog(CHANNEL_ID_RR_CARDREADER, 'readhkicv2ocrdata', payloadParam).map((resp) => {
            const result = { type: 'OCR', status: null, ocr_data: null };
            if ($.isEmptyObject(resp) || resp.error_info.error_code !== '0') {
                result.status = 'CRASH';
            } else if ($.isEmptyObject(resp.ocr_data) || resp.ocr_data.length === 0) {
                result.status = 'NOCARD';
            } else if (resp.ocr_data.length <= 2) {
                result.status = 'ERROR';
            } else {
                result.status = 'FIRSTSUCCESS';
                this.processOCRReaderData(resp.ocr_data, result);
                this.service.sendTrackLog(`<OCR>1>OK>>>>>>>>>${result.ocr_data.dor} ${result.ocr_data.icno}`);
                return result;
            }
            this.service.sendTrackLog(`<OCR>1>Error>>>>>>>>>${result.status}`);
            throw new Error(result.status);
        }).retryWhen(stream => stream.scan((count, err) => {
            this.service.sendTrackLog(`<OCR retry>>>>>>>${count}   ${err.message}`);
            if (err.message === 'NOCARD') {
                return count;
            } else if (err.message === 'CRASH' || err.message === 'ERROR') {
                if (card_error.ocrerrCount + 1 < ATTEMPT_COUNT) {
                    this.processPromt('不能识别todo');
                    card_error.ocrerrCount = card_error.ocrerrCount + 1;
                } else {
                    throw new Error('OVERCOUNT');
                }
            }
            return count;
        }, 0).delay(DELAY_OCR));

        const subscription = IC.merge(OCR).take(1).mergeMap((resp: any) => {
            this.service.sendTrackLog(`<merge>>>>>>>>  ${resp.type}  ${resp.status}`);
            const payload = {
                'card_reader_id': null,
                'contactless_password': {
                    'date_of_registration': resp.type === 'OCR' ? resp.ocr_data.dor : null,
                    'hkic_no': resp.type === 'OCR' ? resp.ocr_data.icno : null
                }
            }
            return this.service.sendRequestWithLog(CHANNEL_ID_RR_CARDREADER, 'opencard', payload);
        },
            (x, y, ix, iy) => {
                this.service.sendTrackLog(`<xy>>>>>>> ${ix} = ${x.type}  = ${y.result}`);

                if (y.result === false) {
                    if (x.type === 'OCR') {
                        card_error.ocrerrCount = card_error.ocrerrCount + 1;
                    } else if (x.type === 'ICCOLLECT') {
                        card_error.readerrorCount = card_error.readerrorCount + 1;
                        this.service.sendTrackLog(`<opencard_eror no:>>>>>${card_error.readerrorCount}`);
                    }
                    throw new Error('OPENCARDERROR');
                }
                if (x.type === 'OCR') {
                    this.cardType = 2;
                } else if (x.type === 'ICCOLLECT') {
                    this.service.sendTrackLog(`<card_version>>>>>>>${y.card_version}`);
                    this.cardType = y.card_version;
                }
                return y;
            }).retryWhen(stream => {
                // 计算两个设备失败是否有超过次数
                return stream.scan((count, err) => {
                    this.processPromt('open card 失败todo');
                }).delay(4000);
            }).subscribe((resp) => {
                if (resp.result === true) {
                    subscription.unsubscribe();
                    this.commonService.doLightOff(this.DEVICE_LIGHT_CODE_IC_READER);

                    if (this.timeOutPause || this.isAbort) {
                        return;
                    }
                    this.commonService.loggerTrans(this.ACTION_TYPE_IC_OPENCARD, this.LOCATION_DEVICE_ID, 'S', '', this.newReader_icno, 'call opencard');
                    this.nextRoute();
                }
            },
                (error) => {
                    // if (error.message === 'OVERCOUNT') {
                    this.processPromtBack(`${error.message}`);
                    // }

                });
    }

// IC
    // (error) => {
    //     if (err.message === 'CRASH' ) {
    //         this.messagePrompt = 'SCN-GEN-STEPS.INSERT_CARD_SCREEN_S2';
    //     }else if (err.message === 'TIMEOUT') {
    //         this.messagePrompt = 'SCN-GEN-STEPS.INSERT_CARD_SCREEN_S5';
    //     }else if (err.message === 'ERROR') {
    //         this.messagePrompt = 'SCN-GEN-STEPS.INSERT_CARD_SCREEN_S6';
    //     }
    //     // 這一段是提示4秒後自動重試
    //     this.modalPrompt.show();
    //     setTimeout(() => {
    //         this.modalPrompt.hide();
    //     }, 4000);
    // }

// OCR
//     (error) => {
//         if (err.message === 'CRASH' || err.message === 'ERROR') {
//             this.messagePrompt = 'SCN-GEN-STEPS.OCR_READER_SCREEN_S10';
//             this.modalPrompt.show();
//             setTimeout(() => {
//                 this.modalPrompt.hide();
//             }, 4000);
//         }
//     }

}
