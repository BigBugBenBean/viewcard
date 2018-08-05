import {Component, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MsksService } from '../../../shared/msks';
import {CHANNEL_ID_RR_CARDREADER, CHANNEL_ID_RR_ICCOLLECT, TIMEOUT_PAYLOAD, TIMER_MILLIS} from '../../../shared/var-setting';
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
    messageComfirm = '';
    retryOpenGateVal = 0;
    retryOpenGateByTimeoutNocardVal = 0;
    retryReadCv2ocrVal = 0;
    retryReadCv2ocrVal_SN_10 = 0;
    retryReadCv2ocrVal_SN_11 = 0;
    messageFail = 'SCN-GEN-STEPS.RE-SCANER-MAX';
    messageAbort = 'SCN-GEN-STEPS.ABORT_CONFIRM';
    cardType = 1;
    fp_tmpl1_in_base64 = `Aiw3KG7NwbXqRIZfgGzzNPVE+k3x18SUlEGwrmhOabMCVmZMUz4nZbFds2f2x/rYkbgH3yeicpe7`
        + `kgi6Vac2prtPJ2xgdZA9MHOCeX5uYDGDb1mMkWBWf3NtiWytbnhtoZ6Bxlz//2YSRmjWbf9NREE9`;
    fp_tmpl2_in_base64 = `AiQ3JVXNwbWLr4agnL6QMt2uTZSlPcypGKVSvMNGrVJDT75VBcg1X2tMUGy5DxkneF4PHy53haC7` +
        `nJupvpAMR22yaWKDYX/Rw2SSi8aes8t5ler6In5P/FT/20/7TURVPQ==`;
    newReader_dor = null;
    newReader_icno = null;
    isHasCard = false;
    countNum = 30;
    flag = false;
    isAbort = false;
    openGateFlag = false;
    openCardFlag = false;
    isRestore = false;
    isfailure = false;
    isQuit = false;
    retryOpencardVal = 0;
    retryOpencardValNew = 0;
    SN_1 = 1;
    SN_2 = 2;
    SN_3 = 3;
    SN_4 = 4;
    SN_5 = 5;
    SN_6 = 6;
    SN_7 = 7;
    SN_8 = 8;
    SN_9 = 9;
    SN_10 = 10;
    SN_11 = 11;
    SN_12 = 12;
    SN_13 = 13;
    operType = 0;
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
                // this.processNewReader();
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
        if (this.cardType === 2) {
            this.localStorages.set('newReader_dor', this.newReader_dor);
            this.localStorages.set('newReader_icno', this.newReader_icno);
        }
        this.router.navigate(['/kgen-viewcard/processing'],
            {
                queryParams: {
                    'lang': this.translate.currentLang, 'cardType': this.cardType
                }
            });
        return;
    }

    timeExpire() {
        if (this.processing.visible) {
            this.processing.hide();
        }
        if (this.openGateFlag && !this.isfailure) {
                // S/N4
                if (this.retryOpenGateByTimeoutNocardVal < 3) {
                    this.messageRetry = 'SCN-GEN-STEPS.INSERT_CARD_SCREEN_S4';
                    this.retryOpenGateByTimeoutNocardVal += 1;
                    this.modalRetryOpenGate.show();
                } else {
                    // S/N4 f the retry limitexcess?
                    this.commonService.doLightoff('07');
                    this.messageFail = 'SCN-GEN-STEPS.READER-NEW-RFID-FAIL';
                    this.operType = this.SN_2;
                    this.isfailure = true;
                    this.modalFail.show();
                }
        } else {
            this.commonService.doCloseWindow();
        }
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
     * open card gate fun.
     */
    openGateFun() {
        console.log('call openGateFun fun.');
        this.commonService.doFlashLight('07');
        this.commonService.initTimerSet(this.timer, 1, 15)
        this.isfailure = false;
        this.service.sendRequestWithLog(CHANNEL_ID_RR_ICCOLLECT, 'opengate', { 'timeout': TIMEOUT_PAYLOAD })
            .subscribe((resp) => {
                if (resp && resp.errorcode !== undefined ) {
                    this.openGateFlag = true;
                    if (resp.errorcode === '0') {
                        this.commonService.doLightoff('07');
                        this.openCardFun();
                    } else if (resp.errorcode === 'D0009') {
                        // S/N3  have card in reader.
                        this.isHasCard = true;
                        this.messageFail = 'SCN-GEN-STEPS.INSERT_CARD_SCREEN_S3';
                        this.operType = this.SN_3;
                        this.isfailure = true;
                        this.modalFail.show();
                    } else if (resp.errorcode === 'D0006' || resp.errorcode === 'D000A') {
                        if (this.retryOpenGateVal < 3) {
                            this.messageRetry = 'SCN-GEN-STEPS.INSERT_CARD_SCREEN_S4';
                            this.modalRetryOpenGate.show();
                            this.retryOpenGateVal += 1;
                        } else {
                            // S/N4 f the retry limitexcess?
                            this.commonService.doLightoff('07');
                            this.openGateFlag = false;
                            this.messageComfirm = 'SCN-GEN-STEPS.INSERT_CARD_SCREEN_S6';
                            this.modal1Comfirm.show();
                        }
                    } else {
                        // Card reader intialization fail. Please request officers for assistance.
                        // 身份證閱讀器初始化失敗，請向職員查詢
                        this.messageFail = 'SCN-GEN-STEPS.INSERT_CARD_SCREEN_S2';
                        this.operType = this.SN_2;
                        this.isfailure = true;
                        this.modalFail.show();
                    }
                } else {
                    // Card reader intialization fail. System suspended
                    // S/N2
                    // 身份證閱讀器初始化失敗，系統暫停使用
                    this.messageFail = 'SCN-GEN-STEPS.INSERT_CARD_SCREEN_S2';
                    this.operType = this.SN_2;
                    this.isfailure = true;
                    this.modalFail.show();
                }
            }, (error) => {
                console.log('**********opengate:' + error);
                this.messageFail = 'SCN-GEN-STEPS.INSERT_CARD_SCREEN_S2';
                this.operType = this.SN_2;
                this.isfailure = true;
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
        console.log('call openCardFun fun.');
        this.processing.show();
        this.commonService.initTimerSet(this.timer, 1, 30)
        const payload = {
            'card_reader_id': null,
            'contactless_password': {
                'date_of_registration': null,
                'hkic_no': null
            }
        };
        this.service.sendRequestWithLog(CHANNEL_ID_RR_CARDREADER, 'opencard', payload).subscribe((resp) => {
            this.processing.hide();
            if ((JSON.stringify(resp) !== '{}' && resp.result === true) || (resp.result !== undefined && resp.result === true)) {
                this.commonService.doLightoff('07');
                this.cardType = resp.card_version;
                this.openCardFlag = true;
                this.nextRoute();
            } else {
                // open card failed S/N7
                if (this.retryOpencardVal < 3) {
                    this.messageRetry = 'SCN-GEN-STEPS.INSERT_CARD_SCREEN_S7';
                    this.retryOpencardVal += 1;
                    this.modalRetryOpenCard.show();
                } else {
                    this.messageComfirm = 'SCN-GEN-STEPS.INSERT_CARD_SCREEN_S6';
                    this.modal1Comfirm.show();
                }
            }
        }, (error) => {
            this.messageFail = 'SCN-GEN-STEPS.OCR_READER_SCREEN_S13';
            this.operType = this.SN_7;
            this.isfailure = true;
            this.modalFail.show();
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
        this.service.sendRequestWithLog(CHANNEL_ID_RR_CARDREADER, 'closecard').subscribe((resp) => {
            this.doReturnDocByTryagain();
        });
    }

    /**
     * try again.returndoc.
     */
    doReturnDocByTryagain() {
        this.service.sendRequestWithLog(CHANNEL_ID_RR_ICCOLLECT, 'returndoc').subscribe((resp) => {
            if (resp) {
                setTimeout(() => {
                    this.openGateFun();
                }, 1000);
            } else {
                this.messageFail = 'SCN-GEN-STEPS.READER-COLLECT-FAIL';
                this.modalFail.show();
            }
        });
    }

    processCancelQuit() {
        this.modal1Comfirm.hide();
        this.commonService.doCloseCard();
        this.commonService.doReturnDoc();
        this.backRoute();
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
        this.service.sendRequestWithLog(CHANNEL_ID_RR_CARDREADER, 'closecard').subscribe((resp) => {
            this.doReturnDocByOcr();
        });
    }

    /**
     * 退卡.
     */
    doReturnDocByOcr() {
        this.service.sendRequestWithLog(CHANNEL_ID_RR_ICCOLLECT, 'returndoc').subscribe((resp) => {
            if (resp) {
                setTimeout(() => {
                    this.processNewReader();
                }, 2000);
            } else {
                this.messageFail = 'SCN-GEN-STEPS.READER-COLLECT-FAIL';
                this.modalFail.show();
            }
        });
    }

    /**
     *  read new card data.
     */
    processNewReader() {
        this.commonService.doFlashLight('08');
        this.commonService.initTimerSet(this.timer, 1, 15)
        this.isfailure = false;
        this.openGateFlag = false;
        this.openCardFlag = false;
        this.readhkicv2ocrdata();
    }
    /**
     *  call readhkicv2ocrdata.
     */
    readhkicv2ocrdata() {
        console.log('start call readhkicv2ocrdata function');
        const payloadParam = {'ocr_reader_name':  'ARH ComboSmart' };
        this.service.sendRequestWithLog(CHANNEL_ID_RR_CARDREADER, 'readhkicv2ocrdata', payloadParam).subscribe((resp) => {
            if (resp.error_info !== undefined && resp.error_info.error_code === '0') {
                if (resp.ocr_data.length === 1) {
                    // S/N10
                    if (this.retryReadCv2ocrVal_SN_10 < 2) {
                        this.messageRetry = 'SCN-GEN-STEPS.OCR_READER_SCREEN_S10';
                        this.modalRetryOCR.show();
                        this.retryReadCv2ocrVal_SN_10 += 1;
                    } else {
                        this.messageFail = 'SCN-GEN-STEPS.OCR_READER_SCREEN_S13';
                        this.commonService.doLightoff('08');
                        this.operType = this.SN_10;
                        this.isfailure = true;
                        this.modalFail.show();
                    }

                } else if (resp.ocr_data.length === 2) {
                    // S/N11
                    if (this.retryReadCv2ocrVal_SN_11 < 2) {
                        this.messageRetry = 'SCN-GEN-STEPS.OCR_READER_SCREEN_S11';
                        this.modalRetryOCR.show();
                        this.retryReadCv2ocrVal_SN_11 += 1;
                    } else {
                        this.commonService.doLightoff('08');
                        this.messageFail = 'SCN-GEN-STEPS.OCR_READER_SCREEN_S13';
                        this.operType = this.SN_11;
                        this.isfailure = true;
                        this.modalFail.show();
                    }
                } else {
                    this.processNewReaderData(resp.ocr_data);
                    this.commonService.doLightoff('08');
                    // *************************************開始調用光學閱讀器的開卡服務opencard*****************************************
                    console.log('*************************************開始調用光學閱讀器的開卡服務opencard*****************************************');
                    this.openCardNewFun();
                }
            } else {
                this.commonService.doLightoff('08');
                this.messageFail = 'SCN-GEN-STEPS.OCR_READER_SCREEN_S8';
                this.operType = this.SN_8;
                this.isfailure = true;
                this.modalFail.show();
            }
        }, (error) => {
            this.messageFail = 'SCN-GEN-STEPS.OCR_READER_SCREEN_S8';
            this.operType = this.SN_8;
            this.isfailure = true;
            this.modalFail.show();
        });
    }

    /**
     * deal New Reader data.
     * @param {any[]} arrParam
     */
    processNewReaderData(arrParam: any[]) {
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
        console.log('call openCardNewFun fun.');
        this.processing.show();
        this.commonService.initTimerSet(this.timer, 1, 30)
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
                this.openCardFlag = true;
                this.nextRoute();
            } else {
                // open card failed S/N12
                this.messageRetry = 'SCN-GEN-STEPS.OCR_READER_SCREEN_S12';
                if (this.retryOpencardValNew < 2) {
                    this.retryOpencardValNew += 1;
                    this.modalRetryOCR.show();
                } else {
                    this.messageFail = 'SCN-GEN-STEPS.OCR_READER_SCREEN_S13';
                    this.operType = this.SN_13;
                    this.isfailure = true;
                    this.modalFail.show();
                }
            }
        }, (error) => {
            console.log('opencard ERROR ' + error);
            this.messageFail = 'SCN-GEN-STEPS.OCR_READER_SCREEN_S13';
            this.operType = this.SN_13;
            this.isfailure = true;
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
    /**
     * process fail quit fun.
     */
    processFailQuit() {
        this.modalFail.hide();
        if (this.operType === this.SN_2 || this.operType === this.SN_3 || this.operType === this.SN_4 ||
                 this.operType === this.SN_5 || this.operType === this.SN_6 || this.operType === this.SN_7) {
            this.cardType = 1;
        } else {
            this.cardType = 2;
        }
        if (this.openCardFlag) {
            this.doCloseCard();
        } else {
            if (this.openGateFlag) {
                this.doReturnDoc();
            }
        }
    }

    /**
     * show abort modal.
     */
    processModalShow() {
        this.modalQuit.show()
        if (this.processing.visible) {
            this.isRestore = true;
            this.processing.hide();
        }
    }

    /**
     * click abort button.
     */
    processQuit() {
        this.modalQuit.hide();
        if (this.processing.visible) {
            this.isRestore = true;
            this.processing.hide();
        }
        this.isAbort = true;
        this.isQuit = true;
        this.commonService.doLightoff('08');
        this.commonService.doLightoff('07');
        if (this.openCardFlag) {
            this.doCloseCard();
        } else {
            if (this.openGateFlag) {
                this.doReturnDoc();
            }
        }

    }

    /**
     * cancel abort operation
     */
    processCancel() {
        this.modalQuit.hide();
        if (this.isRestore) {
            this.processing.show();
        }
    }
    doCloseCard() {
        this.service.sendRequestWithLog(CHANNEL_ID_RR_CARDREADER, 'closecard').subscribe((resp) => {
            if (this.cardType === 1) {
                this.doReturnDoc();
            } else {
                if (this.isAbort) {
                    this.backRoute();
                } else {
                    this.commonService.initTimerSet(this.timer, 0, 5);
                }
            }
        }, (error) => {
            console.log('closecard ERROR ' + error);
            this.commonService.initTimerSet(this.timer, 0, 5);
        });
    }

    doReturnDoc() {
        this.service.sendRequestWithLog(CHANNEL_ID_RR_ICCOLLECT, 'returndoc').subscribe(() => {
            if (this.isAbort) {
                this.backRoute();
            } else {
                this.commonService.initTimerSet(this.timer, 0, 5);
            }
        }, (error) => {
            console.log('returndoc ERROR ' + error);
            this.commonService.initTimerSet(this.timer, 0, 5);
        });
    }
}
