/**
 * Angular 2 decorators and services
 */
import {
  Component,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import { AppState } from './app.service';
import { TranslateService } from '@ngx-translate/core';

/**
 * App Component
 * Top Level Component
 */
@Component({
  selector: 'sc2-app',
  encapsulation: ViewEncapsulation.None,
  styleUrls: [ './app.component.css' ],
  template: `
    <main>
      <router-outlet></router-outlet>
    </main>

  `
})
export class AppComponent {

  constructor(private translate: TranslateService) {
    this.translate.addLangs(['en-US', 'zh-CN', 'zh-HK']);
    this.translate.setDefaultLang('en-US');
    const browserLang: string = this.translate.getBrowserLang();
    this.translate.use(browserLang.match(/en-US|zh-HK/) ? browserLang : 'en-US');
   }

}
