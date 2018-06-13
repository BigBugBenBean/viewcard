import { Component } from '@angular/core';
import { Router } from '@angular/router'

@Component ({
    templateUrl: './scn-gen-001.component.html',
    styleUrls: ['./scn-gen-001.component.scss']
})

export class Page1Component {
    constructor(private router: Router) { }

    nextRoute() {
        this.router.navigate(['/gen002']);
    }
}
