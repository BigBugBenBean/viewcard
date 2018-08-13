import { Component } from '@angular/core';
import { Router } from '@angular/router'
import {LocalStorageService} from '../../shared/services/common-service/Local-storage.service';

@Component ({
    templateUrl: './start.component.html',
    styleUrls: ['./start.component.scss']
})

export class StartComponent {
    APP_LANG = '';
    constructor(private router: Router,
                private localStorages: LocalStorageService) { }

    startRouteEn() {
        this.APP_LANG = 'en-US';
        this.storeConfigParam();
        this.router.navigate(['/kgen-viewcard/privacy']);
    }

    startChRoute() {
        this.APP_LANG = 'zh-HK';
        this.storeConfigParam();
        this.router.navigate(['/kgen-viewcard/privacy']);
    }

    storeConfigParam() {
        this.localStorages.set('APP_LANG', this.APP_LANG);
    }
}
