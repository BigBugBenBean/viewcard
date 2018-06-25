import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { ConfirmModule, ConfirmComponent, TimerModule } from '../../shared';
import { MsksService } from '../../shared/msks';
import { READ_ROP140_RETRY, TIMEOUT_MILLIS, TIMEOUT_PAYLOAD, ABORT_I18N_KEY, ABORT_YES_I18N_KEY,
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

    @ViewChild('imgNext')
    public nextPage: ElementRef;

    messageRetry: String = 'Please re-insert your ROP 140/ROP 140A form.';
    messageFail: String = 'The insert form is not be recognized, please contact the officer for completing your registration.';
    messageNoROP: String = 'No ROP 140/ROP 140A form is inserted.';

    retryVal = 0;
    isEN: boolean;
    messageAbort: string;
    isAbort: boolean;

    constructor(private router: Router,
        private service: MsksService,
        private route: ActivatedRoute,
        private translate: TranslateService) { }

    public ngOnInit() {
        // this.ReadHKID();
        // re activate when hardware is ready
      this.route.queryParams.subscribe((params) => {
          const cardType = params.cardType;
          if ('v2' === cardType) {
              this.doFlashLight('08');
              this.processNewCard();
          }else if ('v1' === cardType) {
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
        this.service.sendRequest('RR_CIDOCR', 'scandata', {'timeout': TIMEOUT_PAYLOAD}).subscribe((resp) => {
            this.doLightoff('08');
            if (resp.errorcode === '0') {
                setTimeout(() => {
                    // this.router.navigate(['viewcard/data', 'v2', resp.icno, resp.dor] );
                    this.router.navigate(['scn-gen-viewcard/data'],
                        { queryParams: {'cardType': 'v2', 'dor': resp.dor, 'icno': resp.icno}});
                    // this.router.navigate(['viewcard/left'],
                    //     { queryParams: {
                    //         'cardType': 'v2',
                    //         'icno': resp.icno,
                    //         'dor': resp.dor
                    //     }});
                }, 1000);
            }
        });
    }

    processOldCard() {
        this.service.sendRequest(CHANNEL_ID_RR_ICCOLLECT, 'opengate', {'timeout': TIMEOUT_PAYLOAD })
        .subscribe((resp) => {
            this.doLightoff('07');
            // this.router.navigate(['viewcard/data', 'v1'] );
            this.router.navigate(['scn-gen-viewcard/data'],
            { queryParams: {'cardType': 'v1'}});
            // this.router.navigate(['viewcard/left'],
            //     { queryParams: {
            //         'cardType': 'v1'
            //     }});
        });
    }

    ReadHKID() {
        if (!this.isAbort) {
            this.service.sendRequest('RR_EICCOLLECT', 'opengate', { 'timeout': TIMEOUT_PAYLOAD } ).subscribe((resp) => {
                if (resp.errorcode === '0') {
                    if (0) {
                        this.modalRetry.hide();
                        this.retryVal = 0;
                        this.MALocalChecking();
                    }
                    this.offDevice();
                } else {
                    if (0) {
                        this.modalRetry.show();
                        if (this.retryVal < READ_ROP140_RETRY) {
                            this.retryVal += 1;
                            this.ReadHKID();
                        } else {
                            this.readFail();
                        }
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
        setTimeout(() => {
            this.router.navigate(['/scn-gen/gen001']);
        }, 3000);
    }

    timeExpire() {
        this.modalNoROP.show();
        setTimeout(() => {
            this.router.navigate(['//scn-gen/gen001']);
        }, TIMEOUT_MILLIS);
    }

    readFail() {
        this.modalFail.show();
        setTimeout(() => {
            this.router.navigate(['/scn-gen/gen001']);
        }, TIMEOUT_MILLIS);
    }

    flashDevice() {
        this.service.sendRequest('RR_NOTICELIGHT', 'flash', { 'device': '05' }).subscribe((resp) => {
            this.ReadHKID();
        });
    }

    offDevice() {
        this.service.sendRequest('RR_NOTICELIGHT', 'lightoff', { 'device': '05' }).subscribe((resp) => {
            setTimeout(() => {
                const ref = this.nextPage.nativeElement as HTMLElement;
                ref.click();
            }, TIMEOUT_MILLIS);
        });
    }
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
}
