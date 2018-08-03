import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ProcessingComponent} from '../../../shared/processing-component';
import {CommonService} from '../../../shared/services/common-service/common.service';
import {MsksService} from '../../../shared/msks';
import {ConfirmComponent} from '../../../shared/sc2-confirm';
import {LocalStorageService} from '../../../shared/services/common-service/Local-storage.service';
import {TranslateService} from '@ngx-translate/core';
import {CHANNEL_ID_RR_CARDREADER} from '../../../shared/var-setting';

@Component({
    templateUrl: './step-processing.component.html',
    styleUrls: ['./step-processing.component.scss']
})
export class StepProcessingComponent implements OnInit {

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
    messageRetry = 'SCN-GEN-STEPS.RE-SCANER-FINGER';
    retryOpencardVal = 0;
    messageFail = 'SCN-GEN-STEPS.RE-SCANER-MAX';
    messageAbort = 'SCN-GEN-STEPS.ABORT_CONFIRM';
    cardType = 1;
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
            this.cleanLocalstorageData();
            this.initPage();
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
        this.localStorages.set('fp_tmpl1_in_base64', this.fp_tmpl1_in_base64);
        this.localStorages.set('fp_tmpl2_in_base64', this.fp_tmpl2_in_base64);
        this.localStorages.set('carddataJson', this.carddataJson);
        this.router.navigate(['/kgen-viewcard/fingerprintLeft'],
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
// ====================================================== New Reader Start =================================================================
    /**
     *  read data from new reader.
     */
    readhkicv2() {
        this.service.sendRequestWithLog(CHANNEL_ID_RR_CARDREADER, 'readhkicv2').subscribe((resp) => {
            this.carddata = {...resp};
            this.fp_tmpl1_in_base64 = resp.fingerprint0;
            this.fp_tmpl2_in_base64 = resp.fingerprint1;
            this.carddataJson = JSON.stringify(this.carddata);
            this.processing.hide();
            this.nextRoute();
        });
    }

// ====================================================== New Reader End===================================================================
// ====================================================== Old Reader Start=================================================================
    readhkicv1() {
        this.service.sendRequestWithLog(CHANNEL_ID_RR_CARDREADER, 'readhkicv1').subscribe((resp) => {
            this.carddata = {...resp};
            this.fp_tmpl1_in_base64 = resp.fingerprint0;
            this.fp_tmpl2_in_base64 = resp.fingerprint1;
            this.carddataJson = JSON.stringify(this.carddata);
            this.processing.hide();
            this.nextRoute();
        });
    }
// ====================================================== Old Reader End ================================================================

    /**
     * process fail quit fun.
     */
    processFailQuit() {

        this.modalFail.hide();
        this.commonService.doCloseCard();
        if (this.cardType === 1) {
            this.commonService.doReturnDoc();
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
