import { Component, AfterContentInit, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { MenuService } from '../../shared/menu';
import { MenuItem } from '../../shared/menu/mi.model';
import { TranslateService } from '@ngx-translate/core';
import { MsksService } from '../../shared/msks';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { from } from 'rxjs/observable/from';

@Component({
    templateUrl: './scn-gen-002.component.html',
    styleUrls: ['./scn-gen-002.component.scss']
})

export class Page2Component implements OnInit {

    public menuitems = new Array<any>();

    private paramMap: any;

    private oneId: string;

    constructor(private router: Router,
        private menusrv: MenuService,
        private translate: TranslateService,
        private route: ActivatedRoute,
        private msks: MsksService) { }

    previousRoute() {
        const next = this.oneId ? '/scn-gen/gen002' : '/scn-gen/gen001';
        this.router.navigate([next]);
    }

    nextRoute(next: String) {
        this.router.navigate([next]);
    }
    // demo() {
    //     this.router.navigate(['/scn-gen/gen007']);
    // }

    ngOnInit() {
        this.menuitems.length = 0;

        let param;

        this.route.paramMap.switchMap((params) => {
            param = {
                id: params.get('id'),
                srv: params.get('srv')
            };
            this.oneId = params.get('id');
            return params.has('id') ? this.menusrv.getMenuItems(params.get('id')) : this.menusrv.getMenuItems();
        }).switchMap((mi: MenuItem[]) => {
            if (param.srv) {
                return forkJoin(Observable.of({ msks: true }), this.msks.sendRequest(param.srv, 'getLv2Menu', mi));
            } else {
                return forkJoin(Observable.of({ msks: false }), Observable.of(mi));
            }
        }).subscribe((resp) => {
            const ismsks = resp[0].msks;
            let menu;
            if (ismsks) {
                menu = this.menusrv.convertChildMenu(resp[1]);
            } else {
                menu = resp[1] as MenuItem[];
            }
            let index = 1;
            menu.forEach((mi) => {
                const obj = {
                    ...mi
                };
                obj['index'] = index;
                obj['haschild'] = mi.child !== undefined;
                obj['menukey'] = mi.menukey;
                obj['service'] = mi.service;
                this.menuitems.push(obj);
                index++;
            });
            // console.log(this.menuitems);
        });
    }

    langButton() {
        // this.router.navigate(['main/sck0012'])
        const browserLang = this.translate.currentLang;
        console.log(browserLang);
        if (browserLang === 'zh-HK') {
          this.translate.use('en-US');
        } else {
          this.translate.use('zh-HK');
        }
      }
}
