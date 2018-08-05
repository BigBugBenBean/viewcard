import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Component, OnInit, ViewChild} from '@angular/core';
import {MsksService} from '../../../shared/msks';
import {ConfirmComponent} from '../../../shared/sc2-confirm';
import {ProcessingComponent} from '../../../shared/processing-component';
import {LocalStorageService} from '../../../shared/services/common-service/Local-storage.service';
import {CommonService} from '../../../shared/services/common-service/common.service';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {TimerComponent} from '../../../shared/sc2-timer';
import {CHANNEL_ID_RR_CARDREADER, CHANNEL_ID_RR_ICCOLLECT} from '../../../shared/var-setting';
@Component({
    templateUrl: './step-viewcard.component.html',
    styleUrls: ['./step-viewcard.component.scss']
})
export class StepViewcardComponent  implements OnInit {

    @ViewChild('modalRetry')
    public modalRetry: ConfirmComponent;

    @ViewChild('modalFail')
    public modalFail: ConfirmComponent;

    @ViewChild('modalQuit')
    public modalQuit: ConfirmComponent;

    @ViewChild('timer')
    public timer: TimerComponent;

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
    isQuit = false;
    isRestore = false;
    isAbort = false;
    carddataJson = '';
    losView = 'SCN-GEN-STEPS.NOT-APPLICABLE';
    cosView = 'SCN-GEN-STEPS.NOT-APPLICABLE';
    hkic_number_view = '';
    name_ccc_view = '';
    date_of_birth_view = '';
    date_of_registration_view = '';
    date_of_first_registration_view = '';
    los = '';
    cos = '';
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
            this.cos = this.carddata.cos;
            if (this.los) {
                this.dealLosData(this.los);
                this.cosView = this.cos;
            } else {
                this.losView = 'SCN-GEN-STEPS.NOT-APPLICABLE';
                this.cosView = 'SCN-GEN-STEPS.NOT-APPLICABLE';
            }
            if (this.cardType === 1) {
                const icno = this.carddata.icno;
                const lengthNum = icno.length;
                const icon_format = icno.substring(0, lengthNum);
                const last_str = icno.substring(lengthNum - 1, lengthNum);
                this.hkic_number_view = icon_format + '(' + last_str + ')';
                this.name_ccc_view = this.processCCCName(this.carddata.ccc);
                this.date_of_birth_view = this.dealDate(this.carddata.dob);
                this.date_of_registration_view = this.dealDate(this.carddata.date_of_registration);
                this.date_of_first_registration_view = this.dealDateMonth(this.carddata.date_of_first_registration);
            } else {
                this.hkic_number_view = this.carddata.hkic_number;
                this.name_ccc_view = this.carddata.name_ccc;
                this.date_of_birth_view = this.dealDate(this.carddata.date_of_birth);
                this.date_of_registration_view = this.dealDate(this.carddata.date_of_ic_registration);
                this.date_of_first_registration_view = this.dealDateMonth(this.carddata.date_of_first_registration);
            }
            this.showdata = true;
            this.commonService.initTimerSet(this.timer, 1, 30);
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
        if (this.isQuit) {
           this.backRoute();
        } else {
            this.nextRoute();
        }

    }
    processCCCName(param) {
        const reg = /.{4}/g ;
        const rs = param.match(reg);
        const h = [];
        $.each(rs, function(i, v) {
            if (h.length > 0) {
                h.push('-' + v);
            } else {
                h.push(v);
            }
        })
        return h.join('');
    }
    dealLosData(losParam) {
        const yearStr = losParam.substring(0, 4);
        const monthStr = losParam.substring(4, 6);
        const dayStr = losParam.substring(6, 8)
        const str = dayStr + '-' + monthStr + '-' + yearStr;
        this.losView = str;
    }
    dealDate(paramDate) {
        const yearStr = paramDate.substring(0, 4);
        const monthStr = paramDate.substring(4, 6);
        const dayStr = paramDate.substring(6, 8)
        const str = dayStr + '-' + monthStr + '-' + yearStr;
        return str;
    }
    dealDateMonth(paramDate) {
        const yearStr = paramDate.substring(0, 4);
        const monthStr = paramDate.substring(4, 6);
        const str =  monthStr + '-' + yearStr;
        return str;
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
     *  start print
     */
    printBill() {
        const icnoStar = this.hkic_number_view.replace(/(\w)/g, function(a, b, c, d){return (c > 1 && c < 5) ? '*' : a});
        const date = new Date();
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const hour = date.getHours();
        const minute = date.getMinutes();
        const second = date.getSeconds();
        const datestr = day + '-' + month + '-' + year + '  ' + hour + ':' + minute + ':' + second;
        const printcontent =
            ' ******************************************** \n' +
            '           香港入境事務處\n' +
            '        Hong Kong Immigration Department\n' +
            ' ++++++++++++++++++++++++++++++++++++++++++++ \n' +
            ' 身份證明文件號碼: ' + icnoStar + '\n' +
            ' Identity document number:\n' +
            ' --------------------------------------------- \n' +
            ' 交易類別:          查詢預約申領香港智能身份證 \n' +
            ' Type of service:   Enquiry appointment booking \n' +
            '                    for IC application \n' +
            ' -------------------------------------------- \n' +
            '  交易狀態:                完成   \n' +
            '  Transaction state:       Completed     \n' +
            ' -------------------------------------------- \n' +
            '  日期及時間:     ' + datestr + '\n' +
            '  Date and time\n' +
            ' -------------------------------------------- \n' +
            '  交易參考編號:  5791 7092 0600 1323\n' +
            '  Transaction reference number:\n' +
            ' --------------------------------------------- \n' +
            '  備註:                     不適用\n' +
            '  Remark:                 Unavailable\n' +
            ' ********************************************* \n' ;
        const dataJson = [
            {
                'type': 'txt',
                'data': printcontent,
                'height': '600',
                'leftMargin': '10',
                'attribute': 'normal'
            },
            {
                'type': 'vspace',
                'data': '100',
                'height': '',
                'leftMargin': '',
                'attribute': ''
            },
            {
                'type': 'cutpaper',
                'data': '',
                'height': '',
                'leftMargin': '',
                'attribute': 'full'
            },
        ];
        console.log('call : printslip fun.' + JSON.stringify(dataJson))
        this.printSlip(dataJson);
    }
    printSlip(dataJson) {
        console.log('call : printslip fun.' + JSON.stringify(dataJson))
        this.service.sendRequestWithLog('RR_SLIPPRINTER', 'printslip', {'data': dataJson}).subscribe((resp) => {
            if (resp.errorcode === '0') {
                console.log('printslip operate success');
               // this.printCut();
            } else {
                console.log('call printslip fail!');
            }
        });
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
        this.doCloseCard();
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
            console.log('extractimgtmpl ERROR ' + error);
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
            console.log('extractimgtmpl ERROR ' + error);
            this.commonService.initTimerSet(this.timer, 0, 5);
        });
    }

}
