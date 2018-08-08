import {Component,  OnInit, ViewChild} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MsksService } from '../../../shared/msks';
import {CHANNEL_ID_RR_CARDREADER, CHANNEL_ID_RR_ICCOLLECT, TIMEOUT_PAYLOAD} from '../../../shared/var-setting';
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
    isHasCard = false;
    countNum = 30;
    flag = false;
    isAbort = false;
    timeOutPause = false;
    isRestore = false;
    retryOpencardVal = 0;
    retryOpencardValNew = 0;
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

// ====================================================== Common Start ====================================================================
    initParam() {
        this.route.queryParams.subscribe(params => {
            const lang = params['lang'];
            if ('en-US' === lang) {
                this.translate.use('en-US');
            } else {
                this.translate.use('zh-HK');
            }
            this.translate.currentLang = lang;
            this.cleanLocalstorageData();
            this.commonService.doCloseCard();
            // *****************a later call openGate function *************************************************
            setTimeout(() => {
                console.log('*******start call openGate function *********');
                this.openGateFun();
            }, 1000);
        });
    }

    /**
     * init clean localstorage data.
     */
    cleanLocalstorageData() {
        this.localStorages.remove('newReader_dor');
        this.localStorages.remove('newReader_icno');
    }

    /**
     * nextPage.
     */
    nextRoute() {
        if (this.timeOutPause || this.isAbort) {
            return;
        }
        if (this.cardType === 2) {
            this.localStorages.set('newReader_dor', this.newReader_dor);
            this.localStorages.set('newReader_icno', this.newReader_icno);
        }
        this.localStorages.set('readType', this.readType.toString());
        this.router.navigate(['/kgen-viewcard/processing'],
            {
                queryParams: {
                    'lang': this.translate.currentLang, 'cardType': this.cardType
                }
            });
        return;
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
        this.commonService.doFlashLight('07');
       // this.commonService.initTimerSet(this.timerOpenGate, 15, 0);
      //  $('#timerOpenGateObj').hide();
        this.service.sendRequestWithLog(CHANNEL_ID_RR_ICCOLLECT, 'opengate', { 'timeout': TIMEOUT_PAYLOAD })
            .subscribe((resp) => {
                if (resp && resp.errorcode !== undefined ) {
                    if (resp.errorcode === '0') {
                        this.commonService.doLightoff('07');
                        if (this.timeOutPause || this.isAbort) {
                            return;
                        }
                        this.openCardFun();
                    } else if (resp.errorcode === 'D0009') {
                        // S/N3  have card in reader.
                        this.isHasCard = true;
                        this.messageFail = 'SCN-GEN-STEPS.INSERT_CARD_SCREEN_S3';
                        if (this.timeOutPause || this.isAbort) {
                            return;
                        }
                        this.modalFail.show();
                    } else if (resp.errorcode === 'D0006' || resp.errorcode === 'D000A') {
                        if (this.retryOpenGateVal < 3) {
                            this.messageRetry = 'SCN-GEN-STEPS.INSERT_CARD_SCREEN_S4';
                            if (this.timeOutPause || this.isAbort) {
                                return;
                            }
                            this.retryOpenGateVal += 1;
                            this.modalRetryOpenGate.show();
                        } else {
                            // S/N4 f the retry limitexcess?
                            this.commonService.doLightoff('07');
                            this.messageComfirm = 'SCN-GEN-STEPS.INSERT_CARD_SCREEN_S6';
                            if (this.timeOutPause || this.isAbort) {
                                return;
                            }
                            this.modal1Comfirm.show();
                        }
                    } else {
                        // Card reader intialization fail. Please request officers for assistance.
                        // 身份證閱讀器初始化失敗，請向職員查詢
                        this.messageFail = 'SCN-GEN-STEPS.INSERT_CARD_SCREEN_S2';
                        if (this.timeOutPause || this.isAbort) {
                            return;
                        }
                        this.modalFail.show();
                    }
                } else {
                    // Card reader intialization fail. System suspended
                    // S/N2
                    // 身份證閱讀器初始化失敗，系統暫停使用
                    this.messageFail = 'SCN-GEN-STEPS.INSERT_CARD_SCREEN_S2';
                    if (this.timeOutPause || this.isAbort) {
                        return;
                    }
                    this.modalFail.show();
                }
            }, (error) => {
                console.log('**********opengate:' + error);
                this.messageFail = 'SCN-GEN-STEPS.INSERT_CARD_SCREEN_S2';
                if (this.timeOutPause || this.isAbort) {
                    return;
                }
                this.modalFail.show();
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
        //this.commonService.initTimerSet(this.timer, 1, 30)
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
            if ((JSON.stringify(resp) !== '{}' && resp.result === true) || (resp.result !== undefined && resp.result === true)) {
                this.commonService.doLightoff('07');
                this.cardType = resp.card_version;
                if (this.timeOutPause || this.isAbort) {
                    return;
                }
                this.nextRoute();
            } else {
                // open card failed S/N7
                if (this.retryOpencardVal < 2) {
                    this.messageRetry = 'SCN-GEN-STEPS.INSERT_CARD_SCREEN_S7';
                    if (this.timeOutPause || this.isAbort) {
                        return;
                    }
                    this.retryOpencardVal += 1;
                    this.modalRetryOpenCard.show();
                } else {
                    this.messageComfirm = 'SCN-GEN-STEPS.INSERT_CARD_SCREEN_S6';
                    if (this.timeOutPause || this.isAbort) {
                        return;
                    }
                    this.modal1Comfirm.show();
                }
            }
        }, (error) => {
            this.messageFail = 'SCN-GEN-STEPS.OCR_READER_SCREEN_S13';
            if (this.timeOutPause || this.isAbort) {
                return;
            }
            this.modalFail.show();
        });
    }

    reSetOpencardVal() {
        this.retryOpencardVal = 0;
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
        // closecard
        this.doCloseCardByOcr();

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
        this.service.sendRequestWithLog(CHANNEL_ID_RR_ICCOLLECT, 'returndoc').subscribe((resp) => {});
    }

    /**
     *  read new card data.
     */
    processNewReader() {
        if (this.timeOutPause || this.isAbort) {
            return;
        }
        this.commonService.doFlashLight('08');
        // this.commonService.initTimerSet(this.timer, 1, 15)
        this.readType = 2;
        this.reSetOpencardVal();
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
            if (resp.error_info !== undefined && resp.error_info.error_code === '0') {
                if (resp.ocr_data.length === 1) {
                    // S/N10
                    if (this.retryReadCv2ocrVal_SN_10 < 2) {
                        this.messageRetry = 'SCN-GEN-STEPS.OCR_READER_SCREEN_S10';
                        if (this.timeOutPause || this.isAbort) {
                            return;
                        }
                        this.modalRetryOCR.show();
                        this.retryReadCv2ocrVal_SN_10 += 1;
                    } else {
                        this.messageFail = 'SCN-GEN-STEPS.OCR_READER_SCREEN_S13';
                        this.commonService.doLightoff('08');
                        if (this.timeOutPause || this.isAbort) {
                            return;
                        }
                        this.modalFail.show();
                    }

                } else if (resp.ocr_data.length === 2) {
                    // S/N11
                    if (this.retryReadCv2ocrVal_SN_11 < 2) {
                        this.messageRetry = 'SCN-GEN-STEPS.OCR_READER_SCREEN_S11';
                        if (this.timeOutPause || this.isAbort) {
                            return;
                        }
                        this.modalRetryOCR.show();
                        this.retryReadCv2ocrVal_SN_11 += 1;
                    } else {
                        this.commonService.doLightoff('08');
                        this.messageFail = 'SCN-GEN-STEPS.OCR_READER_SCREEN_S13';
                        if (this.timeOutPause || this.isAbort) {
                            return;
                        }
                        this.modalFail.show();
                    }
                } else {
                    if (this.timeOutPause || this.isAbort) {
                        return;
                    }
                    this.processNewReaderData(resp.ocr_data);
                    this.commonService.doLightoff('08');
                    // *************************************開始調用光學閱讀器的開卡服務opencard*****************************************
                    console.log('*************************************開始調用光學閱讀器的開卡服務opencard*****************************************');
                    this.openCardNewFun();
                }
            } else {
                this.commonService.doLightoff('08');
                this.messageFail = 'SCN-GEN-STEPS.OCR_READER_SCREEN_S8';
                if (this.timeOutPause || this.isAbort) {
                    return;
                }
                this.modalFail.show();
            }
        }, (error) => {
            this.messageFail = 'SCN-GEN-STEPS.OCR_READER_SCREEN_S8';
            if (this.timeOutPause || this.isAbort) {
                return;
            }
            this.modalFail.show();
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
            this.modalFail.show();
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
            if ((JSON.stringify(resp) !== '{}' && resp.result === true) || (resp.result !== undefined && resp.result === true)) {
                this.commonService.doLightoff('08');
                this.cardType = 2;
                if (this.timeOutPause || this.isAbort) {
                    return;
                }
                this.nextRoute();
            } else {
                // open card failed S/N12
                this.messageRetry = 'SCN-GEN-STEPS.OCR_READER_SCREEN_S12';
                if (this.retryOpencardValNew < 3) {
                    this.retryOpencardValNew += 1;
                    if (this.timeOutPause || this.isAbort) {
                        return;
                    }
                    this.modalRetryOCR.show();
                } else {
                    this.messageFail = 'SCN-GEN-STEPS.OCR_READER_SCREEN_S13';
                    if (this.timeOutPause || this.isAbort) {
                        return;
                    }
                    this.modalFail.show();
                }
            }
        }, (error) => {
            console.log('opencard ERROR ' + error);
            this.messageFail = 'SCN-GEN-STEPS.OCR_READER_SCREEN_S13';
            if (this.timeOutPause || this.isAbort) {
                return;
            }
            this.modalFail.show();
        });
    }

    failTryAgainOCR() {
        this.modalRetryOCR.hide();
        this.processNewReader();
    }
