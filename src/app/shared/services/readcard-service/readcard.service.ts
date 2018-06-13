import {Injectable} from '@angular/core';
import {MsksService} from '../../msks';

@Injectable()
export class ReadcardService {
    constructor(private service: MsksService) {}

    /**
     *  readCard info b
     */
    readCardFromChip() {
        console.log('call : readCardFromChip fun.')
        this.service.sendRequest('RR_cardreader', 'readhkicv2citizen', {}).subscribe((resp) => {
            if (resp.errorcode === '0') {
                console.log('readCardFromChip operate success');
                alert(resp);

            }
        });
    }

    /**
     * validate Authority.
     */
    validateAuthority() {
        console.log('call validateAuthority');
        const param = {
            'date_of_registration': null,
            'hkic_no': null
        }
        this.service.sendRequest('RR_cardreader', 'opencard', {'contactless_password': param}).subscribe((resp) => {
            if (resp.errorcode === '0') {
                console.log('call validateAuthority operate success');
                this.readCardFromChip();

            } else {
                console.log('call validateAuthority fail');
            }
        });
    }
    /**
     * scan card info.
     */
    scanCardInfo() {
        console.log('call : scanCardInfo fun.')
        this.service.sendRequest('RR_CIDOCR', 'scandata ', {}).subscribe((resp) => {
            if (resp.errorcode === '0') {
                console.log('scanCardInfo operate success');
                this.readCardInfoByNFC();

            }
        });
    }

    /**
     * get card information by NFC.
     */
    readCardInfoByNFC() {
        console.log('call : readCardInfoByNFC fun.')
    }
}
