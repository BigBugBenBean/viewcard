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

    /**
     *  open light on
     * @param deviceCode
     */
    doLightOn(deviceCode: string) {
        this.service.sendRequestWithLog(CHANNEL_ID_RR_NOTICELIGHT, 'lighton', {'device': deviceCode}).subscribe((resp) => {
        });
    }

    /**
     * close light.
     * @param deviceCode
     */
    doLightOff(deviceCode: string) {
        this.service.sendRequestWithLog(CHANNEL_ID_RR_NOTICELIGHT, 'lightoff', {'device': deviceCode}).subscribe((resp) => {
        });
    }

    doCloseCard() {
        this.service.sendRequestWithLog(CHANNEL_ID_RR_CARDREADER, 'closecard').subscribe((resp) => { });
    }

    doReturnDoc() {
        this.service.sendRequestWithLog(CHANNEL_ID_RR_ICCOLLECT, 'returndoc').subscribe(() => {});
    }

    returnDoc() {
        return this.service.sendRequestWithLog(CHANNEL_ID_RR_ICCOLLECT, 'returndoc');
    }

    checkFpNull(fpObj: any) {
        return fpObj === null || fpObj === 'null' || fpObj === '' || fpObj === false || fpObj === 'false';
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

    /**
     * Exception log.
     * @param actiontype
     * @param kskid
     * @param excptcd
     * @param lstupid
     * @param mcdno
     * @param remk
     */
    loggerExcp(actiontype, kskid, excptcd, lstupid, mcdno, remk) {
        const time = this.getCurrentTime();
        const payload = {
            'actiontype': actiontype,
            'kskid': kskid,
            'dtaction': time,
            'dtlstupd': time,
            'dtual': time,
            'excptcd': excptcd,
            'lstupid': lstupid,
            'mcdno': mcdno,
            'remk': remk
        };
        this.service.sendRequestExcptLog(payload);
    }

    /**
     *  trans log.
     * @param actiontype
     * @param kskid
     * @param result
     * @param lstupid
     * @param mcdno
     * @param remk
     */
    loggerTrans(actiontype, kskid, result, lstupid, mcdno, remk) {
        const time = this.getCurrentTime();
        const payload = {
            'actiontype': actiontype,
            'kskid': kskid,
            'dtaction': time,
            'dtlstupd': time,
            'dtual': time,
            'result': result,
            'lstupid': lstupid,
            'mcdno': mcdno,
            'remk': remk
        };
        this.service.sendRequestTransLog(payload);
    }

    /**
     * getTime.
     */
    getCurrentTime() {
        const date = new Date();
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        let monthStr = month + '';
        if (month < 10) {
            monthStr = '0' + month;
        }
        const day = date.getDate();
        let dayStr = day + '';
        if (day < 10) {
            dayStr = '0' + dayStr;
        }
        const hour = date.getHours();
        let hourStr = hour + '';
        if (hour < 10) {
            hourStr = '0' + hourStr;
        }
        const minute = date.getMinutes();
        let minuteStr  = minute + '';
        if (minute < 10) {
            minuteStr =  '0' + minuteStr;
        }
        const second = date.getSeconds();
        let secondStr = second + '';
        if (second < 10) {
            secondStr = '0' + secondStr;
        }
        // yyyy-MM-dd'T'HH:mm:ss.SSSZ
        const ms = date.getMilliseconds();
        const datestr = year + '-' + monthStr + '-' + dayStr + 'T' + hourStr + ':' + minuteStr + ':' + secondStr + '.' + ms  + 'Z';
        return datestr;
    }
}
