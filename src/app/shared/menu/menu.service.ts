import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { forkJoin } from 'rxjs/observable/forkJoin';
import 'rxjs/add/operator/do';
import { HttpClient } from '@angular/common/http';

import { MsksApp, AppType } from './msksapp.model';
import { MenuItem } from './mi.model';
import { MsksService } from '../msks';
import { Subscription } from 'rxjs/Subscription';

@Injectable()
export class MenuService {

    private appmap: Map<string, MsksApp>;
    private lv1timeout: number;
    private lv2timeout: number;
    private initilize = false;
    private menuitems: Array<MenuItem>;
    private initaldata: any;

    constructor(
        private http: HttpClient,
        private msks: MsksService) { }

    public getLv1Timeout(): Observable<number> {
        if (this.initilize) {
            return Observable.of(this.lv1timeout);
        } else {
            return this.getData().switchMap(() => {
                return Observable.of(this.lv1timeout);
            });
        }
    }

    public getLv2Timeout(): Observable<number> {
        if (this.initilize) {
            return Observable.of(this.lv1timeout);
        } else {
            return this.getData().switchMap(() => {
                return Observable.of(this.lv1timeout);
            });
        }
    }

    public getMenuItems(lv1key?: string): Observable<MenuItem[]> {

        if (!this.initilize) {
            return this.getData().switchMap(() => {
                if (lv1key) {
                    let child = [];
                    this.menuitems.forEach((mi) => {
                        if (mi.menukey === lv1key) {
                            child = mi.child;
                        }
                    });
                    return Observable.of(child);

                } else {
                    return Observable.of(this.menuitems);
                }
            });
        } else {
            if (lv1key) {
                let child = [];
                this.menuitems.forEach((mi) => {
                    if (mi.menukey === lv1key) {
                        child = mi.child;
                    }
                });
                return Observable.of(child);
            } else {
                return Observable.of(this.menuitems);
            }
        }
    }

    public convertChildMenu(lv2mis: Array<any>) {
        const child = new Array<MenuItem>();
        const json = sessionStorage.getItem('MSKS_GEN_DATA');
        if (json) {
            const gendata = JSON.parse(json);
            const appmap = this.convertJson2AppMap( gendata['appmap'] as string);
            // console.log('convertChildMenu appmap', appmap);
            lv2mis.forEach((lv2) => {
                const cmi = new MenuItem();
                cmi.chiname = lv2['name_chi'];
                cmi.engname = lv2['name_eng'];
                cmi.menukey = lv2['lv2_menu_key'];

                cmi.iconpathen = lv2['icon_path_en'];
                cmi.iconpathchi = lv2['icon_path_chi'];

                cmi.app = appmap.get(lv2['app_key']);
                child.push(cmi);
            });
            // console.log(this.appmap);
            return child;
        } else {
            return undefined;
        }

    }

    private initMsksAppMap(data: any) {
        const msks = data['mskapps'];
        this.appmap = new Map<string, MsksApp>();

        if (msks) {
            for (const i in msks) {
                if (msks[i]) {
                    const app = new MsksApp();
                    app.appkey = msks[i]['app_key'];
                    app.path = msks[i]['path'];
                    if (msks[i]['type'] === 1) {
                        app.type = AppType.WEB;
                    } else if (msks[i]['type'] === 2) {
                        app.type = AppType.APPLICATION;
                        app.cwd = msks[i]['cwd'];
                    } else {
                        console.error(`Unknow type [${msks[i]['type']}] for: ${msks[i]['app_key']}`);
                        app.type = AppType.UNKNOWN;
                    }
                    // console.log('appmap %s=> %s1', app.appkey, app);
                    this.appmap.set(app.appkey, app);
                }
            }
        }

    }

