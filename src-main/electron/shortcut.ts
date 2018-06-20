import { BrowserWindow, globalShortcut, webContents, ipcMain } from 'electron';

import * as electronLocalshortcut from 'electron-localshortcut';

export function registerGlobalShortCut() {
}

export function registerBrowserShortcut(win: Electron.BrowserWindow) {

    electronLocalshortcut.register(win, 'CommandOrControl+F12', () => {
        win.webContents.openDevTools({
            mode: 'bottom'
        });
    });

    electronLocalshortcut.register(win, 'CommandOrControl+F5', () => {
        win.reload();
    });

}
