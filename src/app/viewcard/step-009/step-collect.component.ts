import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, Router, ParamMap } from '@angular/router';
import { TimerComponent } from '../shared/sc2-timer/sc2-timer.component';
import { ConfirmComponent } from '../../shared';
import { TranslateService } from '@ngx-translate/core';
import { MsksService } from '../../shared/msks';
import { Request, Response } from '@angular/http';
import { READ_ROP140_RETRY, TIMEOUT_MILLIS, TIMEOUT_PAYLOAD, ABORT_I18N_KEY, CHANNEL_ID_RR_NOTICELIGHT,
         ABORT_YES_I18N_KEY, CHANNEL_ID_RR_ICCOLLECT, CHANNEL_ID_RR_CARDREADER } from '../../shared/var-setting';

@Component({
  templateUrl: './step-collect.component.html',
  styleUrls: ['./step-collect.component.scss']
})

export class CollectCardComponent implements OnInit {
    @ViewChild('modalFail')
    public modalFail: ConfirmComponent;

    messageFail: String = `The personal particulars in the new card is not acknowledged by applicant,
        please contact the officer for completing your registration.`;

    title: string;
    isEN: boolean;

    carddata: any = {};

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
      this.doCollectCard();
    }

    doCollectCard() {
        this.route.queryParams.subscribe((params) => {
          if ('v2' === params.cardType) {
            // this.doFlashLight('08');
            this.processNewCollectCard();
          }else if ('v1' === params.cardType) {
            // this.doFlashLight('07');
            this.processOldCollectCard();
          }
      });
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

    processNewCollectCard() {
        this.msksService.sendRequest(CHANNEL_ID_RR_CARDREADER, 'closecard').subscribe((resp) => {
            this.msksService.sendRequest(CHANNEL_ID_RR_ICCOLLECT, 'returndoc').subscribe(() => {
                this.doOffLight('08');
            });
        });
    }

    processOldCollectCard() {
        // this.doFlashLight('07');
        this.msksService.sendRequest(CHANNEL_ID_RR_CARDREADER, 'closecard').subscribe((resp) => {
            this.msksService.sendRequest(CHANNEL_ID_RR_ICCOLLECT, 'returndoc').subscribe(() => {
                // this.doOffLight('07');
            });
        });
    }

    doFlashLight(deviceCode: string) {
        this.msksService.sendRequest(CHANNEL_ID_RR_NOTICELIGHT, 'flash', {'device': deviceCode}).subscribe((resp) => {
        });
    }

    doOffLight(deviceCode: string) {
        this.msksService.sendRequest(CHANNEL_ID_RR_NOTICELIGHT, 'lightoff', {'device': deviceCode}).subscribe((resp) => {
        });
    }
}
