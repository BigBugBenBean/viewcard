import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, Router, ParamMap } from '@angular/router';
import { TimerComponent } from '../shared/sc2-timer/sc2-timer.component';
import { ConfirmComponent } from '../../shared';
import { TranslateService } from '@ngx-translate/core';
import { MsksService } from '../../shared/msks';
import {CommonService} from '../../shared/services/common-service/common.service';
import { Request, Response } from '@angular/http';
import { READ_ROP140_RETRY, TIMEOUT_MILLIS, TIMEOUT_PAYLOAD, ABORT_I18N_KEY,
         ABORT_YES_I18N_KEY, CHANNEL_ID_RR_ICCOLLECT, CHANNEL_ID_RR_CARDREADER } from '../../shared/var-setting';

@Component({
  templateUrl: './step-data.component.html',
  styleUrls: ['./step-data.component.scss']
})

export class ViewcardDataComponent implements OnInit {
    @ViewChild('modalTimerFail')
    public modalTimerFail: ConfirmComponent;

    @ViewChild('readCardFail')
    public readCardFail: ConfirmComponent;

    @ViewChild('openCardFailNoCard')
    public openCardFailNoCard: ConfirmComponent;

    @ViewChild('openCardFailCommon')
    public openCardFailCommon: ConfirmComponent;

    messageFail: String = `The personal particulars in the new card is not acknowledged by applicant,
        please contact the officer for completing your registration.`;

    title: string;
    isEN: boolean;

    showdata = false;

    img = '../../../assets/images/photo1.jpg'; // set to '' if no image found or set to the Image path;

    buttonNum: Number = 2;
    // message: String = 'Are you sure the information is incorrect?';

    carddata: any = {};

    cardType: string;

        // "hkic_number": "C668668(E)",
        // "date_of_ic_registration": "20170101",
        // "date_of_first_registration": "200701",
        // "date_of_birth": "19800101",
        // "name_chinese": "李智能",
        // "name_english": "LEE, Chi Nan",
        // "name_ccc": "2621-2535-5174",
        // "gender": "F",
        // "indicators": "***",
        // "residential_status": "",
        // "card_type": ""

    constructor(private router: Router,
                private elRef: ElementRef,
                private route: ActivatedRoute,
                private msksService: MsksService,
                private commonService: CommonService,
                private translate: TranslateService
    ) {}

    ngOnInit() {
      this.title = 'Nature of Access to Information';
      const browserLang = this.translate.currentLang;
      if (browserLang === 'zh-HK') {
          this.isEN = false;
      } else {
          this.isEN = true;
      }

      this.route.queryParams.subscribe((params) => {
          this.cardType = params.cardType;
          if ('v2' === params.cardType) {
              this.processNewCard(params.icno, params.dor);
          }else if ('v1' === params.cardType) {
              this.processOldCard();
          }
      });
    }
    // M004072(5) 20180619
    processNewCard(icno, dor) {
        this.msksService.sendRequest(CHANNEL_ID_RR_CARDREADER, 'opencard',
                                     {'contactless_password': { 'date_of_registration': dor,
                                                                'hkic_no': icno}}).subscribe((resp) => {
            if (resp.error_info.error_code === '0') {
                this.msksService.sendRequest(CHANNEL_ID_RR_CARDREADER, 'readhkicv2citizen').subscribe((resp1) => {
                    if (resp1.error_info.error_code === '0') {
                        this.carddata = {...resp1};
                        this.showdata = true;
                    } else {
                        this.doReadCardFail();
                    }
                });
            } else if (resp.error_info.error_code === '7') {
                this.doOpenCardFailNoCard();
            } else {
                this.doOpenCardFailCommon();
            }
        });
    }

    processOldCard() {
        this.msksService.sendRequest(CHANNEL_ID_RR_CARDREADER, 'opencard', {'contactless_password': {
              'date_of_registration': null, 'hkic_no': null}}).subscribe((resp) => {
              if (resp.error_info.error_code === '0') {
                  this.msksService.sendRequest(CHANNEL_ID_RR_CARDREADER, 'readhkicv1').subscribe((resp1) => {
                      if (resp1.error_info.error_code === '0') {
                          this.carddata = {...resp1};
                          this.showdata = true;
                      } else {
                          this.doReadCardFail();
                      }
                  });
              } else if (resp.error_info.error_code === '7') {
                  this.doOpenCardFailNoCard();
              } else {
                  this.doOpenCardFailCommon();
              }
        });
    }

    onGridReady(params) {
        params.api.sizeColumnsToFit();
    }

    confirmIncorrect() {
        this.router.navigate(['/sck001']);
    }

    nextRoute() {
        this.router.navigate(['scn-gen-viewcard/collect'], {
            queryParams: {
                cardType: this.cardType
            }
        });
    }

    timeExpire() {
        this.modalTimerFail.show();
        setTimeout(() => {
            this.nextRoute();
        }, 5000);
    }

    langButton() {
        // this.router.navigate(['main/sck0012'])
        const browserLang = this.translate.currentLang;
        console.log(browserLang);
        if (browserLang === 'zh-HK') {
          this.translate.use('en-US');
          this.isEN = true;
        } else {
          this.translate.use('zh-HK');
          this.isEN = false;
        }
    }

    doReadCardFail() {
        this.readCardFail.show();
        this.goPageCollect(8000);
    }

    doOpenCardFailNoCard() {
        this.openCardFailNoCard.show();
        this.goPageCollect(8000);
    }

    doOpenCardFailCommon() {
        this.openCardFailCommon.show();
        this.goPageCollect(8000);
    }

    goPageCollect(millisecond) {
        setTimeout(() => {
            this.nextRoute();
        }, millisecond);
    }
}
