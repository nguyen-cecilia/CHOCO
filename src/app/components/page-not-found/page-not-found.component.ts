import { Component } from '@angular/core';
import {RouterLink} from '@angular/router';
import {LucideHouse} from '@lucide/angular';
import {ButtonComponent} from '../button/button.component';

@Component({
  selector: 'app-page-not-found',
    imports: [
        RouterLink,
        LucideHouse,
        ButtonComponent
    ],
  templateUrl: './page-not-found.component.html',
})
export class PageNotFoundComponent {

}
