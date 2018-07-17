import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { ConfirmModule, ConfirmComponent, TimerModule } from '../../shared';
import { MsksService } from '../../shared/msks';
import { READ_ROP140_RETRY, TIMEOUT_MILLIS, TIMEOUT_PAYLOAD, ABORT_I18N_KEY, ABORT_YES_I18N_KEY, MAX_FAIL,
         CHANNEL_ID_RR_NOTICELIGHT, CHANNEL_ID_RR_CARDREADER, CHANNEL_ID_RR_ICCOLLECT } from '../../shared/var-setting';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/toPromise';

@Component({
    templateUrl: './step-insertcard.component.html',
    styleUrls: ['./step-insertcard.component.scss'],
})

export class InsertcardComponent implements OnInit {
    @ViewChild('modalRetry')
    public modalRetry: ConfirmComponent;

    @ViewChild('modalFail')
    public modalFail: ConfirmComponent;

    @ViewChild('modalNoROP')
    public modalNoROP: ConfirmComponent;

    @ViewChild('maxFail')
    public maxFail: ConfirmComponent;

    @ViewChild('imgNext')
    public nextPage: ElementRef;

    @ViewChild('existCardFail')
    public existCardFail: ConfirmComponent;

    messageRetry: String = 'Please re-insert your ROP 140/ROP 140A form.';
    messageFail: String = 'The insert form is not be recognized, please contact the officer for completing your registration.';
    messageNoROP: String = 'No ROP 140/ROP 140A form is inserted.';

    retryVal = 0;
    isEN: boolean;
    messageAbort: string;
    isAbort: boolean;
    failNum = 0;
    cardType: string;

    constructor(private router: Router,
                private service: MsksService,
                private route: ActivatedRoute,
                private translate: TranslateService) { }

    public ngOnInit() {
        // this.ReadHKID();
        // re activate when hardware is ready
      this.route.queryParams.subscribe((params) => {
          this.cardType = params.cardType;
          if ('v2' === this.cardType) {
              this.doFlashLight('08');
              this.processNewCard();
          }else if ('v1' === this.cardType) {
              this.doFlashLight('07');
              this.processOldCard();
          }
      });

        // this.service.sendRequest(CHANNEL_ID_RR_CARDREADER,
        //                          'opencard', {'date_of_registration': '19800531', 'hkic_no': 'M002981(0)'})
        // .startWith(this.service.sendRequest(CHANNEL_ID_RR_NOTICELIGHT, 'flash', {'device': '03'}))
        // .subscribe((resp1) => {
        //     this.service.sendRequest(CHANNEL_ID_RR_CARDREADER, 'readhkicv2citizen').subscribe((resp) => {
        //     });
        // });

        // this.messageAbort = ABORT_I18N_KEY;
        // this.isAbort = false;
        // const browserLang = this.translate.currentLang;
        // if (browserLang === 'zh-HK') {
        //     this.isEN = false;
        // } else {
        //     this.isEN = true;
        // }
        // this.flashDevice();
// 07   舊卡燈
// 08 光學閱讀器
// 12  blue
// 13  red
// 14  green
    }

    processNewCard() {
        // this.test();
        this.service.sendRequest(CHANNEL_ID_RR_CARDREADER, 'readhkicv2ocrdata', {'ocr_reader_name': 'ARH ComboSmart'}).subscribe((resp) => {
            this.doLightoff('08');
            if (resp.error_info.error_code === '0') {
                const datas: any[] = resp.ocr_data;
                let dor, icno;
                for (const i in datas) {
                    if ('VizIssueDate' === datas[i].field_id) {
                        const dor_temp = datas[i].field_value;
                        const year = this.changeDor(dor_temp);
                        dor = `${year}${dor_temp.substr(3, 2)}${dor_temp.substr(0, 2)}`;
                    }else if ('VizDocumentNumber' === datas[i].field_id) {
                        icno = datas[i].field_value;
                    }
                }
                // this.router.navigate(['scn-gen-viewcard/data'],
                //                      { queryParams: {'cardType': 'v2', 'dor': dor, 'icno': icno}});
                    this.router.navigate(['scn-gen-viewcard/left'],
                        { queryParams: {
                            'cardType': 'v2',
                            'icno': icno,
                            'dor': dor
                        }});
                } else { // '19' Fail to open the OCR device
                    if (MAX_FAIL > ++this.failNum) {
                        this.processNewCard();
                    } else {
                        this.doMaxFail();
                    }
                }
        });
    }

