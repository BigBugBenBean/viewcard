import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { PRIV_POL_LBL, HAVE_READ_EN, HAVE_READ_CN } from '../../../shared/var-setting';
import {MsksService} from '../../../shared/msks';
import {CommonService} from '../../../shared/services/common-service/common.service';
import {ConfirmComponent} from '../../../shared/sc2-confirm';
import {ProcessingComponent} from '../../../shared/processing-component';
@Component({
    styleUrls: ['./step-privacy.component.scss'],
    templateUrl: './step-privacy.component.html'
})
export class StepPrivacyComponent implements OnInit {
    @ViewChild('modalQuit')
    public modalQuit: ConfirmComponent;

    @ViewChild('modalTimeout')
    public modalTimeout: ConfirmComponent;

    @ViewChild('processing')
    public processing: ProcessingComponent;

    messageFail = 'SCN-GEN-STEPS.RE-SCANER-MAX';
    messageAbort = 'SCN-GEN-STEPS.ABORT_CONFIRM';
    messageTimeout = 'SCN-GEN-STEPS.MESSAGE-TIMEOUT';
    showCheckBox = false;
    enableButton = false;
    isAbort = false;
    isRestore = false;
    isChecked = false;
    checkBox: string;
    imgChkbox = require('../../../../assets/images/checkbox.png');
    showScrollUp = false;
    showScrollDown = true;
    timer: any;
    lblPRIV_POL_LBL = PRIV_POL_LBL;
    lblHAVE_READ_EN = HAVE_READ_EN;
    lblHAVE_READ_CN = HAVE_READ_CN;

    @ViewChild('policyBox')
    private policyBox: ElementRef;
    private highestScroll = 0;
    private prevDeltaY = 0;

    constructor(private router: Router,
                private commonService: CommonService,
                private route: ActivatedRoute,
                private service: MsksService,
                private translate: TranslateService) { }

    ngOnInit() {
        this.initParam();
    }

    /**
     *  init param.
     */
    initParam() {
        this.route.queryParams.subscribe(params => {
             let lang = params['lang'];
            if ('en-US' === lang) {
                this.translate.use('en-US');
            } else if ('zh-HK' === lang) {
                this.translate.use('zh-HK');
            } else {
                this.translate.addLangs(['en-US', 'zh-CN', 'zh-HK']);
                this.translate.setDefaultLang('en-US');
                const browserLang: string = this.translate.getBrowserLang();
                this.translate.use(browserLang.match(/en-US|zh-HK/) ? browserLang : 'en-US');
                lang = browserLang;
            }
            this.translate.currentLang = lang;
            this.showCheckBox = true;
        });
    }

    onPanStart() {
        this.prevDeltaY = 0;
    }

    onPanDown(deltaY: number) {
        const maxDeltaY = Math.max(deltaY, this.prevDeltaY);
        const scrollDelta = Math.abs(Math.abs(deltaY) - Math.abs(this.prevDeltaY));
        if (maxDeltaY === deltaY) {
            this.adjustScroll(-scrollDelta);
        } else {
            this.adjustScroll(scrollDelta);
        }
        this.prevDeltaY = deltaY;
    }

    onPanUp(deltaY: number) {
        const minDeltaY = Math.min(deltaY, this.prevDeltaY);
        const scrollDelta = Math.abs(Math.abs(deltaY) - Math.abs(this.prevDeltaY));
        if (minDeltaY === deltaY) {
            this.adjustScroll(scrollDelta);
        } else {
            this.adjustScroll(-scrollDelta);
        }
        this.prevDeltaY = deltaY;
    }

    onScroll(event: any) {
        const currScroll = event.target.scrollTop;
        const scrollHeight = event.target.scrollHeight;
        const clientHeight = event.target.clientHeight;
        this.showScrollUp = true;
        this.showScrollDown = true;
        if ((scrollHeight - clientHeight) <= currScroll) {
            this.showCheckBox = true;
            this.showScrollDown = false;
        } else if (currScroll === 0) {
            this.showScrollUp = false;
        }

    }

    checked(event: any) {
        if (!this.isChecked) {
            this.isChecked = true;
            this.imgChkbox = require('../../../../assets/images/checkbox_tick.png');
            this.enableButton = true;
        } else {
            this.isChecked = false;
            this.imgChkbox = require('../../../../assets/images/checkbox.png');
            this.enableButton = false;
        }
    }

    mouseDown(value: number) {
        this.adjustScroll(value);
        this.timer = setInterval(() => {
            this.adjustScroll(value);
        }, 50);
    }

    adjustScroll(value: number) {
        if (value > 0 && this.showScrollDown === true) {
            this.policyBox.nativeElement.scrollTop += value;
        } else if (value < 0 && this.showScrollUp === true) {
            this.policyBox.nativeElement.scrollTop += value;
        } else {
            this.stopHold();
        }
    }

    stopHold() {
        clearInterval(this.timer);
    }

    nextRoute() {
        // 修改調整
        this.router.navigate(['/kgen-viewcard/insertcard'], { queryParams: {'lang': this.translate.currentLang}});
        return;
    }

    backRoute() {
        this.commonService.doCloseWindow();
    }

    timeExpire() {
        if (this.processing.visible) {
            this.processing.hide();
        }
        if (this.modalQuit.visible) {
            this.modalQuit.hide();
        }
        this.messageTimeout = 'SCN-GEN-STEPS.MESSAGE-TIMEOUT';
        this.modalTimeout.show();
        this.quitDisabledAll();
        setTimeout(() => {
            this.processTimeoutQuit();
        }, 5000);
    }

    processTimeoutQuit() {
        this.modalTimeout.hide();
        this.backRoute();
    }

    quitDisabledAll() {
        $('#exitBtn').attr('disabled', 'false');
        $('#nextBtn').attr('disabled', 'false');
        $('#checkedBoxBtn').attr('disabled', 'false');
        //$('#checkbox').unbind('click');
        $('#scrollUpBtn').attr('disabled', 'false');
        $('#scrollDownBtn').attr('disabled', 'false');
        $('#langBtn').attr('disabled', 'false');

    }
    cancelQuitEnabledAll() {
        $('#exitBtn').removeAttr('disabled');
        $('#nextBtn').removeAttr('disabled');
        $('#checkedBoxBtn').removeAttr('disabled');
        $('#scrollUpBtn').removeAttr('disabled');
        $('#scrollDownBtn').removeAttr('disabled');
        $('#langBtn').removeAttr('disabled');
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
        this.backRoute();

    }
    processCancelQuit() {
        this.modalQuit.hide();
        this.isAbort = false;
        this.cancelQuitEnabledAll();
        if (this.isRestore) {
            this.processing.show();
        }
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
}
