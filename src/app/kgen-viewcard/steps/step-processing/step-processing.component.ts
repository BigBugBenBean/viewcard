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
    newReader_dor = null;
    newReader_icno = null;
    carddata: any = {};
    carddataJson = '';
    oldCardNoFlag = false;
    isRestore = false;
    isAbort = false;
    timeOutPause = false;

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
    initParam() {
        this.processing.show();
        this.route.queryParams.subscribe(params => {
            const lang = params['lang'];
            if ('en-US' === lang) {
                this.translate.use('en-US');
            } else {
                this.translate.use('zh-HK');
            }
            this.translate.currentLang = lang;
            this.cardType = Number.parseInt(params['cardType']);
           this.readType = Number.parseInt(this.localStorages.get('readType'));
            this.cleanLocalstorageData();
            this.initPage();
          //  debugger;
           // this.handleFingerNumber(this.fp_tmpl1_in_base64, this.fp_tmpl2_in_base64);
        });
    }
    /**
     * init page.
     */
    initPage() {
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
        this.localStorages.set('fp_tmpl1_in_base64', this.fp_tmpl1_in_base64);
        this.localStorages.set('fp_tmpl2_in_base64', this.fp_tmpl2_in_base64);
        this.localStorages.set('fp_tmpl1_fingernum', '0');
        this.localStorages.set('fp_tmpl2_fingernum', '5');
        this.localStorages.set('carddataJson', this.carddataJson);
        this.router.navigate(['/kgen-viewcard/fingerprint'],
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
        if (this.modalRetry.visible) {
            this.modalRetry.hide();
        }
        if (this.modalFail.visible) {
            this.modalFail.hide();
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
                        this.nextRoute();
                    });
                } else {
                    this.localStorages.set('fp_tmpl2_fingernum', null);
                    this.processing.hide();
                    this.nextRoute();
                }
            });
        } else {
            this.localStorages.set('fp_tmpl1_fingernum', null);
            if (!this.commonService.checkFpNull(fp_tmpl2_in_base64)) {
                this.getFingerNumber(fp_tmpl2_in_base64, (rp2) => {
                    this.localStorages.set('fp_tmpl2_fingernum', rp2.finger_num.toString());
                    this.processing.hide();
                    this.nextRoute();
                });
            } else {
                this.localStorages.set('fp_tmpl2_fingernum', null);
                this.processing.hide();
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
                debugger;
                if (resp.error_info.error_code === '0') {
                    // resp.finger_num = Math.floor(Math.random() * Math.floor(10)).toString();
                    callback(resp);
                } else {
                    this.messageFail = 'SCN-GEN-STEPS.FINGERPRINT-NOT-MATCH-FINGER';
                    if (this.isAbort || this.timeOutPause) {
                        return;
                    }
                    this.modalFail.show();
                }
        }, (error) => {
            console.log('getfingernum ERROR ' + error);
            this.messageFail = 'SCN-GEN-STEPS.FINGERPRINT-NOT-MATCH-FINGER';
            if (this.isAbort || this.timeOutPause) {
                return;
            }
            this.modalFail.show();
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
            this.carddata = {...resp};
            this.fp_tmpl1_in_base64 = resp.fingerprint0;
            this.fp_tmpl2_in_base64 = resp.fingerprint1;
            this.carddataJson = JSON.stringify(this.carddata);
            //this.handleFingerNumber(this.fp_tmpl1_in_base64, this.fp_tmpl2_in_base64);
            this.nextRoute();
        });
    }

// ====================================================== New Reader End===================================================================
// ====================================================== Old Reader Start=================================================================
    readhkicv1() {
        if (this.isAbort || this.timeOutPause) {
            return;
        }
        this.service.sendRequestWithLog(CHANNEL_ID_RR_CARDREADER, 'readhkicv1').subscribe((resp) => {
            this.carddata = {...resp};
            this.fp_tmpl1_in_base64 = resp.fingerprint0;
            this.fp_tmpl2_in_base64 = resp.fingerprint1;
            this.carddataJson = JSON.stringify(this.carddata);
            //this.handleFingerNumber(this.fp_tmpl1_in_base64, this.fp_tmpl2_in_base64);
            this.nextRoute();
        });
    }
// ====================================================== Old Reader End ================================================================

    timeExpire() {
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
        }, 5000);
    }


    processTimeoutQuit() {
        this.modalTimeout.hide();
        this.doCloseCard();
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
        this.cancelQuitEnabledAll();
        if (this.isRestore) {
            this.processing.show();
        }
    }
    doCloseCard() {
        this.processing.show();
        this.service.sendRequestWithLog(CHANNEL_ID_RR_CARDREADER, 'closecard').subscribe((resp) => {
            if (this.readType === 1) {
                this.doReturnDoc();
                setTimeout(() => {
                    this.backRoute();
                }, 2000);
            } else {
                this.backRoute();
            }
        }, (error) => {
            console.log('extractimgtmpl ERROR ' + error);
            this.backRoute();
        });
    }

    doReturnDoc() {
        this.service.sendRequestWithLog(CHANNEL_ID_RR_ICCOLLECT, 'returndoc').subscribe(() => {});
    }
}
