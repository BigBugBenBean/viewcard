import { BrowserWindow } from 'electron';

import { registerBrowserShortcut } from './shortcut';

const defaultcfg: Electron.BrowserWindowConstructorOptions = {
    show: false,
    kiosk: true,
    resizable: false,
    webPreferences: {
        plugins: true,
        nodeIntegration: true,
        devTools: true,
    }
};

export class BrowserWindowFactory {

    public static constructWindow(
        config: Electron.BrowserWindowConstructorOptions = defaultcfg): Electron.BrowserWindow {
        let mainwin = new BrowserWindow(config);

        // mainwin.webContents.openDevTools();
        mainwin.setMenu(null);

        mainwin.webContents.on('did-start-loading', (event, url) => {
            // console.log('*** size: ', mainwin.getSize());
            // console.log('start navigate', event, url);
        });

        mainwin.webContents.on('did-stop-loading', (event, url) => {
            // console.log('stop navigate', event, url);
        });

        mainwin.once('ready-to-show', () => {
            // mainwin.show();
            // mainwin.focusOnWebView();
        });

        mainwin.on('closed', () => {
            mainwin = undefined;
        });

        mainwin.webContents.on('new-window', (event, url) => {
            event.preventDefault();
            const childwin = new BrowserWindow(config);
            childwin.loadURL(url);
            childwin.show();
            registerBrowserShortcut(childwin);
        });

        registerBrowserShortcut(mainwin);

        return mainwin;
    }

}
