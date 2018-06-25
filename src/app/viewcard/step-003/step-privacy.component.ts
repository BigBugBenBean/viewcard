import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { PRIV_POL_LBL, HAVE_READ_EN, HAVE_READ_CN } from '../../shared/var-setting';
@Component({
  styleUrls: ['./step-privacy.component.scss'],
  templateUrl: './step-privacy.component.html'
})
export class PrivacyComponent implements OnInit {

  showCheckBox = false;
  enableButton = false;
  isChecked = false;
  checkBox: string;
  imgChkbox = require('../../../assets/images/checkbox.png');
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
    private translate: TranslateService) { }

  ngOnInit() {
    this.translate.addLangs(['en-US', 'zh-CN', 'zh-HK']);
    this.translate.setDefaultLang('en-US');
    const browserLang: string = this.translate.getBrowserLang();
    this.translate.use(browserLang.match(/en-US|zh-HK/) ? browserLang : 'en-US');
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
      this.imgChkbox = require('../../../assets/images/checkbox_tick.png');
      this.enableButton = true;
    } else {
      this.isChecked = false;
      this.imgChkbox = require('../../../assets/images/checkbox.png');
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
    // this.router.navigate(['/main/sck002']);
    this.router.navigate(['scn-gen-viewcard/indicate']);
  }

  exitRoute() {
    this.router.navigate(['/']);
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
    } else {
      this.translate.use('zh-HK');
    }
  }
}
