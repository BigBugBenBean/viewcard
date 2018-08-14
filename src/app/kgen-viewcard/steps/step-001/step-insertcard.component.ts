import {Component,  OnInit, ViewChild} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MsksService } from '../../../shared/msks';
import {CHANNEL_ID_RR_CARDREADER, CHANNEL_ID_RR_ICCOLLECT} from '../../../shared/var-setting';
import { ConfirmComponent } from '../../../shared/sc2-confirm';
import { LocalStorageService } from '../../../shared/services/common-service/Local-storage.service';
import {CommonService} from '../../../shared/services/common-service/common.service';
import {ProcessingComponent} from '../../../shared/processing-component';
import {TimerComponent} from '../../../shared/sc2-timer';

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

    @ViewChild('modalNoROP')
    public modalNoROP: ConfirmComponent;

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

    messageRetry = 'SCN-GEN-STEPS.RE-SCANER-FINGER';
    messageTimeout = 'SCN-GEN-STEPS.MESSAGE-TIMEOUT';
    messageComfirm = '';
    retryOpenGateVal = 0;
    retryOpenGateByTimeoutNocardVal = 0;
    retryReadCv2ocrVal = 0;
    retryReadCv2ocrVal_SN_10 = 0;
    retryReadCv2ocrVal_SN_11 = 0;
    messageFail = 'SCN-GEN-STEPS.RE-SCANER-MAX';
    messageAbort = 'SCN-GEN-STEPS.ABORT_CONFIRM';
    cardType = 1;
    readType = 1;
    newReader_dor = null;
    newReader_icno = null;
    countNum = 30;
    flag = false;
    isAbort = false;
    timeOutPause = false;
    isRestore = false;
    retryReader1Val = 0;
    retryReader2Val = 0;

    PAGE_READ_OPENGATE_TIMEOUT_PAYLOAD = 10
    PAGE_READ_CLOSE_CARD_ITMEOUT_OCR = 2000
    PAGE_READ_CLOSE_CARD_TIMEOUT_IC = 2000
    PAGE_READ_RETRY_READER_1_MAX = 3
    PAGE_READ_RETRY_READER_2_MAX = 3
    PAGE_READ_RETURN_CARD_TIMEOUT_PAYLOAD_BY_RETRY = 5
    PAGE_READ_RETURN_CARD_TIMEOUT_PAYLOAD_BY_OCR = 5
    PAGE_READ_ABORT_QUIT_ITEMOUT = 8000
    PAGE_READ_RETURN_CARD_ITEMOUT = 8000
    PAGE_READ_TIME_EXPIRE_ITEMOUT = 8000
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

