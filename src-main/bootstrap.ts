import * as path from 'path';

import * as fs from 'fs-extra';

import * as yamljs from 'yamljs';

import { app, dialog } from 'electron';

import { DiContainer } from './ioc';

import { TerminalLogger } from './logger';

import { ProgramLauncher } from './programlauncher';

import { registerGlobalShortCut, BrowserWindowFactory, ElectronApplication } from './electron';

export function bootstrap() {

    const cfgf = path.resolve(path.join(CFGDIR, 'app.yml'))

    if (fs.existsSync(cfgf)) {
        const cfg = yamljs.load(cfgf);

        const applcfg = {
            starturl: cfg.starturl,
            webappdir: path.resolve(path.join(REOSURCE_PATH, 'webapp'))
        };

        const appl = new ElectronApplication(applcfg);

        appl.startApplication();
    } else {
        app.quit();
    }

}
