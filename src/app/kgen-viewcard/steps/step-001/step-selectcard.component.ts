import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

import {TranslateService} from '@ngx-translate/core';
import {CommonService} from '../../../shared/services/common-service/common.service';
import {TimerComponent} from '../../../shared/sc2-timer';
import {ConfirmComponent} from '../../../shared/sc2-confirm';

@Component({
    templateUrl: './step-selectcard.component.html',
    styleUrls: ['./step-selectcard.component.scss']
})
export class StepSelectCardComponent implements OnInit {

    @ViewChild('timer')
    public timer: TimerComponent;
    @ViewChild('modalFail')
    public modalFail: ConfirmComponent;
    flag = false;
    messageFail = '';
    messageAbort= 'SCN-GEN-STEPS.ABORT_CONFIRM';
    constructor(private router: Router,
                private commonService: CommonService,
                private route: ActivatedRoute,
                private translate: TranslateService) {}
    ngOnInit(): void {
        console.log('init fun');
        this.initParam();
    }

    /**
     *  init param.
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
            this.timer.sumSeconds = 10;
            this.flag = true;
            this.timer.initInterval();
        });
    }

    /**
     * nextPage.
     */
    nextRoute() {
        this.router.navigate(['/kgen-updcsls/fingerprint']);
        return;
    }

    timeExpire() {
        if (this.flag) {
            if (this.translate.currentLang === 'zh-HK') {
                this.messageFail = '超过30秒沒有操作，退出系统';
            } else {
                this.messageFail = 'No operating for more than 30 seconds, exit the system';
            }
            this.modalFail.show();
        } else {
            setTimeout(() => {
                this.commonService.doCloseWindow();
            }, 500);
        }
    }

    /**
     * new HKID card.
     */
    insertNewCard() {
        console.log('call insertNewCard');
        this.router.navigate(['/kgen-viewcard/insertcard'],
            { queryParams: {'lang': this.translate.currentLang, 'cardType': 2}});

        // this.router.navigate(['/kgen-viewcard/fingerprintLeft'],
        //     { queryParams: {'lang': this.translate.currentLang, 'cardType': 2}});
        return;
    }

    /**
     * old HKId Card.
     */
    insertOldCard() {
        console.log('call insertOldCard');
        this.router.navigate(['/kgen-viewcard/insertcard'],
            { queryParams: {'lang': this.translate.currentLang, 'cardType': 1}});
    }

    /**
     * backPage.
     */
    backRoute() {
        this.commonService.doCloseWindow();
    }

    /**
     * lang
     */
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
        this.backRoute();
    }
}
