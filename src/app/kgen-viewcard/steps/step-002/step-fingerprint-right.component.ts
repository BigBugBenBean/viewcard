import {Component, OnInit, ViewChild} from '@angular/core';
import {MsksService} from '../../../shared/msks';
import {TranslateService} from '@ngx-translate/core';
import {FingerprintService} from '../../../shared/services/fingerprint-service/fingerprint.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ConfirmComponent} from '../../../shared/sc2-confirm';
import {LocalStorageService} from '../../../shared/services/common-service/Local-storage.service';
import {ProcessingComponent} from '../../../shared/processing-component';
import {CommonService} from '../../../shared/services/common-service/common.service';
import {CHANNEL_ID_RR_ICCOLLECT} from '../../../shared/var-setting';
import {TimerComponent} from '../../../shared/sc2-timer';
@Component({
    templateUrl: './step-fingerprint-right.component.html',
    styleUrls: ['./step-fingerprint-right.component.scss']
})
export class StepFingerprintRightComponent implements OnInit {

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
    isRestore = false;
    cardType = 1;
    retryVal = 0;
    retryVal_01 = 0;
    retryVal_02 = 0;
    retryVal_03 = 0;
    // fp_tmpl1_in_base64 = 'Aiw3KG7NwbXqRIZfgGzzNPVE+k3x18SUlEGwrmhOabMCVmZMUz4nZbFds2f2x/rYkbgH3yeicpe7kgi6Vac2prtPJ2xgdZA9MHOCeX5uYDGDb1mMkWBWf3NtiWytbnhtoZ6Bxlz//2YSRmjWbf9NREE9';
    // fp_tmpl2_in_base64 = 'AiQ3JVXNwbWLr4agnL6QMt2uTZSlPcypGKVSvMNGrVJDT75VBcg1X2tMUGy5DxkneF4PHy53haC7nJupvpAMR22yaWKDYX/Rw2SSi8aes8t5ler6In5P/FT/20/7TURVPQ==';
    fp_tmpl1_in_base64 = `Aiw3KG7NwbXqRIZfgGzzNPVE+k3x18SUlEGwrmhOabMCVmZMUz4nZbFds2f2x/rYkbgH3yeicpe7`
        + `kgi6Vac2prtPJ2xgdZA9MHOCeX5uYDGDb1mMkWBWf3NtiWytbnhtoZ6Bxlz//2YSRmjWbf9NREE9`;
    fp_tmpl2_in_base64 = `AiQ3JVXNwbWLr4agnL6QMt2uTZSlPcypGKVSvMNGrVJDT75VBcg1X2tMUGy5DxkneF4PHy53haC7` +
        `nJupvpAMR22yaWKDYX/Rw2SSi8aes8t5ler6In5P/FT/20/7TURVPQ==`;
    carddata: any = {};

