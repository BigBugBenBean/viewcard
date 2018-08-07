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
    templateUrl: './step-fingerprint.component.html',
    styleUrls: ['./step-fingerprint.component.scss']
})

export class StepFingerprintComponent implements OnInit {

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
    timeOutPause = false;
    cardType = 1;
    readType = 1;
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
    fp_tmpl1_fingernum = '';
    fp_tmpl2_fingernum = '';
    carddata: any = {};
    allFingerNum = [];
    fpTmpl1: string;
    fpTmpl2: string;
    fpTmpl2B: string;

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
            this.readType = Number.parseInt(this.localStorages.get('readType'));
            this.initParamData();

        });
    }

    /**
     * init param Data.
     */
    initParamData() {
        this.fp_tmpl1_in_base64 = this.localStorages.get('fp_tmpl1_in_base64');
        this.fp_tmpl2_in_base64 = this.localStorages.get('fp_tmpl2_in_base64');
        this.fp_tmpl1_fingernum = this.localStorages.get('fp_tmpl1_fingernum');
        this.fp_tmpl2_fingernum = this.localStorages.get('fp_tmpl2_fingernum');
         // this.fp_tmpl1_fingernum = '0';
         // this.fp_tmpl2_fingernum = '5';
        this.fptemp = this.fp_tmpl2_in_base64;
        if (this.commonService.checkFpNull(this.fp_tmpl1_in_base64) && !this.commonService.checkFpNull(this.fp_tmpl2_in_base64)) {
            this.fp_tmpl1_in_base64 = this.fp_tmpl2_in_base64;
            this.maxFingerCount = 1;
        } else if (this.commonService.checkFpNull(this.fp_tmpl2_in_base64)) {
            this.maxFingerCount = 1;
        }
        this.getFinger();
    }

    /**
     * nextPage.
     */
    nextRoute() {
        if (this.timeOutPause || this.isAbort) {
            return;
        }
        this.router.navigate(['/kgen-viewcard/viewcard'],
            { queryParams: {'lang': this.translate.currentLang, 'cardType': this.cardType}});
         return;
    }

    timeExpire() {
        this.timeOutPause = true;
        if (this.processing.visible) {
            this.processing.hide();
        }
        if (this.modalRetry.visible) {
            this.modalRetry.hide();
        }
        if (this.modalQuit.visible) {
            this.modalQuit.hide();
        }
        this.messageFail = 'SCN-GEN-STEPS.MESSAGE-TIMEOUT';
        this.modalFail.show();
    }
    /**
     * backPage.
     */
    backRoute() {
        this.timeOutPause = true;
        if (this.processing.visible) {
            this.processing.hide();
        }
        if (this.modalRetry.visible) {
            this.modalRetry.hide();
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

    startFingerprintScan() {
        console.log('call startFingerprintScan');
        if (this.isAbort || this.timeOutPause) {
            return;
        }
        this.startFingerprintScanner();
    }

    getFinger() {
        // this.modalInfo.hide();
        console.log('this.fingerCount: ', this.fingerCount);
        this.fingerCount++;
        // alert('fp_tmpl1_fingernum=' + this.fp_tmpl1_fingernum + ',fp_tmpl2_fingernum= this.fp_tmpl2_fingernum');
        if (!this.commonService.checkFpNull(this.fp_tmpl1_fingernum)) {
            this.allFingerNum.push('fp' + this.fp_tmpl1_fingernum);
        }
        if (!this.commonService.checkFpNull(this.fp_tmpl2_fingernum)) {
            this.allFingerNum.push('fp' + this.fp_tmpl2_fingernum);
        }
        // this.allFingerNum.push('fp0');
        // this.allFingerNum.push('fp6');
        // if (this.allFingerNum.length < 1) {
        // }
        // if (this.fingerCount > 1) {
        //     // this.allFingerNum.push('fp' + this.fp_tmpl2_in_base64);
        //     this.allFingerNum.push('fp' + this.fp_tmpl2_fingernum);
        // } else {
        //     this.allFingerNum.push('fp' + this.fp_tmpl1_fingernum);
        // }
        if (this.fingerCount !== this.maxFingerCount || this.maxFingerCount === 1) {
            this.processing.hide();
            this.startFingerprintScan();
        }
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
                        if (this.isAbort || this.timeOutPause) {
                            return;
                        }
                        this.modalRetry.show();
                        this.retryVal_01 += 1;
                    } else {
                        this.processing.hide();
                        this.messageFail = 'SCN-GEN-STEPS.FINGERPRINT-NOT-DETECT-LIMT-MAX';
                        if (this.isAbort || this.timeOutPause) {
                            return;
                        }
                        this.modalFail.show();
                    }
                }
            } else if (resp && (resp.errorcode === '20002' || resp.errorcode === '20006')) {
                if (this.retryVal_02 < 2) {
                    this.processing.hide();
                    this.messageRetry = 'SCN-GEN-STEPS.FINGERPRINT-NOT-DETECT-FINGER';
                    if (this.isAbort || this.timeOutPause) {
                        return;
                    }
                    this.modalRetry.show();
                    this.retryVal_02 += 1;
                } else {
                    this.processing.hide();
                    this.messageFail = 'SCN-GEN-STEPS.FINGERPRINT-NOT-DETECT-LIMT-MAX';
                    if (this.isAbort || this.timeOutPause) {
                        return;
                    }
                    this.modalFail.show();
                }
            } else {
                this.messageFail = 'SCN-GEN-STEPS.FINGERPRINT-DEVICE-EXCEPTION';
                this.processing.hide();
                if (this.isAbort || this.timeOutPause) {
                    return;
                }
                this.modalFail.show();
            }
        }, (error) => {
            console.log('takephoto ERROR ' + error);
            this.messageFail = 'SCN-GEN-STEPS.FINGERPRINT-DEVICE-EXCEPTION';
            this.processing.hide();
            if (this.isAbort || this.timeOutPause) {
                return;
            }
            this.modalFail.show();
        });
    }

    /**
     *  data type change to Morpho_CFV
     * @param fpdata
     */
    extractimgtmpl (fpdata) {
        if (this.isAbort || this.timeOutPause) {
            return;
        }
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
        if (this.isAbort || this.timeOutPause) {
            return;
        }
        this.service.sendRequestWithLog('RR_fptool', 'verifytmpl',
            {'fp_tmpl_format': 'Morpho_PkCompV2', 'fp_tmpl1_in_base64': fpdataLeftTemp, 'fp_tmpl2_in_base64': fpdataCurrentFpdata})
            .subscribe((resp) => {
                // old ,new pause fingerprint compare.
                this.nextRoute();
                if (resp.match_score) {
                    if (this.cardType === 1) {
                        if (this.isAbort || this.timeOutPause) {
                            return;
                        }
                        this.nextRoute();
                    } else {
                        console.log(resp);
                        if (resp.match_score > 5000) {
                            console.log('compare scuess,pass');
                            if (this.isAbort || this.timeOutPause) {
                                return;
                            }
                            this.nextRoute();
                        } else {
                            console.log('compare ');
                            // once again.
                            if (this.retryVal < 2) {
                                this.processing.hide();
                                if (this.isAbort || this.timeOutPause) {
                                    return;
                                }
                                this.modalRetry.show();
                                this.retryVal += 1;
                            } else {
                                this.processing.hide();
                                if (this.isAbort || this.timeOutPause) {
                                    return;
                                }
                                this.modalFail.show();
                            }
                        }
                    }
                } else {
                    if (this.cardType === 1) {
                        if (this.isAbort || this.timeOutPause) {
                            return;
                        }
                        this.nextRoute();
                    }
                    if (this.retryVal < 2) {
                        this.processing.hide();
                        if (this.isAbort || this.timeOutPause) {
                            return;
                        }
                        this.modalRetry.show();
                        this.retryVal += 1;
                    } else {
                        this.processing.hide();
                        if (this.isAbort || this.timeOutPause) {
                            return;
                        }
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
            this.processing.hide();
        }
        this.isAbort = true;
        this.doCloseCard();
    }
    processCancel() {
        this.modalQuit.hide();
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
            console.log('closecard ERROR ' + error);
            this.backRoute();
        });
    }

    doReturnDoc() {
        this.service.sendRequestWithLog(CHANNEL_ID_RR_ICCOLLECT, 'returndoc').subscribe(() => {});
    }
}
