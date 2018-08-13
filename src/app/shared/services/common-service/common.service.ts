import {Injectable} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {MsksService} from '../../msks';
import {CHANNEL_ID_RR_CARDREADER, CHANNEL_ID_RR_ICCOLLECT, CHANNEL_ID_RR_NOTICELIGHT, INI_URL} from '../../var-setting';
import {HttpClient} from '@angular/common/http';
import {LocalStorageService} from './Local-storage.service';
import {TimerComponent} from '../../sc2-timer';
@Injectable()
export class CommonService {

    constructor(private router: Router,
                private ls: LocalStorageService,
                private service: MsksService,
                private httpClient: HttpClient,
                private translate: TranslateService) {}
    doCloseWindow() {
       // this.router.navigate(['/kgen-viewcard/start']);
        const remote = require('electron').remote;
        const window = remote.getCurrentWindow();
        window.close();
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

    doFlashLight(deviceCode: string) {
        this.service.sendRequestWithLog(CHANNEL_ID_RR_NOTICELIGHT, 'flash', {'device': deviceCode}).subscribe((resp) => {
        });
    }

    doLightoff(deviceCode: string) {
        this.service.sendRequestWithLog(CHANNEL_ID_RR_NOTICELIGHT, 'lightoff', {'device': deviceCode}).subscribe((resp) => {
        });
    }

    doCloseCard() {
        this.service.sendRequestWithLog(CHANNEL_ID_RR_CARDREADER, 'closecard').subscribe((resp) => { });
    }

    doReturnDoc() {
        this.service.sendRequestWithLog(CHANNEL_ID_RR_ICCOLLECT, 'returndoc').subscribe(() => {});
    }

    checkFpNull(fpObj: any) {
        return fpObj === null || fpObj === 'null' || fpObj === '';
    }

    /**
     *  setTimer.
     * @param sumSeconds
     * @param numSeconds
     */
    initTimerSet(timer: TimerComponent, sumSeconds, numSeconds) {
        timer.sumSeconds = sumSeconds;
        timer.numSeconds = numSeconds;
        let numToString = '' + numSeconds;
        if (numToString.length < 2) {
            numToString = '0' + numToString;
        }
        timer.displayTime = numToString;
        timer.initInterval();
    }
}
