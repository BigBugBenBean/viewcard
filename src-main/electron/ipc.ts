import '../../rxjs.operator';

import { ipcMain } from 'electron';
import { app, dialog } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { Observable } from 'rxjs/Observable';

import { ElectronApplication } from './application';

export class IpcService {

    private ipc: Electron.IpcMain;

    constructor() {
        this.ipc = ipcMain;

    }


}
