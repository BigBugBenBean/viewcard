import { Component } from '@angular/core';
import { Router } from '@angular/router'

@Component ({
    templateUrl: './start.component.html',
    styleUrls: ['./start.component.scss']
})

export class StartComponent {
    constructor(private router: Router) { }

    startRouteEn() {
        this.router.navigate(['/kgen-updcsls/privacy'], {queryParams: {'lang': 'EN'}});
    }

    startChRoute() {
        this.router.navigate(['/kgen-updcsls/privacy'], {queryParams: {'lang': 'CN'}});
    }
}
