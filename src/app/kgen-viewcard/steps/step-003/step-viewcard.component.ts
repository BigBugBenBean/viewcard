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

    @ViewChild('modalTimeout')
    public modalTimeout: ConfirmComponent;

    @ViewChild('modalPrintBill')
    public modalPrintBill: ConfirmComponent;

    @ViewChild('timer')
    public timer: TimerComponent;

    @ViewChild('processing')
    public processing: ProcessingComponent;
    messageRetry: String = 'SCN-GEN-STEPS.RE-SCANER-FINGER';
    messageFail= 'SCN-GEN-STEPS.RE-SCANER-MAX';
    messageAbort= 'SCN-GEN-STEPS.ABORT_CONFIRM';
    messagePrint = 'SCN-GEN-STEPS.BILL-PRINT-MESSAGE';
    messageTimeout = 'SCN-GEN-STEPS.MESSAGE-TIMEOUT';
    title: string;
    api_path = ''
    img = '../../../../assets/images/photo1.jpg'; // set to '' if no image found or set to the Image path;

    buttonNum: Number = 2;
    cardType = 1;
    readType = 1;
    imges_base64 = '';
    carddata: any = {};
    showdata = false;
    isQuit = false;
    isRestore = false;
    isAbort = false;
    timeOutPause = false;
    carddataJson = '';
    losView = 'SCN-GEN-STEPS.NOT-APPLICABLE';
    cosView = 'SCN-GEN-STEPS.NOT-APPLICABLE';
    deviceId = 'K1-SCK-03';
    hkic_number_view = '';
    name_ccc_view = '';
    date_of_birth_view = '';
    date_of_registration_view = '';
    date_of_first_registration_view = '';
    los = '';
    cos = '';
    PAGE_VIEW_ABORT_QUIT_ITEMOUT = 5000;
    PAGE_VIEW_RETURN_CARD_ITEMOUT = 5000;
    PAGE_VIEW_TIME_EXPIRE_ITEMOUT = 5000;
    LOCATION_DEVICE_ID = 'K1-SCK-01';
    APP_LANG = '';
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
        this.initConfigParam();
        this.initLanguage();
        this.startBusiness();
    }

    initConfigParam() {
        this.APP_LANG = this.localStorages.get('APP_LANG');
        this.cardType = Number.parseInt(this.localStorages.get('cardType'));
        this.readType = Number.parseInt(this.localStorages.get('readType'));
        this.LOCATION_DEVICE_ID = this.localStorages.get('LOCATION_DEVICE_ID');
        this.PAGE_VIEW_ABORT_QUIT_ITEMOUT = Number.parseInt(this.localStorages.get('PAGE_VIEW_ABORT_QUIT_ITEMOUT'));
        this.PAGE_VIEW_RETURN_CARD_ITEMOUT = Number.parseInt(this.localStorages.get('PAGE_VIEW_RETURN_CARD_ITEMOUT'));
        this.PAGE_VIEW_TIME_EXPIRE_ITEMOUT = Number.parseInt(this.localStorages.get('PAGE_VIEW_TIME_EXPIRE_ITEMOUT'));
        this.carddataJson = this.localStorages.get('carddataJson');
    }

    initLanguage() {
        if ('en-US' === this.APP_LANG) {
            this.translate.use('en-US');
        } else {
            this.translate.use('zh-HK');
        }
        this.translate.currentLang = this.APP_LANG;
    }

    startBusiness() {
       // this.processing.show();
        if (this.carddataJson) {
            this.carddata = JSON.parse(this.carddataJson);
            this.startProcess();
        }
    }

    /**
     * init param data.
     */
    startProcess() {
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
            const last_str = icno.substring(lengthNum - 1, lengthNum - 1);
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
        //  this.commonService.initTimerSet(this.timer, 1, 30);
    }
    /**
     * nextPage.
     */
    nextRoute() {
        if (this.timeOutPause || this.isAbort) {
            return;
        }
        this.storeConfigParam();
        this.router.navigate(['/kgen-viewcard/retrievecard']);
        return;
    }

    storeConfigParam() {
        this.localStorages.set('APP_LANG', this.translate.currentLang);
        this.localStorages.set('cardType', this.cardType.toString());
        this.localStorages.set('readType', this.readType.toString());
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
        if (this.modalPrintBill.visible) {
            this.modalPrintBill.hide();
        }
        this.commonService.doLightoff('08');
        this.commonService.doLightoff('07');
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
        if (this.timeOutPause || this.isAbort) {
            return;
        }
        // this.hkic_number_view = 'M004143(8)';
        const icnoStar = this.hkic_number_view.replace(/(\w)/g, function(a, b, c, d){return (c > 1 && c < 5) ? '*' : a});
        const date = new Date();
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        let monthStr = month + '';
        if (month < 10) {
            monthStr = '0' + month;
        }
        const day = date.getDate();
        let dayStr = day + '';
        if (day < 10) {
            dayStr = '0' + dayStr;
        }
        const hour = date.getHours();
        let hourStr = hour + '';
        if (hour < 10) {
            hourStr = '0' + hourStr;
        }
        const minute = date.getMinutes();
        let minuteStr  = minute + '';
        if (minute < 10) {
            minuteStr =  '0' + minuteStr;
        }
        const second = date.getSeconds();
        let secondStr = second + '';
        if (second < 10) {
            secondStr = '0' + secondStr;
        }
        const datestr = dayStr + '-' + monthStr + '-' + year + '  ' + hourStr + ':' + minuteStr + ':' + secondStr;
        const billNo = this.LOCATION_DEVICE_ID + '_' + year + monthStr + dayStr + hourStr + minuteStr + secondStr;
        const printcontent =
            ' ******************************************** \n' +
            '           香港入境事務處\n' +
            '        Hong Kong Immigration Department\n' +
            ' ++++++++++++++++++++++++++++++++++++++++++++ \n' +
            ' 身份證明文件號碼: ' + icnoStar + '\n' +
            ' Identity document number:\n' +
            ' --------------------------------------------- \n' +
            ' 交易類別:          查看芯片中的個人數據 \n' +
            ' Type of service:   View personal data in chip \n' +
            ' -------------------------------------------- \n' +
            '  交易狀態:                完成   \n' +
            '  Transaction state:       Completed     \n' +
            ' -------------------------------------------- \n' +
            '  日期及時間:     ' + datestr + '\n' +
            '  Date and time\n' +
            ' -------------------------------------------- \n' +
            '  交易參考編號:  ' + billNo + '\n' +
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
        if (this.timeOutPause || this.isAbort) {
            return;
        }
        console.log('call : printslip fun.' + JSON.stringify(dataJson))
        this.service.sendRequestWithLog('RR_SLIPPRINTER', 'printslip', {'data': dataJson}).subscribe((resp) => {
            if (resp.errorcode === '0') {
                console.log('printslip operate success');
                if (this.timeOutPause || this.isAbort) {
                    return;
                }
              this.nextRoute();
            } else {
                console.log('call printslip fail!');
                if (this.timeOutPause || this.isAbort) {
                    return;
                }
                this.messageFail = 'SCN-GEN-STEPS.BILL_PRINT_EXCEPTION';
                this.processing.hide();
                this.processModalFailShow();
            }
        }, (error) => {
            console.log('printslip ERROR ' + error);
            this.messageFail = 'SCN-GEN-STEPS.BILL_PRINT_EXCEPTION';
            this.processing.hide();
            if (this.isAbort || this.timeOutPause) {
                return;
            }
            this.processModalFailShow();
        });
    }

    timeExpire() {
        this.timer.showTimer = false;
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
        if (this.modalPrintBill.visible) {
            this.modalPrintBill.hide();
        }
        this.messageTimeout = 'SCN-GEN-STEPS.MESSAGE-TIMEOUT';
        this.modalTimeout.show();
        this.quitDisabledAll();
        setTimeout(() => {
            this.processTimeoutQuit();
        }, this.PAGE_VIEW_TIME_EXPIRE_ITEMOUT);
    }

    processTimeoutQuit() {
        this.modalTimeout.hide();
        this.doCloseCard();
    }
    processModalFailShow() {
        this.quitDisabledAll();
        this.isAbort = true;
        this.modalFail.show();
    }

    processFailQuit() {
        this.modalFail.hide();
        this.doCloseCard();
    }

    quitDisabledAll() {
        $('#exitBtn').attr('disabled', 'false');
        $('#langBtn').attr('disabled', 'false');
        $('#confirmBtn').attr('disabled', 'false');

    }
    cancelQuitEnabledAll() {
        $('#exitBtn').removeAttr('disabled');
        $('#langBtn').removeAttr('disabled');
        $('#confirmBtn').removeAttr('disabled');
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
                }, this.PAGE_VIEW_RETURN_CARD_ITEMOUT);
            } else {
                this.backRoute();
                setTimeout(() => {
                }, this.PAGE_VIEW_ABORT_QUIT_ITEMOUT);
            }
        }, (error) => {
            console.log('closecard ERROR ' + error);
            setTimeout(() => {
                this.backRoute();
            }, this.PAGE_VIEW_ABORT_QUIT_ITEMOUT);
        });
    }

    doReturnDoc() {
        this.service.sendRequestWithLog(CHANNEL_ID_RR_ICCOLLECT, 'returndoc').subscribe(() => {});
    }

    processNextPrint() {
        if (this.processing.visible) {
            this.isRestore = true;
            this.processing.hide();
        }
        this.modalPrintBill.show();
    }

    handlePrint() {
        this.modalPrintBill.hide();
        this.printBill();
    }
    printCancel() {
        this.modalPrintBill.hide();
        this.nextRoute();
    }

}