// ====================================================== New Reader End===================================================================
// ====================================================== Old Reader Start=================================================================

// ====================================================== Old Reader End =================================================================

/*    timeExpireOpenGate() {
        this.timeOutPause = true;
        $('#timerOpenGateObj').hide();
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
        if (this.retryOpenGateByTimeoutNocardVal < 3) {
            this.messageRetry = 'SCN-GEN-STEPS.INSERT_CARD_SCREEN_S4';
            this.retryOpenGateByTimeoutNocardVal += 1;
            this.timeOutPause = false;
            this.modalRetryOpenGate.show();
        } else {
            // S/N4 f the retry limitexcess?
            this.commonService.doLightoff('07');
            this.messageFail = 'SCN-GEN-STEPS.MESSAGE-TIMEOUT';
            this.modalFail.show();
        }
    }*/

    timeExpire() {
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
        this.commonService.doLightoff('08');
        this.commonService.doLightoff('07');
        this.doCloseCard();
    }

    /**
     * cancel abort operation
     */
    processCancelQuit() {
        this.modalQuit.hide();
        this.isAbort = false;
       this.cancelQuitEnabledAll();
        if (this.isRestore) {
            this.processing.show();
        }
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
                }, 5000);
            } else {
                this.backRoute();
            }
        }, (error) => {
            console.log('closecard ERROR ' + error);
            this.backRoute();
        });
    }

    /**
     * return card.
     */
    doReturnDoc() {
        this.service.sendRequestWithLog(CHANNEL_ID_RR_ICCOLLECT, 'returndoc').subscribe((resp) => {});
    }
}
