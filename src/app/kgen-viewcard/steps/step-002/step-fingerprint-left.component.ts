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
    templateUrl: './step-fingerprint-left.component.html',
    styleUrls: ['./step-fingerprint-left.component.scss']
})

export class StepFingerprintLeftComponent implements OnInit {

    @ViewChild('modalRetry')
    public modalRetry: ConfirmComponent;

    @ViewChild('modalFail')
    public modalFail: ConfirmComponent;

    @ViewChild('modalQuit')
    public modalQuit: ConfirmComponent;

    @ViewChild('modalNoROP')
    public modalNoROP: ConfirmComponent;

    @ViewChild('processing')
    public processing: ProcessingComponent;

    @ViewChild('timer')
    public timer: TimerComponent;
    messageRetry: String = 'SCN-GEN-STEPS.RE-SCANER-FINGER';
    messageFail= 'SCN-GEN-STEPS.RE-SCANER-MAX';
    messageAbort= 'SCN-GEN-STEPS.ABORT_CONFIRM';
    fingerprintInfo = '1313213213';
    fingerCount = 0;
    maxFingerCount = 2;
    isRestore = false;
    isAbort = false;
    cardType = 1;
    retryVal = 0;
    retryVal_01 = 0;
    retryVal_02 = 0;
    retryVal_03 = 0;
    // fp_tmpl1_in_base64 = 'Aiw3KG7NwbXqRIZfgGzzNPVE+k3x18SUlEGwrmhOabMCVmZMUz4nZbFds2f2x/rYkbgH3yeicpe7kgi6Vac2prtPJ2xgdZA9MHOCeX5uYDGDb1mMkWBWf3NtiWytbnhtoZ6Bxlz//2YSRmjWbf9NREE9';
    // fp_tmpl2_in_base64 = 'AiQ3JVXNwbWLr4agnL6QMt2uTZSlPcypGKVSvMNGrVJDT75VBcg1X2tMUGy5DxkneF4PHy53haC7nJupvpAMR22yaWKDYX/Rw2SSi8aes8t5ler6In5P/FT/20/7TURVPQ==';

