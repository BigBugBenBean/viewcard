import {Injectable} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {MsksService} from '../../msks';
import {CHANNEL_ID_RR_CARDREADER, CHANNEL_ID_RR_ICCOLLECT, CHANNEL_ID_RR_NOTICELIGHT} from '../../var-setting';
@Injectable()
export class CommonService {

    constructor(private router: Router,
                private service: MsksService,
                private translate: TranslateService) {}
    doCloseWindow() {
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
}
