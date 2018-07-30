import { Component, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MsksService } from '../../../shared/msks';
import { CHANNEL_ID_RR_CARDREADER, CHANNEL_ID_RR_ICCOLLECT, TIMEOUT_PAYLOAD } from '../../../shared/var-setting';
import { ConfirmComponent } from '../../../shared/sc2-confirm';
import { LocalStorageService } from '../../../shared/services/common-service/Local-storage.service';
import {CommonService} from '../../../shared/services/common-service/common.service';
import {ProcessingComponent} from '../../../shared/processing-component';

@Component({
    templateUrl: './step-insertcard.component.html',
    styleUrls: ['./step-insertcard.component.scss']
})
export class StepInsertcardComponent implements OnInit {

    @ViewChild('modalRetry')
    public modalRetry: ConfirmComponent;

    @ViewChild('modalFail')
    public modalFail: ConfirmComponent;

    @ViewChild('modalNoROP')
    public modalNoROP: ConfirmComponent;

    @ViewChild('processing')
    public processing: ProcessingComponent;
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
        if (this.cardType === 1) {
           // $('#newCard').hide();
           // $('#oldCard').show();
            this.processOldReader();
        } else {  // show new card
           // $('#oldCard').hide();
           // $('#newCard').show();

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
        // this.processing.show();
        const payloadParam = {'ocr_reader_name':  'ARH ComboSmart' };
        this.service.sendRequest(CHANNEL_ID_RR_CARDREADER, 'readhkicv2ocrdata', payloadParam).subscribe((resp) => {
            if (JSON.stringify(resp) !== '{}' && resp.error_info.error_code === '0') {
                if (resp.ocr_data.length === 1) {
                    if (this.retryReadCv2ocrVal < 2) {
                        // this.processing.hide();
                        this.messageRetry = 'SCN-GEN-STEPS.NO-CARD-OCR-READER';

                        this.modalRetry.show();
                        this.retryReadCv2ocrVal += 1;
                    } else {
                        // this.processing.hide();
                        this.messageFail = 'SCN-GEN-STEPS.READ-CARD-FAIL-TERMINATED';
                        this.modalFail.show();
                    }

                } else if (resp.ocr_data.length === 2) {
                    if (this.retryReadCv2ocrVal < 2) {
                        // this.processing.hide();
                        this.messageRetry = 'SCN-GEN-STEPS.CANNOT-IDENTIFY-TRY';

                        this.modalRetry.show();
                        this.retryReadCv2ocrVal += 1;
                    } else {
                        // this.processing.hide();
                        this.messageFail = 'SCN-GEN-STEPS.READ-CARD-FAIL-TERMINATED';
                        this.modalFail.show();
                    }

                } else {
                    this.processNewReaderData(resp.ocr_data);
                    // open card.
                    this.nextRoute();
                }
            } else {
                if (this.retryReadCv2ocrVal < 2) {
                    // this.processing.hide();
                    this.messageRetry = 'SCN-GEN-STEPS.OCR-READER-ERROR-TRY';

                    this.modalRetry.show();
                    this.retryReadCv2ocrVal += 1;
                } else {
                    // this.processing.hide();
                    this.messageFail = 'SCN-GEN-STEPS.READ-CARD-FAIL-TERMINATED';
                    this.modalFail.show();
                }
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
            this.messageFail = 'SCN-GEN-STEPS.CARD-ABNORMAL-NO-READ-DATA';
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
    /**
     * open card gate fun.
     */
    openGateFun() {
        console.log('call openGateFun fun.');
        // this.processing.show();
        this.service.sendRequest(CHANNEL_ID_RR_ICCOLLECT, 'opengate', { 'timeout': TIMEOUT_PAYLOAD })
            .subscribe((resp) => {
                if (resp) {
                    if (resp.errorcode === '0') {
                        this.commonService.doLightoff('07');
                        this.nextRoute();
                    } else if (resp.errorcode === 'D0009') {
                        this.isHasCard = true;
                        this.messageFail = 'SCN-GEN-STEPS.READER-HAVE-CARD-NOTE';
                        this.modalFail.show();
                    } else {
                        if (this.retryOpenGateVal < 2) {
                            // this.processing.hide();
                            // Card reader door has a problem, please try！
                            this.messageRetry = 'SCN-GEN-STEPS.READER-GATE-FAIL-TRY';
                            this.modalRetry.show();
                            this.retryOpenGateVal += 1;
                        } else {
                            // this.processing.hide();
                            this.messageFail = 'SCN-GEN-STEPS.OPEN-GATE-FAILED-MAX';
                            this.modalFail.show();
                        }
                    }
                } else {
                    if (this.retryOpenGateVal < 2) {
                        // this.processing.hide();
                        this.messageRetry = 'SCN-GEN-STEPS.READER-GATE-BAD';

                        this.modalRetry.show();
                        this.retryOpenGateVal += 1;
                    } else {
                        // this.processing.hide();
                        // The door has failed more than 3 times, please check!
                        this.messageFail = 'SCN-GEN-STEPS.OPEN-GATE-FAILED-MAX';
                        this.modalFail.show();
                    }
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
}