    finger_num = 0;
    // right fingerprint
    fptemp = 'ABA/NBw2QTVBIj83MzEzREE+MDE6Uko5RjQ5OEQxOz0yJTo4NkJEOTY6PzM8UTtBQjhFQkUUPDI9IzE3NDBBMjYIARAAAAsOBAAAAAEIAQALEA8ABAAAAAAAAAAAEARgCAUAAAAIABAAAAEGBAAAAAAIIAACEAcABABDAAAA+gAAEAQBCAwAAAAIABAAAAAwBADKAP8IdAClEAoABAAAAAAAAAADEYQBCAAAAAAACAAAABEEAQAAAAgAAgARAAQDAAAAAAAACBECAAEEAAQAAAAACAAAABEEBAAAAAgAEAARAAQgAQAAAAAACBEAAAETAAQAAAAACAABABEEYAAAAAgAFAARAAQRAAAAAgAACBEAALASAAQAAAAACAABABEEHAAAAAgAFQARAAQWAAAAAAAACBEAAAAGAAQAAAAACAAAABEE/wAAAAgAIwARAAQkYAAAAQAACBECAAAhAAQAAAAACAAAABEEsAAAAAgAIgARAAQAHAAAAQAACBISAhAEALAAAAgAAAASAAAFEQAAAAAABAgAAAAEJgAAEgAIAAASACAEAAAAAAgAAAASAAAvIQAAAABlNAgCAIsOnkAAWgA5ACGjABwOcoQAQD+EAAA1ACH8PAAAQACUDsEhAEMMl0AADQBfACDrAJsOlYAAQEWbAABaABC/ngAAQACfDjkhASQIH0AAEgAzACDLAOQNqFAAPhaoAABaABD8ngAAQACrDjkhAGQNGkAANABMABB9ALsOrtgAQMezAADrACDTmwAAQADIDkUhAHMOGEAAxQBYABA1ADwOyaQAQMHMAAESABEpHwAAQADSDTMRALkOnkAAWgA5ABEPANsH2L8APUncAAGjABA1HAAAQADhCD8hAC8OFUAAVgBlACAxANYO5UAAPuLsAAAxACBd1gAAPgD6DuIhAMgOHEAAowA/ABDnABMM/CgAQHEGAAAPACHO2wEAPQAQDkkgAL0OGkAANAFMABCjARwOESABQD8YAAA1ABD/PAEAQAAjDcEQARsNnkAAWgE5ABFaAZ4LKwkBQDksAAFZABAXfAEAQAAvC8QQAJUO0T4AUwF7ABCjABwOM/YBQD88AABWABCfFQEAQABADmURAMgOGEAAxQFYABGjABwOS/8BQD9NAACEACAohwEAQABZCoUgAQIOu0AAfQHHACB+AN0OYE8BPzxnAAA0ACDlGgEAQAB0DkwhAIAO3T8AfgE8ABF4ABEOgooBQH6DAAAxACCq1gEAPgCKDuIgALoOlEAAngFrACBaAZ4Oig8BQDmaAAANACDklwEAQAC4Dl8hAL4Ox0AAqAGIACFeAAQK6LcBQJgIABMAACQAPAAAAAgAMQATAAQzjQAAAAAACBMAAN4yAAQAAAAACAAAABMEjQAAAAgANQATAARACUEAbQAVCBMEAAAA/wAAAE5RPT0=';
        constructor(private router: Router,
                private commonService: CommonService,
                private route: ActivatedRoute,
                private service: MsksService,
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
        this.fptemp = this.fp_tmpl1_in_base64;
        this.getfingernum(this.fptemp );
    }

    initPage() {
        console.log('call initPage');
        this.startFingerprintScan();
    }

    /**
     * nextPage.
     */
    nextRoute() {
        this.router.navigate(['/kgen-viewcard/viewcard'],
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
     * process Right fingerprint fun.
     */
    processRightFingerprint() {
        console.log('call processRightFingerprint');
    }

    /**
     *  start scanner fingerprint
     */
    startFingerprintScanner() {
        console.log('call : startFingerprintScanner fun.')
         this.service.sendRequestWithLog('RR_FPSCANNERREG', 'takephoto', {'icno': 'A123456'}).subscribe((resp) => {
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
        });
    }

    /**
     * fingerprint compare fun
     * @param fpdata
     */
    verifytempl(fpdataLeftTemp, fpdataCurrentFpdata) {
        console.log('call verifytempl');
        this.service.sendRequestWithLog('RR_fptool', 'verifytmpl',
            {'fp_tmpl_format': 'Morpho_PkCompV2', 'fp_tmpl1_in_base64': fpdataLeftTemp, 'fp_tmpl2_in_base64': fpdataCurrentFpdata})
            .subscribe((resp) => {
                // old ,new pause fingerprint compare.
                this.nextRoute();
                if (resp.match_score) {
                    console.log(resp);
                    if (this.cardType === 1) {
                        this.nextRoute();
                    } else {
                        if (resp.match_score > 5000) {
                            console.log('compare scuess,pass');
                            this.processing.hide();
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
            });
    }

    /**
     * 重試.
     */
    failTryAgain() {
        this.modalRetry.hide();
        this.startFingerprintScan();
    }

    processModalShow() {
        this.modalQuit.show()
        if (this.processing.visible) {
            this.isRestore = true;
            this.processing.hide();
        }
    }

    processFailQuit() {
        this.modalFail.hide();
        if (this.cardType === 1) {
            this.commonService.doReturnDoc();
        }
        this.commonService.initTimerSet(this.timer, 0, 5);
    }

    processQuit() {
        this.modalQuit.hide();
        if (this.processing.visible) {
            this.isRestore = true;
            this.processing.hide();
        }
        if (this.cardType === 1) {
            this.commonService.doReturnDoc();
        }
        this.commonService.initTimerSet(this.timer, 0, 5);
    }
    processCancel() {
        this.modalQuit.hide();
        if (this.isRestore) {
            this.processing.show();
        }
    }
    getfingernum(fp_tmpl_in_base64) {
        const playloadParam =  {
            'arn': '',
            'fp_tmpl_format': 'Morpho_PkCompV2',
            'fp_tmpl_in_base64': ' ' +
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
        });
    }
}
