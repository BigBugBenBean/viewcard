import { Injectable } from '@angular/core';

import * as io from 'socket.io-client';

import { Observable } from 'rxjs/Observable';
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

}
