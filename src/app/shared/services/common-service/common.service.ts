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
         this.router.navigate(['/kgen-viewcard/privacy'], { queryParams: {'lang': this.translate.currentLang}});
        // const remote = require('electron').remote;
        // const window = remote.getCurrentWindow();
        // window.close();
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

    /**
     * init Batch Save to local storage.
     */
    initLoadingParamToLocalStorage() {
        this.httpClient.get(INI_URL).subscribe(data => {
            const office = data['operation_office'];
            this.ls.set('device_id', data['device_id']);
            this.ls.set('locationID', data['locationID']);
            this.ls.set('terminalID', data['terminalID']);
            this.ls.set('operation_office', data['operation_office']);
            this.ls.set('contactless_passwd', data['contactless_passwd']);
            this.ls.set('date_of_register', data['date_of_register']);
            this.ls.set('app_lang', data['app_lang']);
            this.ls.set('show_timeout', data['show_timeout']);
            this.ls.set('normal_color', data['normal_color']);
            this.ls.set('scn_sck_001_timeout', data['scn_sck_001_timeout']);
            this.ls.set('scn_sck_002_timeout', data['scn_sck_002_timeout']);
            this.ls.set('scn_sck_003_timeout', data['scn_sck_003_timeout']);
            this.ls.set('scn_sck_004_timeout', data['scn_sck_004_timeout']);
            this.ls.set('scn_sck_005_timeout', data['scn_sck_005_timeout']);
            this.ls.set('scn_sck_006_timeout', data['scn_sck_006_timeout']);
            this.ls.set('scn_sck_007_timeout', data['scn_sck_007_timeout']);
            this.ls.set('scn_sck_008_timeout', data['scn_sck_008_timeout']);
            this.ls.set('scn_sck_009_timeout', data['scn_sck_009_timeout']);
            this.ls.set('scn_sck_010_timeout', data['scn_sck_010_timeout']);
            this.ls.set('scn_sck_011_timeout', data['scn_sck_011_timeout']);
            this.ls.set('scn_sck_012_timeout', data['scn_sck_012_timeout']);
            this.ls.set('opengate_hkid_timeout', data['opengate_hkid_timeout']);
            this.ls.set('opengate_rop_timeout', data['opengate_rop_timeout']);
            this.ls.set('insert_hkid_timeout', data['insert_hkid_timeout']);
            this.ls.set('insert_rop_timeout', data['insert_rop_timeout']);
            this.ls.set('max_hkid_read', data['max_hkid_read']);
            this.ls.set('max_rop_read', data['max_rop_read']);
            this.ls.set('max_fp_read', data['max_fp_read']);
            this.ls.set('camera_read_timeout', data['camera_read_timeout']);
            this.ls.set('max_camera_read', data['max_camera_read']);
            this.ls.set('new_card_timeout', data['new_card_timeout']);
        });
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