// ====================================================== Common Start ====================================================================
    initConfigParam() {
        this.APP_LANG = this.localStorages.get('APP_LANG');
        this.DEVICE_LIGHT_CODE_OCR_READER = this.localStorages.get('DEVICE_LIGHT_CODE_OCR_READER');
        this.DEVICE_LIGHT_CODE_IC_READER = this.localStorages.get('DEVICE_LIGHT_CODE_IC_READER');
        this.DEVICE_LIGHT_CODE_PRINTER = this.localStorages.get('DEVICE_LIGHT_CODE_PRINTER');
        this.DEVICE_LIGHT_CODE_FINGERPRINT = this.localStorages.get('DEVICE_LIGHT_CODE_FINGERPRINT');

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
        // this.cleanLocalstorageData();
        this.commonService.doCloseCard();
        // *****************a later call openGate function *************************************************
        setTimeout(() => {
            console.log('*******start call openGate function *********');
            // this.processNewReader();
            this.openGateFun();
        }, 1000);
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
     * open card gate fun.
     */
    openGateFun() {
        if (this.timeOutPause || this.isAbort) {
            return;
        }
        console.log('call openGateFun fun.');
        this.commonService.doFlashLight(this.DEVICE_LIGHT_CODE_IC_READER);
        // this.commonService.initTimerSet(this.timerOpenGate, 15, 0);
        //  $('#timerOpenGateObj').hide();
        this.service.sendRequestWithLog(CHANNEL_ID_RR_ICCOLLECT, 'opengate', { 'timeout': this.PAGE_READ_OPENGATE_TIMEOUT_PAYLOAD})
            .subscribe((resp) => {
                if (!$.isEmptyObject(resp)) {
                    if (resp.errorcode === '0') {
                        this.commonService.doLightoff(this.DEVICE_LIGHT_CODE_IC_READER);
                        if (this.timeOutPause || this.isAbort) {
                            return;
                        }
                        this.openCardFun();
                    } else if (resp.errorcode === 'D0009') {
                        // S/N3  have card in reader.
                        this.messageFail = 'SCN-GEN-STEPS.INSERT_CARD_SCREEN_S3';
                        if (this.timeOutPause || this.isAbort) {
                            return;
                        }
                        this.processModalFailShow();
                    } else {
                        alert(456);
                        this.retryReader1Val += 1;
                        if (this.retryReader1Val < this.PAGE_READ_RETRY_READER_1_MAX) {
                            this.messageRetry = 'SCN-GEN-STEPS.INSERT_CARD_SCREEN_S4';
                            if (this.timeOutPause || this.isAbort) {
                                return;
                            }
                            this.modalRetryOpenGate.show();
                        } else {
                            // S/N4 f the retry limitexcess?
                            this.commonService.doLightoff(this.DEVICE_LIGHT_CODE_IC_READER);
                            this.messageComfirm = 'SCN-GEN-STEPS.INSERT_CARD_SCREEN_S6';
                            if (this.timeOutPause || this.isAbort) {
                                return;
                            }
                            this.quitDisabledAll();
                            this.modal1Comfirm.show();
                        }
                    }
                } else {
                    this.messageFail = 'SCN-GEN-STEPS.INSERT_CARD_SCREEN_S2';
                    if (this.timeOutPause || this.isAbort) {
                        return;
                    }
                    this.processModalFailShow();
                }

            }, (error) => {
                alert(123);
                console.log('**********opengate:' + error);
                this.messageFail = 'SCN-GEN-STEPS.INSERT_CARD_SCREEN_S2';
                if (this.timeOutPause || this.isAbort) {
                    return;
                }
                this.processModalFailShow();
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
        this.processing.show();
        // this.commonService.initTimerSet(this.timer, 1, 30)
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
            this.processing.hide();
            this.cancelQuitEnabledAll();
            if (!$.isEmptyObject(resp)) {
                if (resp.result === true) {
                    this.commonService.doLightoff(this.DEVICE_LIGHT_CODE_IC_READER);
                    this.cardType = resp.card_version;
                    if (this.timeOutPause || this.isAbort) {
                        return;
                    }
                    this.nextRoute();
                } else {
                    // open card failed S/N7
                    this.retryReader1Val += 1;
                    if (this.retryReader1Val < this.PAGE_READ_RETRY_READER_1_MAX) {
                        this.messageRetry = 'SCN-GEN-STEPS.INSERT_CARD_SCREEN_S7';
                        if (this.timeOutPause || this.isAbort) {
                            return;
                        }
                        this.modalRetryOpenCard.show();
                    } else {
                        this.messageComfirm = 'SCN-GEN-STEPS.INSERT_CARD_SCREEN_S6';
                        if (this.timeOutPause || this.isAbort) {
                            return;
                        }
                        this.quitDisabledAll();
                        this.modal1Comfirm.show();
                    }
                }
            } else {
                this.messageFail = 'SCN-GEN-STEPS.OCR_READER_SCREEN_S13';
                if (this.timeOutPause || this.isAbort) {
                    return;
                }
                this.processModalFailShow();
            }
        }, (error) => {
            this.messageFail = 'SCN-GEN-STEPS.OCR_READER_SCREEN_S13';
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
            this.doReturnDocByTryagain();
            setTimeout(() => {
                if (this.timeOutPause || this.isAbort) {
                    return;
                }
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
        this.commonService.doFlashLight(this.DEVICE_LIGHT_CODE_IC_READER);
        this.service.sendRequestWithLog(CHANNEL_ID_RR_ICCOLLECT, 'returndoc').subscribe((resp) => {
            this.commonService.doLightoff(this.DEVICE_LIGHT_CODE_IC_READER);
        });
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
            }, 2000);
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
            this.commonService.doLightoff(this.DEVICE_LIGHT_CODE_IC_READER);
        });
    }

    /**
     *  read new card data.
     */
    processNewReader() {
        if (this.timeOutPause || this.isAbort) {
            return;
        }
        this.commonService.doFlashLight(this.DEVICE_LIGHT_CODE_IC_READER);
        // this.commonService.initTimerSet(this.timer, 1, 15)
        this.readType = 2;
        // this.reSetOpencardVal();
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
                if (resp.ocr_data.length === 1) {
                    // S/N10
                    this.retryReader2Val += 1;
                    if (this.retryReader2Val < this.PAGE_READ_RETRY_READER_2_MAX) {
                        this.messageRetry = 'SCN-GEN-STEPS.OCR_READER_SCREEN_S10';
                        if (this.timeOutPause || this.isAbort) {
                            return;
                        }
                        this.modalRetryOCR.show();
                    } else {
                        this.messageFail = 'SCN-GEN-STEPS.OCR_READER_SCREEN_S13';
                        this.commonService.doLightoff(this.DEVICE_LIGHT_CODE_OCR_READER);
                        if (this.timeOutPause || this.isAbort) {
                            return;
                        }
                        this.processModalFailShow();
                    }

                } else if (resp.ocr_data.length === 2) {
                    // S/N11
                    this.retryReader2Val += 1;
                    if (this.retryReader2Val < this.PAGE_READ_RETRY_READER_2_MAX) {
                        this.messageRetry = 'SCN-GEN-STEPS.OCR_READER_SCREEN_S11';
                        if (this.timeOutPause || this.isAbort) {
                            return;
                        }
                        this.modalRetryOCR.show();
                    } else {
                        this.commonService.doLightoff(this.DEVICE_LIGHT_CODE_OCR_READER);
                        this.messageFail = 'SCN-GEN-STEPS.OCR_READER_SCREEN_S13';
                        if (this.timeOutPause || this.isAbort) {
                            return;
                        }
                        this.processModalFailShow();
                    }
                } else {
                    if (this.timeOutPause || this.isAbort) {
                        return;
                    }
                    // this.newReader_dor = '20180531';
                    // this.newReader_icno = 'M002981(0)';
                    this.processNewReaderData(resp.ocr_data);
                    this.commonService.doLightoff(this.DEVICE_LIGHT_CODE_OCR_READER);
                    // *************************************開始調用光學閱讀器的開卡服務opencard*****************************************
                    console.log('*************************************開始調用光學閱讀器的開卡服務opencard*****************************************');
                    this.openCardNewFun();
                }
            } else {
                this.commonService.doLightoff(this.DEVICE_LIGHT_CODE_OCR_READER);
                this.messageFail = 'SCN-GEN-STEPS.OCR_READER_SCREEN_S8';
                if (this.timeOutPause || this.isAbort) {
                    return;
                }
                this.processModalFailShow();
            }
        }, (error) => {
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

        if (dor == null && icno == null) {
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
        this.quitDisabledAll();
        // this.commonService.initTimerSet(this.timer, 1, 30);
        const payload = {
            'card_reader_id':  null,
            'contactless_password': {
                'date_of_registration': this.newReader_dor,
                'hkic_no':  this.newReader_icno
            }
        }
        this.service.sendRequestWithLog(CHANNEL_ID_RR_CARDREADER, 'opencard', payload).subscribe((resp) => {
            this.processing.hide();
            this.cancelQuitEnabledAll();
            if (!$.isEmptyObject(resp)) {
                if (resp.result === true) {
                    this.commonService.doLightoff(this.DEVICE_LIGHT_CODE_OCR_READER);
                    this.cardType = 2;
                    if (this.timeOutPause || this.isAbort) {
                        return;
                    }
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
                        this.messageFail = 'SCN-GEN-STEPS.OCR_READER_SCREEN_S13';
                        if (this.timeOutPause || this.isAbort) {
                            return;
                        }
                        this.processModalFailShow();
                    }
                }
            } else {
                this.messageFail = 'SCN-GEN-STEPS.OCR_READER_SCREEN_S13';
                if (this.timeOutPause || this.isAbort) {
                    return;
                }
                this.processModalFailShow();
            }

        }, (error) => {
            console.log('opencard ERROR ' + error);
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
        this.quitDisabledAll();
        this.isAbort = true;
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
        this.isAbort = true;
        this.modalQuit.show()
        this.quitDisabledAll();
        if (this.processing.visible) {
            this.isRestore = true;
            this.processing.hide();
        }
    }

    /**
     * click abort button.
     */
    processConfirmQuit() {
        this.modalQuit.hide();
        if (this.processing.visible) {
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
        }, this.PAGE_READ_ABORT_QUIT_ITEMOUT);
    }

    /**
     * close card function.
     */
    doCloseCard() {
        this.processing.show();
        this.service.sendRequestWithLog(CHANNEL_ID_RR_CARDREADER, 'closecard').subscribe((resp) => {
            if (this.readType === 1) {
                this.doReturnDoc();
                setTimeout(() => {
                    this.backRoute();
                }, this.PAGE_READ_RETURN_CARD_ITEMOUT);
            } else {
                this.modalCollectShow();
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
            this.commonService.doLightoff(this.DEVICE_LIGHT_CODE_IC_READER);
        });
    }
}
