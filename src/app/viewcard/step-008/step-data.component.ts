import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, Router, ParamMap } from '@angular/router';
import { TimerComponent } from '../shared/sc2-timer/sc2-timer.component';
import { ConfirmComponent } from '../../shared';
import { TranslateService } from '@ngx-translate/core';
import { MsksService } from '../../shared/msks';
import { Request, Response } from '@angular/http';
import { READ_ROP140_RETRY, TIMEOUT_MILLIS, TIMEOUT_PAYLOAD, ABORT_I18N_KEY,
         ABORT_YES_I18N_KEY, CHANNEL_ID_RR_ICCOLLECT, CHANNEL_ID_RR_CARDREADER } from '../../shared/var-setting';

@Component({
  templateUrl: './step-data.component.html',
  styleUrls: ['./step-data.component.scss']
})

export class ViewcardDataComponent implements OnInit {
    @ViewChild('modalFail')
    public modalFail: ConfirmComponent;

    messageFail: String = `The personal particulars in the new card is not acknowledged by applicant,
        please contact the officer for completing your registration.`;

    title: string;
    isEN: boolean;

    idNo = 'D899336(6)';

    nameEng = 'CHAI, Wun Ching';

    nameChi = '齊煥正';

    nameCcc = '7871 3562 2973';

    birthdate = '01-01-1988';

    sex = 'M';

    symbol = '***AZ';

    registration = '01-1999';

    issueDate = '15-09-2018';

    other = 'N/A';

    condStay = 'N/A';

    lenStay = 'N/A';

    showdata = true;

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
    // M002600(5) 20180419
    processNewCard(icno, dor) {
        this.msksService.sendRequest(CHANNEL_ID_RR_CARDREADER, 'opencard', {'contactless_passwd': {
              'date_of_registration': '20180419',
              'hkic_no': 'M002600(5)'}}).subscribe((resp) => { // readhkicv2citizen
            this.msksService.sendRequest(CHANNEL_ID_RR_CARDREADER, 'readhkicv2citizen').subscribe((resp1) => {
                console.log(resp1);
                this.carddata = {...resp1};
                this.showdata = true;
                // this.doCloseCard();
            });
        });
    }

    processOldCard() {
        this.msksService.sendRequest(CHANNEL_ID_RR_CARDREADER, 'opencard', {'contactless_password': {
              'date_of_registration': null,
              'hkic_no': null}}).subscribe((resp) => {
            this.msksService.sendRequest(CHANNEL_ID_RR_CARDREADER, 'readhkicv1').subscribe((resp1) => {
                this.carddata = {...resp1};
                this.showdata = true;
                // this.doCloseCard();
            });
        });
    }

    doCloseCard() {
        this.msksService.sendRequest(CHANNEL_ID_RR_CARDREADER, 'closecard').subscribe((resp) => {
            this.msksService.sendRequest(CHANNEL_ID_RR_ICCOLLECT, 'returndoc').subscribe(() => {});
        });
    }

    onGridReady(params) {
        params.api.sizeColumnsToFit();
    }

    goToGeneral() {
        this.router.navigate(['/general']);
    }

    goToPersonal() {
        this.router.navigate(['/personal']);
    }

    newIdCard() {
        // Redirect to page, for advising applicant to click his new ID card at counter.
    }

    confirmIncorrect() {
        this.router.navigate(['/sck001']);
    }

    nextRoute() {
        this.router.navigate(['scn-gen-viewcard/collect'],{
            queryParams: {
                cardType: this.cardType
            }
        });
    }

    timerExpire() {
        this.modalFail.show();
        setTimeout(() => {
            this.router.navigate(['/sck001']);
        }, TIMEOUT_MILLIS);
    }

    backRoute() {
        this.router.navigate(['/sck001']);
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
}
