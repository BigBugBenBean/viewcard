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

    @ViewChild('modal1')
    public modal1: ConfirmComponent;

    @ViewChild('modalNoROP')
    public modalNoROP: ConfirmComponent;

    @ViewChild('processing')
    public processing: ProcessingComponent;

    @ViewChild('timer')
    public timer: TimerComponent;
    messageRetry: String = 'SCN-GEN-STEPS.RE-SCANER-FINGER';
    retryOpenGateVal = 0;
    retryReadCv2ocrVal = 0;
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
    initTimer: any;
    flag = false;
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
            this.cardType = Number.parseInt(params['cardType']);
            this.cleanLocalstorageData();
            this.initPage();
        });
    }

    /**
     * init clean localstorage data.
     */
    cleanLocalstorageData() {
        if (this.cardType === 2) {
            this.localStorages.remove('newReader_dor');
            this.localStorages.remove('newReader_icno');
        }
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
        if (this.flag) {
            this.commonService.doLightoff('07');
            if (this.translate.currentLang === 'zh-HK') {
                this.messageFail = '超过30秒没有插卡，退出系统';
            } else {
                this.messageFail = 'No card for more than 30 seconds, exit the system';
            }
            this.modalFail.show();
        } else {
            setTimeout(() => {
                this.commonService.doCloseWindow();
            }, 500);
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
     * 重試.
     */
    failTryAgain() {
        this.modalRetry.hide();
        if (this.cardType === 1) {
            setTimeout(() => {
                this.openGateFun();
            }, 3000);

        } else {
            this.readNewCardByCv2ocrData();
        }
    }

    /**
     * init page.
     */
    initPage() {
        console.log('call init page fun.');
        // show old card
        $('#timerShowDiv').hide();
        if (this.cardType === 1) {
            this.processOldReader();
        } else {  // show new card
            this.processNewReader();
        }
    }

// ====================================================== Common End =======================================================================
// ====================================================== New Reader Start =================================================================

    /**
     *  read new card data.
     */
    processNewReader() {
        // step one.
        this.commonService.doFlashLight('08');
        this.readNewCardByCv2ocrData();
    }
    /**
     *  call readhkicv2ocrdata.
     */
    readNewCardByCv2ocrData() {
        const payloadParam = {'ocr_reader_name':  'ARH ComboSmart' };
        this.service.sendRequestWithLog(CHANNEL_ID_RR_CARDREADER, 'readhkicv2ocrdata', payloadParam).subscribe((resp) => {
            if (resp.error_info !== undefined && resp.error_info.error_code === '0') {
                if (resp.ocr_data.length === 1) {
                    if (this.retryReadCv2ocrVal < 2) {
                        this.messageRetry = 'SCN-GEN-STEPS.READER-NEW-NO-CARD';

                        this.modalRetry.show();
                        this.retryReadCv2ocrVal += 1;
                    } else {
                        this.messageFail = 'SCN-GEN-STEPS.REDAER-NEW-UNIDENTIFIED-CARD-LIMIT';
                        this.commonService.doLightoff('08');
                        this.modalFail.show();
                    }

                } else if (resp.ocr_data.length === 2) {
                    if (this.retryReadCv2ocrVal < 2) {
                        this.messageRetry = 'SCN-GEN-STEPS.READER-NEW-UNIDENTIFIED-CARD';
                        this.modalRetry.show();
                        this.retryReadCv2ocrVal += 1;
                    } else {
                        this.commonService.doLightoff('08');
                        this.messageFail = 'SCN-GEN-STEPS.REDAER-NEW-UNIDENTIFIED-CARD-LIMIT';
                        this.modalFail.show();
                    }

                } else {
                    this.processNewReaderData(resp.ocr_data);
                    this.commonService.doLightoff('08');
                    // open card.
                    this.nextRoute();
                }
            } else if (resp.error_info === undefined) {
                this.commonService.doLightoff('08');
                this.messageFail = 'SCN-GEN-STEPS.READER-NEW-INIT-FAIL';
                this.modalFail.show();
            } else {
                this.commonService.doLightoff('08');
                this.messageFail = 'SCN-GEN-STEPS.READ-CARD-FAIL-TERMINATED';
                this.modalFail.show();
            }
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
            this.messageFail = 'SCN-GEN-STEPS.READER-NEW-THIRD-CARD';
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
// ====================================================== New Reader End===================================================================
// ====================================================== Old Reader Start=================================================================
    /**
     *  read old card data,call opengate.
     */
    processOldReader() {
        this.commonService.doFlashLight('07');
        this.openGateFun();
    }

    /**
     * open card gate fun.
     */
    openGateFun() {
        console.log('call openGateFun fun.');
        // $('#timerShowDiv').show();
        // this.initTimer = setInterval(() => this.colck(), 1000);
        this.timer.sumSeconds = 3;
        this.flag = true;
        this.timer.initInterval();
        // this.service.sendRequest(CHANNEL_ID_RR_ICCOLLECT, 'opengate', { 'timeout': TIMEOUT_PAYLOAD })
        this.service.sendRequestWithLog(CHANNEL_ID_RR_ICCOLLECT, 'opengate', { 'timeout': TIMEOUT_PAYLOAD })
            .subscribe((resp) => {
                if (resp && resp.errorcode !== undefined ) {
                    if (resp.errorcode === '0') {
                        this.commonService.doLightoff('07');
                        this.nextRoute();
                    } else if (resp.errorcode === 'D0009') {
                        this.isHasCard = true;
                        this.messageFail = 'SCN-GEN-STEPS.READER-HAVE-CARD-NOTE';
                        this.modalFail.show();
                    } else if (resp.errorcode === 'D0006') {
                        if (this.retryOpenGateVal < 2) {
                            this.messageRetry = 'SCN-GEN-STEPS.READER-OLD-NO-CARD';
                            this.modalRetry.show();
                            this.retryOpenGateVal += 1;
                        } else {
                            this.commonService.doLightoff('07');
                            this.messageFail = 'SCN-GEN-STEPS.READER-NEW-THIRD-CARD';
                            this.modalFail.show();
                        }
                    } else {
                        // Card reader intialization fail. Please request officers for assistance.
                        // 身份證閱讀器初始化失敗，請向職員查詢
                        this.messageFail = 'SCN-GEN-STEPS.OPEN-GATE-INIT-FAIL';
                        this.modalFail.show();
                    }
                } else {
                    // Card reader intialization fail. System suspended
                    // 身份證閱讀器初始化失敗，系統暫停使用
                    this.messageFail = 'SCN-GEN-STEPS.OPEN-GATE-INIT-FAIL';
                    this.modalFail.show();
                }
            });
    }

// ====================================================== Old Reader End =================================================================
    /**
     * process fail quit fun.
     */
    processFailQuit() {
        this.modalFail.hide();
        if (this.cardType === 1) {
            this.commonService.doLightoff('07');
            this.commonService.doReturnDoc();
            // if (!this.isHasCard) {
            //     this.commonService.doReturnDoc();
            // }
        } else {
            this.commonService.doLightoff('08');
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