    processOldCard() {
        this.service.sendRequest(CHANNEL_ID_RR_ICCOLLECT, 'opengate', {'timeout': TIMEOUT_PAYLOAD })
        .subscribe((resp) => {
            this.doLightoff('07');
            if (resp.errorcode === '0') {
                this.router.navigate(['scn-gen-viewcard/left'],
                { queryParams: {
                    'cardType': 'v1'
                }});
            } else if (resp.errorcode === 'D0009') {
                this.doExistCardFail();
            } else {

            // this.router.navigate(['scn-gen-viewcard/data'],
            // { queryParams: {'cardType': 'v1'}});
                this.doExistCardFail();
            }
        });
    }

    ReadHKID() {
        if (!this.isAbort) {
            this.service.sendRequest('RR_EICCOLLECT', 'opengate', { 'timeout': TIMEOUT_PAYLOAD } ).subscribe((resp) => {
                if (resp.errorcode === '0') {
                        this.modalRetry.hide();
                        this.retryVal = 0;
                        this.MALocalChecking();
                    // this.offDevice();
                } else {
                        this.modalRetry.show();
                        if (this.retryVal < READ_ROP140_RETRY) {
                            this.retryVal += 1;
                            this.ReadHKID();
                        } else {
                            this.readFail();
                        }
                    this.ReadHKID();
                }
            }, (error) => {
                console.log('OPENGATE ERROR: ' + error);
                this.ReadHKID();
            });
        }
    }

    doFlashLight(deviceCode: string) {
        this.service.sendRequest(CHANNEL_ID_RR_NOTICELIGHT, 'flash', {'device': deviceCode}).subscribe((resp) => {
        });
    }

    doLightoff(deviceCode: string) {
        this.service.sendRequest(CHANNEL_ID_RR_NOTICELIGHT, 'lightoff', {'device': deviceCode}).subscribe((resp) => {
        });
    }

    MALocalChecking() {
        console.log('Processing MALocalChecking...');
        // this.nextRoute();
    }

    nextRoute() {
        // bypassing loading screen page
        // this.router.navigate(['/main/sck004']);
        // this.router.navigate(['/main/sck005']);
    }

    backRoute() {
        this.messageAbort = ABORT_YES_I18N_KEY;
        this.isAbort = true;
        // Call the ROP.UpdateAppStatus(“SCK_ISS_SUP_<step>”)
        // setTimeout(() => {
        //     this.router.navigate(['/scn-gen/gen001']);
        // }, 3000);
        this.doLightoff('07');
        this.doLightoff('08');

        this.doCloseWindow();
    }

    timeExpire() {
        this.modalNoROP.show();
        setTimeout(() => {
            // this.router.navigate(['//scn-gen/gen001']);
            this.doCloseWindow();
        }, 5000);
    }

    readFail() {
        this.modalFail.show();
        setTimeout(() => {
            this.router.navigate(['/scn-gen/gen001']);
        }, TIMEOUT_MILLIS);
    }

    // offDevice() {
    //     this.service.sendRequest('RR_NOTICELIGHT', 'lightoff', { 'device': '05' }).subscribe((resp) => {
    //         setTimeout(() => {
    //             const ref = this.nextPage.nativeElement as HTMLElement;
    //             ref.click();
    //         }, TIMEOUT_MILLIS);
    //     });
    // }

    langButton() {
        const browserLang = this.translate.currentLang;
        if (browserLang === 'zh-HK') {
            this.translate.use('en-US');
            this.isEN = true;
        } else {
            this.translate.use('zh-HK');
            this.isEN = false;
        }
    }

    changeDor(dor: string): string {
        const temp = dor.substr(6, 1);
        const year = parseInt(temp, 0);
        if (year > 2) {
            return `19${dor.substr(6, 2)}`;
        }else {
            return `20${dor.substr(6, 2)}`;
        }
    }

    doCloseWindow() {
        const remote = require('electron').remote;
        const window = remote.getCurrentWindow();
        window.close();
    }

    doMaxFail() {
        this.maxFail.show();
        this.goPageCollect(8000);
    }

    doExistCardFail() {
        this.existCardFail.show();
        this.goPageCollect(8000);
    }

    goPageCollect(millisecond) {
        setTimeout(() => {
            this.router.navigate(['scn-gen-viewcard/collect'], {
            queryParams: {
                cardType: this.cardType
            }
        });
        }, millisecond);
    }
}