    // fp_tmpl1_in_base64 = `Aiw3KG7NwbXqRIZfgGzzNPVE+k3x18SUlEGwrmhOabMCVmZMUz4nZbFds2f2x/rYkbgH3yeicpe7`
    //     + `kgi6Vac2prtPJ2xgdZA9MHOCeX5uYDGDb1mMkWBWf3NtiWytbnhtoZ6Bxlz//2YSRmjWbf9NREE9`;
    // fp_tmpl2_in_base64 = `AiQ3JVXNwbWLr4agnL6QMt2uTZSlPcypGKVSvMNGrVJDT75VBcg1X2tMUGy5DxkneF4PHy53haC7` +
    //     `nJupvpAMR22yaWKDYX/Rw2SSi8aes8t5ler6In5P/FT/20/7TURVPQ==`;
    fp_tmpl1_in_base64 = '';
    fp_tmpl2_in_base64 = '';
    carddata: any = {};
    // left fingerprint
    // fptemp = 'ABA/NMwxQTVBIj83MzEzREE+MDE6Uko5RjQ5OEQxOz0yJTo4NkJEOTY6PzM8UTtBQjhFQkUUPDI9IzE3NDBBMjYIARAAAAsOBAAAAAEIAQALEA8ABAAAAAAAAAAAEARgCAUAAAAIABAAAAEGBAAAAAAIIAACEAcABABDAAAA+gAAEAQBCAwAAAAIABAAAAAwBADSAD0I5ACDEAoABAAAAAAAAAADEVQBCAAAAAAACAAAABEEAQAAAAgAAgARAAQDAAAAAAAACBECAAEEAAQAAAAACAAAABEEBAAAAAgAEAARAAQgAQAAAAAACBEAAAETAAQAAAAACAABABEEYAAAAAgAFAARAAQRAAAAAgAACBEAALASAAQAAAAACAABABEEFAAAAAgAFQARAAQWAAAAAAAACBEAAAAGAAQAAAAACAAAABEE/wAAAAgAIwARAAQkYAAAAQAACBECAAAhAAQAAAAACAAAABEEsAAAAAgAIgARAAQAFAAAAQAACBISAhAEAIAAAAgAAAASAAAFEQAAAAAABAgAAAAEJgAAEgAIAAASACAEAAAAAAgAAAASAAArIQAAAABZBAgCAK0O0T4AUwB7ACDsAb0Kag4AQLpvAAAxACBX1gAAPgCODuIgAH4Ol0AADQBfACA6AOYOkEIAPwqcAAGBACEcIQAAQACgDiYgAMAOfEAAWQDEACDFABgOpJgAQFixAADtABB63wAAPgDHDq8RAEAO1j4AMQDiACF9ALsOx6UAQMfOAAANABCAlwAAQADRCF8QAEkOlEAAngBrACExANYK2SEAPuLiAAAxACBd1gAAPgDlDuIgAJMO2z0ADwBJABB/Af8O6AEAQLHpAAHwABE7IwAAQAD7BhkhAIoJ2z0ADwBJABCnAaUO/g8AQBMEAADsABHSvQEAQAAFDroRAO4OokAAOAEgABBTANEOD3MBPnsaAADsABGrvQEAQAAkDroQAOUMPkAApAG0ABCBACEMJ/MBQCYpAABcABAv4gEAPwArDiMgAJgOvUAA7AG6ABVTANEOLnQBPntBAAATACDWQQEAQABWDqgQAKEOQ0AAggGbACSmAIMLXfABQJ5mAACEABB7hwEAQABrDoUhAO8LVT8AegHoACAVAIUOcsgBQJJ7AACCACDpQwEAQACFDpsgAP4OwkAAygGhABAVAIUOhtsBQJKgAACEABWEhwEAQACnDoUhAPEOhUAAFQGSACDyAGcOyX4BP4PtAAA6ACGL5gEAPwD4CgogALkH3T8AfgE8ACQAEzwxCAAAAAAACAAAABMEkgAAAAgAMwATAAQy2wAAAAAACBMAAJI1AAQAAAAACAC9ABMEngAAQQgAQA0TAAQA/wAAAE1BPT0=';
    fptemp = '';
    finger_num = 5;
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
        this.initParam();

    }

    /**
     * init param data.
     */
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
            this.initParamData();

        });
    }

    /**
     * init param Data.
     */
    initParamData() {
        this.fp_tmpl1_in_base64 = this.localStorages.get('fp_tmpl1_in_base64');
        this.fp_tmpl2_in_base64 = this.localStorages.get('fp_tmpl2_in_base64');
        this.fptemp = this.fp_tmpl2_in_base64;
        this.getfingernum(this.fptemp );
    }
    initPage() {
        console.log('call initPage');
        this.processing.hide();
        this.startFingerprintScan();

    }

    /**
     * nextPage.
     */
    nextRoute() {
        this.router.navigate(['/kgen-viewcard/fingerprintRight'],
            { queryParams: {'lang': this.translate.currentLang, 'cardType': this.cardType}});
        return;
    }

    timeExpire() {
        this.commonService.doCloseWindow();
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

    startFingerprintScan() {
        console.log('call startFingerprintScan');
        this.startFingerprintScanner();
    }

    /**
     *  start scanner fingerprint
     */
    startFingerprintScanner() {
        console.log('call : startFingerprintScanner fun.')
         this.service.sendRequestWithLog('RR_FPSCANNERREG', 'takephoto', {}).subscribe((resp) => {
        // this.service.sendRequest('RR_fptool', 'scanfp', {'arn': '', 'fp_img_format': 'bmp'}).subscribe((resp) => {
            this.processing.show();
            if (resp && resp.errorcode === '0') {
                if (resp.fpdata) {
                    // change  fingerprint data type
                    this.extractimgtmpl(resp.fpdata);
                } else {
                    if (this.retryVal_01 < 2) {
                        this.processing.hide();
                        this.messageRetry = 'SCN-GEN-STEPS.FINGERPRINT-NOT-DETECT-FINGER';
                        this.modalRetry.show();
                        this.retryVal_01 += 1;
                    } else {
                        this.processing.hide();
                        this.messageFail = 'SCN-GEN-STEPS.FINGERPRINT-NOT-DETECT-LIMT-MAX';
                        this.modalFail.show();
                    }
                }
            } else if (resp && (resp.errorcode === '20002' || resp.errorcode === '20006')) {
                if (this.retryVal_02 < 2) {
                    this.processing.hide();
                    this.messageRetry = 'SCN-GEN-STEPS.FINGERPRINT-NOT-DETECT-FINGER';
                    this.modalRetry.show();
                    this.retryVal_02 += 1;
                } else {
                    this.processing.hide();
                    this.messageFail = 'SCN-GEN-STEPS.FINGERPRINT-NOT-DETECT-LIMT-MAX';
                    this.modalFail.show();
                }
            } else {
                this.messageFail = 'SCN-GEN-STEPS.FINGERPRINT-DEVICE-EXCEPTION';
                this.processing.hide();
                this.modalFail.show();
            }
        }, (error) => {
             console.log('takephoto ERROR ' + error);
             this.messageFail = 'SCN-GEN-STEPS.FINGERPRINT-DEVICE-EXCEPTION';
             this.processing.hide();
             this.modalFail.show();
         });
    }

    /**
     *  data type change to Morpho_CFV
     * @param fpdata
     */
    extractimgtmpl (fpdata) {
        this.service.sendRequestWithLog('RR_fptool', 'extractimgtmpl',
            {'finger_num': this.finger_num, 'fp_tmpl_format': 'Morpho_PkCompV2', 'fp_img_in_base64': fpdata}).subscribe((resp) => {
            if (resp) {
                console.log(resp);
                this.verifytempl(this.fptemp, resp.fp_tmpl_in_base64);
            }
        }, (error) => {
            console.log('extractimgtmpl ERROR ' + error);
            this.doCloseCard();
        });
    }

    /**
     * fingerprint compare fun
     * @param fpdataLeftTemp
     * @param fpdataCurrentFpdata
     */
    verifytempl(fpdataLeftTemp, fpdataCurrentFpdata) {
        console.log('call verifytempl');
        this.service.sendRequestWithLog('RR_fptool', 'verifytmpl',
            {'fp_tmpl_format': 'Morpho_PkCompV2', 'fp_tmpl1_in_base64': fpdataLeftTemp, 'fp_tmpl2_in_base64': fpdataCurrentFpdata})
            .subscribe((resp) => {
                // old ,new pause fingerprint compare.
                this.nextRoute();
            if (resp.match_score) {
                if (this.cardType === 1) {
                    this.nextRoute();
                } else {
                    console.log(resp);
                    if (resp.match_score > 5000) {
                        console.log('compare scuess,pass');
                        this.nextRoute();
                    } else {
                        console.log('compare ');
                        // once again.
                        if (this.retryVal < 2) {
                            this.processing.hide();
                            this.modalRetry.show();
                            this.retryVal += 1;
                        } else {
                            this.processing.hide();
                            this.modalFail.show();
                        }
                    }
                }
            } else {
                if (this.cardType === 1) {
                    this.nextRoute();
                }
                if (this.retryVal < 2) {
                    this.processing.hide();
                    this.modalRetry.show();
                    this.retryVal += 1;
                } else {
                    this.processing.hide();
                    this.modalFail.show();
                }
            }
        }, (error) => {
                console.log('verifytmpl ERROR ' + error);
                this.doCloseCard();
        });
    }

    /**
     * 重試.
     */
    failTryAgain() {
        this.modalRetry.hide();
        this.startFingerprintScan();
    }

    processFailQuit() {
        this.modalFail.hide();
        this.doCloseCard();
    }

    processModalShow() {
        this.modalQuit.show()
        if (this.processing.visible) {
            this.isRestore = true;
            this.processing.hide();
        }
    }

    processQuit() {
        this.modalQuit.hide();
        if (this.processing.visible) {
            this.isRestore = true;
            this.processing.hide();
        }
        this.isAbort = true;
        this.doStopScan();
    }
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

    doStopScan() {
        this.service.sendRequestWithLog('RR_FPSCANNERREG', 'stopscan').subscribe(() => {
              this.doCloseCard();
        }, (error) => {
            console.log('stopscan ERROR ' + error);
            this.doCloseCard();
        });
    }

    /**
     * get finger num.
     * @param fp_tmpl_in_base64
     */
    getfingernum(fp_tmpl_in_base64) {
        const playloadParam =  {
            'arn': '',
            'fp_tmpl_format': 'Morpho_PkCompV2',
            'fp_tmpl_in_base64':  '' +
             fp_tmpl_in_base64
        }

        this.service.sendRequestWithLog('RR_fptool', 'getfingernum', playloadParam).subscribe((resp) => {
            if (JSON.stringify(resp) !== '{}') {
                console.log(resp);
                if (!isNaN(resp.finger_num)) {
                     this.finger_num = resp.finger_num;
                     // $('#finger_num_' + this.finger_num).css('display', 'block');
                    this.initPage();
                } else {
                    this.messageFail = 'SCN-GEN-STEPS.FINGERPRINT-NOT-MATCH-FINGER';
                    this.modalFail.show();
                }
            } else {
                this.messageFail = 'SCN-GEN-STEPS.READ-CARD-ERROR';
                this.modalFail.show();
            }
        }, (error) => {
            console.log('getfingernum ERROR ' + error);
            this.commonService.initTimerSet(this.timer, 0, 5);
        });

    }
}
