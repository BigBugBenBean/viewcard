import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Component, OnInit, ViewChild} from '@angular/core';
import {MsksService} from '../../../shared/msks';
import {CHANNEL_ID_RR_CARDREADER, CHANNEL_ID_RR_ICCOLLECT} from '../../../shared/var-setting';
import {ConfirmComponent} from '../../../shared/sc2-confirm';
import {ProcessingComponent} from '../../../shared/processing-component';
import {LocalStorageService} from '../../../shared/services/common-service/Local-storage.service';
import {CommonService} from '../../../shared/services/common-service/common.service';
import {HttpClient, HttpHeaders} from '@angular/common/http';
@Component({
    templateUrl: './step-viewcard.component.html',
    styleUrls: ['./step-viewcard.component.scss']
})
export class StepViewcardComponent  implements OnInit {

    @ViewChild('modalRetry')
    public modalRetry: ConfirmComponent;

    @ViewChild('modalFail')
    public modalFail: ConfirmComponent;

    @ViewChild('modalNoROP')
    public modalNoROP: ConfirmComponent;

    @ViewChild('processing')
    public processing: ProcessingComponent;
    messageRetry: String = 'SCN-GEN-STEPS.RE-SCANER-FINGER';
    messageFail= 'SCN-GEN-STEPS.RE-SCANER-MAX';
    messageAbort= 'SCN-GEN-STEPS.ABORT_CONFIRM';
    title: string;
    api_path = ''
    img = '../../../../assets/images/photo1.jpg'; // set to '' if no image found or set to the Image path;

    buttonNum: Number = 2;
    cardType = 1;

    imges_base64 = '';
    carddata: any = {};
    showdata = false;
    carddataJson = '';
    losView = '不使用';
    cosView = '';
    los = '';
    constructor(private router: Router,
                private httpClient: HttpClient,
                private commonService: CommonService,
                private service: MsksService,
                private route: ActivatedRoute,
                private localStorages: LocalStorageService,
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
            this.carddataJson = this.localStorages.get('carddataJson');
            this.carddata = JSON.parse(this.carddataJson);
            this.los = this.carddata.los;
            if (this.los) {
                this.dealLosData(this.los);
            } else {
                this.losView = 'No Use';
                this.cosView = 'No Use';
            }
            this.showdata = true;
        });
    }
    /**
     * nextPage.
     */
    nextRoute() {
        this.router.navigate(['/kgen-viewcard/retrievecard'],
            { queryParams: {'lang': this.translate.currentLang, 'cardType': this.cardType}});
        return;
    }

    timeExpire() {
        setTimeout(() => {
            this.nextRoute();
        }, 500);
    }
    dealLosData(losParam) {
        const yearStr = losParam.substring(0,4);
        const monthStr = losParam.substring(4,6);
        const dayStr = losParam.substring(6,8)
        const str = dayStr +'-' + monthStr + '-'+ yearStr;
        this.losView = str;
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

    processFailQuit() {
        this.modalFail.hide();
        if (this.cardType === 1) {
            this.doReturnDoc();
        }
        this.backRoute();
    }

    doReturnDoc() {
        this.service.sendRequest(CHANNEL_ID_RR_ICCOLLECT, 'returndoc').subscribe(() => {});
    }

}