    private initilizeMenuItem(data: any) {
        if (data['lv1_menus']) {
            const menus = data['lv1_menus'] as any[];
            const rs = new Array<MenuItem>();

            menus.forEach((elm) => {
                const mi = new MenuItem();

                mi.chiname = elm['name_chi'];
                mi.engname = elm['name_eng'];

                mi.iconpathen = elm['icon_path_en'];
                mi.iconpathchi = elm['icon_path_chi'];

                mi.menukey = elm['lv1_menu_key'];

                if (elm['app_key']) {
                    mi.app = this.appmap.get(elm['app_key']);
                }

                if (elm['lv2_menu_service_channel']) {
                    mi.service = elm['lv2_menu_service_channel'];
                }

                if (elm['lv2_menus']) {
                    const child = new Array<MenuItem>();
                    const lv2mis = elm['lv2_menus'];
                    lv2mis.forEach((lv2) => {
                        const cmi = new MenuItem();
                        cmi.chiname = lv2['name_chi'];
                        cmi.engname = lv2['name_eng'];
                        cmi.menukey = lv2['lv2_menu_key'];

                        cmi.iconpathen = lv2['icon_path_en'];
                        cmi.iconpathchi = lv2['icon_path_chi'];

                        cmi.app = this.appmap.get(lv2['app_key']);
                        child.push(cmi);
                    });
                    console.log(this.appmap);
                    mi.child = child;
                }
                rs.push(mi);
            });

            this.menuitems = rs;
        }
    }

    private getData(): Observable<void> {
        const cached = sessionStorage.getItem('MSKS_GEN_DATA');
        if (cached) {
            const obj = JSON.parse(cached);
            this.appmap = obj['appmap'];
            this.menuitems = obj['menuitems'];
            this.lv1timeout = obj['lv1timeout'];
            this.lv2timeout = obj['lv2timeout'];
            this.initilize = true;
            return Observable.of(undefined);
        } else {
            return Observable.create((observer) => {
                this.http.get(`${API_TERMINAL}/terminal/msksgen`)
                    .switchMap((resp) => {
                        this.initMsksAppMap(resp['msksgen']);
                        this.initilizeMenuItem(resp['msksgen']);
                        this.lv1timeout = resp['msksgen']['lvl_timeout'];
                        this.lv2timeout = resp['msksgen']['lv2_timeout'];

                        sessionStorage.setItem('MSKS_GEN_DATA', JSON.stringify({
                            appmap: this.convertAppMap2Json(this.appmap),
                            menuitems: this.menuitems,
                            lv1timeout: this.lv1timeout,
                            lv2timeout: this.lv2timeout
                        }));
                        this.initilize = true;
                        return Observable.of(this.menuitems)
                    })
                    .switchMap((menuitems: MenuItem[]) => {
                        const arr = new Array<Observable<any>>();
                        const paths = new Array<string>();

                        for (const i in menuitems) {
                            if (menuitems[i]) {
                                const mi = menuitems[i];
                                if (mi.iconpathen && paths.indexOf(mi.iconpathen) === -1) {
                                    paths.push(mi.iconpathen);
                                }
                                if (mi.iconpathchi && paths.indexOf(mi.iconpathchi) === -1) {
                                    paths.push(mi.iconpathchi);
                                }

                                if (mi.child) {
                                    const child = mi.child;
                                    for (const j in child) {
                                        if (child[j]) {
                                            if (child[j].iconpathen && paths.indexOf(child[j].iconpathen) === -1) {
                                                paths.push(child[j].iconpathen);
                                            }

                                            if (child[j].iconpathchi && paths.indexOf(child[j].iconpathchi) === -1) {
                                                paths.push(child[j].iconpathchi);
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        for (const i in paths) {
                            if (paths[i]) {
                                arr.push(this.msks.sendRequest('RR_FILESYSTEM', 'getResource', {
                                    'path': paths[i]
                                }));
                            }
                        }

                        return Observable.forkJoin(arr);
                    })
                    .do((resources: any[]) => {
                        for (const i in resources) {
                            if (resources[i]) {
                                if (!resources[i].error) {
                                    // console.log('%s => %s1',resources[i].path, JSON.stringify(resources[i]));
                                    sessionStorage.setItem(resources[i].path, JSON.stringify(resources[i]));
                                }
                            }
                        }
                    })
                    .subscribe((resp) => {
                        observer.next();
                    });
            });
        }
    }

    private convertAppMap2Json(appmap: Map<String, MsksApp>) {
        return JSON.stringify([...appmap]);
    }

    private convertJson2AppMap(json: string) {
        const map = new Map(JSON.parse(json));
        const appmap = new Map<String, MsksApp>();
        map.forEach((v, k) => {
            const app = new MsksApp();
            app.appkey = v['appkey'];
            app.cwd = v['cwd'];
            app.path = v['path'];
            app.type = v['type'];
            appmap.set(k as String, app);
        });
        return appmap;
    }
}
