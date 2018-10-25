import { Injectable } from '@angular/core';

import * as io from 'socket.io-client';

import { Observable } from 'rxjs/Observable';
import { retryWhen } from 'rxjs/add/operator';

import { Observer } from 'rxjs/Observer';

@Injectable()
export class MsksService {

    public sendRequest(channelid: string, functionid: string, payload: any = {}, stub: string = 'HAS'): Observable<any> {
        return Observable.create((observer: Observer<any>) => {

            const sckclient = io(MSKS.uri, {
                forceNew: true,
                transports: [ 'websocket' ],
                upgrade: false
            });
            sckclient.on('connect', () => {
                console.log('socket client connected');
                const channel = `${MSKS.namespace}/${channelid}`;

                const source = {
                    header: {
                        deviceid: channelid.split('_')[1],
                        channelid,
                        type: stub,
                        function: functionid
                    },
                    payload
                };

                console.log('msks request', channel, functionid, source);

                sckclient.emit('room', JSON.stringify(
                    {
                        room: channelid,
                        source
                    }
                ));

                sckclient.on(channel, (response) => {
                    console.log('msks response', channel, functionid, source, response);
                    observer.next(response.payload);

                    sckclient.disconnect();
                    observer.complete();
                });
            });
            sckclient.on('connect_error', (e) => {
                console.error(`Unable to connect to server ${MSKS.uri}`, e);
                observer.error(`Unable to connect to server ${MSKS.uri}`);
            });
            sckclient.on('error', (e) => {
                console.error(`Error occurred when connect to server ${MSKS.uri}`, e);
                observer.error(`Error occurred when connect to server ${MSKS.uri}`);
            });
        });
    }

    public sendRequestExcptLog(payload) {
        this.sendRequest('RR_AUDIT', 'excptlg', payload).subscribe(resp => {
            console.log(`Exception log:${resp}`, resp);
        });
    }

    public sendRequestTransLog(payload) {
        this.sendRequest('RR_AUDIT', 'translg', payload).subscribe(resp => {
            console.log(`Transcation log:${resp}`, resp);
        });
    }

    public sendTrackLog(message) {
        this.sendRequest('RR_AUDIT', 'tracklg', {'message': message}).subscribe(resp => {
            // console.log(`Transcation log:${resp}`, resp);
        });
    }

    public returnObservableObj(obj) {
        return Observable.of(obj);
    }

    public sendRequestWithLog(channelid: string, functionid: string, payload: any = {}, stub: string = 'HAS'): Observable<any> {
        const obsMain = this.sendRequest(channelid, functionid, payload, stub);
        const head = {'chanlid': channelid, 'funcid': functionid};

        const start = new Date().getTime();
        return obsMain.map((resp) => {
            const end = new Date().getTime();
            payload.times = end - start;
            // let response = JSON.stringify(resp);
            this.sendRequest('RR_AUDIT', 'tracklg', {'head': head, 'resq': payload, 'resp': resp}).subscribe((resp4) => {
            });
            return resp;
        });
    }
}
