import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmModule, ConfirmComponent, TimerModule } from '../../shared';
import { MsksService } from '../../shared/msks';
import { READ_ROP140_RETRY, TIMEOUT_MILLIS, TIMEOUT_PAYLOAD, ABORT_I18N_KEY, ABORT_YES_I18N_KEY } from '../../shared/var-setting';
import { TranslateService } from '@ngx-translate/core';

@Component({
    templateUrl: './step-indicate.component.html',
    styleUrls: ['./step-indicate.component.scss'],
})

export class IndicateComponent implements OnInit {
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

    constructor(private router: Router,
        private service: MsksService,
        private translate: TranslateService) { }

    public ngOnInit() {
        // this.ReadHKID();
        // re activate when hardware is ready
        const browserLang = this.translate.currentLang;
        if (browserLang === 'zh-HK') {
            this.isEN = false;
        } else {
            this.isEN = true;
        }
        // this.flashDevice();
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
        // Call the ROP.UpdateAppStatus(“SCK_ISS_SUP_<step>”)
        // setTimeout(() => {
        //     window.close();
        // }, 3000);
        this.doCloseWindow();
    }

    timeExpire() {
        this.modalNoROP.show();
        setTimeout(() => {
            // this.router.navigate(['/sck001']);
            this.doCloseWindow();
        }, TIMEOUT_MILLIS);
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

    nextOld() {
        this.router.navigate(['scn-gen-viewcard/insertcard'], { queryParams: {'cardType': 'v1'}});
    }
    nextNew() {
        this.router.navigate(['scn-gen-viewcard/insertcard'], { queryParams: {'cardType': 'v2'}});
    }

    doCloseWindow() {
        const remote = require('electron').remote;
        var window = remote.getCurrentWindow();
        window.close();
  }
}
