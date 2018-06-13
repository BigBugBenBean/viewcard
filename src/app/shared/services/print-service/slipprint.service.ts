import {Injectable} from '@angular/core';
import {MsksService} from '../../msks';

@Injectable()
export class SlipprintService {

    constructor(private service: MsksService) {}
    /**
     *  start print
     */
    printSlip(dataJson) {
        console.log('call : printslip fun.' + JSON.stringify(dataJson))
        this.service.sendRequest('RR_SLIPPRINTER', 'printslip', {'data': dataJson}).subscribe((resp) => {
            if (resp.errorcode === '0') {
                console.log('printslip operate success');

            } else {
                console.log('call printslip fail!');
            }
        });
    }
}
