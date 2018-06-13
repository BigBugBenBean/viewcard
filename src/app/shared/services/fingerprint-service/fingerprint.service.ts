/**
 * @author James
 * @since
 * @copyright pccw
 */
import {MsksService} from '../../msks';
import {Injectable} from '@angular/core';
import {ConfirmComponent} from '../../sc2-confirm';

@Injectable()
export class FingerprintService {

    constructor(private service: MsksService) {}

    /**
     * get fingerprint data fun.
     */
    getFingerprintData() {
        console.log('start call function : getFingerprintData');
    }

    /**
     *  start scanner fingerprint
     */
    startFingerprintScanner(fingerprintCode: ConfirmComponent, fingerprintInfo: string) {
        console.log('call : startFingerprintScanner fun.')
        this.service.sendRequest('RR_FPSCANNERREG', 'takephoto', {'icno': 'A123456'}).subscribe((resp) => {
            if (resp.errorcode === '0') {
                console.log('fingerprint operate success');
                fingerprintInfo = resp.fpdata;
                fingerprintCode.show();
                setTimeout(() => {
                    fingerprintCode.hide();
                }, 1000)
            }
        });
    }

    /**
     *  stop scanner fingerprint
     */
    stopFingerprintScanner() {
        console.log('call : stopFingerprintScanner fun.')
        this.service.sendRequest('RR_FPSCANNERREG', 'stopscan', {'icno': 'A123456'}).subscribe((resp) => {
            if (resp.errorcode === '0') {
                console.log('fingerprint scanner stop success');

            }
        });
    }
}
