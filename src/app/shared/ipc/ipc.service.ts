import { Injectable } from '@angular/core';

let ipc: Electron.IpcRenderer;
if (process.env.TARGET === 'electron-renderer') {
    import('electron').then((electron) => {
        ipc = electron.ipcRenderer;
    });
}

@Injectable()
export class IpcService {

    public sendAsync(channel: string, ...args) {

        if (ipc) {
            ipc.send(channel, ...args);
        }
    }

    public sendSync(channel: string, ...args) {
        if (ipc) {
            return ipc.sendSync(channel, args);
        }
        return undefined;
    }

    public on(channel: string, fn: (event: Electron.Event, ...args) => void) {
        if (ipc) {
            ipc.on(channel, fn);
        }
    }

    public once(channel: string, fn: (event: Electron.Event, ...args) => void) {
        if (ipc) {
            ipc.once(channel, fn);
        }
    }

}
