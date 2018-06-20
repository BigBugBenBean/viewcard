import * as path from 'path';
import * as Assert from 'assert';
import * as fs from 'fs-extra';
import * as url from 'url';
import '../rxjs.operator';

import { app, BrowserWindow, dialog, Menu } from 'electron';
import { Observable } from 'rxjs/Observable';

import { BrowserWindowFactory } from './browserwindow';
import { registerGlobalShortCut } from './shortcut';
import { IpcService } from './ipc';

export class ElectronApplication {

    private static HTTP_REGEX = `(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|
    www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|
        (?!www))[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9]\.[^\s]{2,})`;

    private appl: Electron.App = app;
    private mainwin: Electron.BrowserWindow;

    constructor(private config: {
        starturl: string
        webappdir: string
    }) { }

    public startApplication() {

        const defaultcfg: Electron.BrowserWindowConstructorOptions = {
            show: true,
            kiosk: true,
            resizable: false,
            webPreferences: {
                plugins: true,
                nodeIntegration: true,
                devTools: true,
            }
        };

        this.appl.on('ready', () => {

            registerGlobalShortCut();

            if (this.config.starturl) {
                const win = BrowserWindow.getAllWindows();
                if (win) {
                    win.forEach((w) => w.close());
                }
                this.mainwin = BrowserWindowFactory.constructWindow(defaultcfg);

                const pageurl = this.formatAppUrl(this.config.starturl);

                this.mainwin.loadURL(pageurl);
                this.mainwin.show();
            }
        });

        this.appl.on('activate', () => {
            if (!this.mainwin && this.config.starturl) {
                this.mainwin = BrowserWindowFactory.constructWindow();
                this.mainwin.loadURL(this.config.starturl);
            }
        });

        this.appl.on('window-all-closed', () => {
            if (process.platform !== 'darwin') {
                if (this.mainwin) {
                    this.mainwin = undefined;
                    app.quit();
                }
            }
        });
    }

    public stopApplication() {
        if (this.appl) {
            this.appl.quit();
        }
    }

    public closeMainWin() {
        if (this.mainwin) {
            this.mainwin.close();
            this.mainwin = undefined;
        }
    }

    public loadUrl(desturl: string) {
        if (!this.mainwin) {
            this.mainwin = BrowserWindowFactory.constructWindow();
        }

        this.mainwin.loadURL(desturl);
        this.mainwin.show();
        this.mainwin.focus();
        // this.mainwin.webContents.openDevTools({
        //     mode: 'bottom'
        // });
    }

    public showError(title: string, content: string) {
        dialog.showErrorBox(title, content);
    }

    public formatAppUrl(route: string) {
        if (route.match(ElectronApplication.HTTP_REGEX)) {
            return route;
        } else {

            const appurl = url.format({
                pathname: path.join(this.config.webappdir, 'index.html'),
                protocol: 'file:',
                slashes: true
            }).concat(route);

            console.log('appurl', appurl);
            return appurl;
        }
    }
}
