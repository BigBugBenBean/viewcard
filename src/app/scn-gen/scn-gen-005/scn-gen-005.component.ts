import { Component } from '@angular/core';
import { Router } from '@angular/router'

@Component ({
    templateUrl: './scn-gen-005.component.html',
    styleUrls: ['./scn-gen-005.component.scss']
})

export class Page5Component {
    constructor(private router: Router) { }

    nextRoute(next: String) {
        this.router.navigate([next]);
    }
}
