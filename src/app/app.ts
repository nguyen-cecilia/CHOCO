import {Component} from '@angular/core';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {ButtonComponent} from './shared/components/button/button';
import {LucidePlus} from '@lucide/angular';
import {AuthStateService} from './core/auth/auth-state.service';
import {CommonModule} from '@angular/common';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [CommonModule, RouterOutlet, ButtonComponent, LucidePlus, RouterLink, RouterLinkActive],
    templateUrl: './app.html',
})
export class App {
    protected readonly title = 'choco';
    protected navItems = [
        {label: 'Dégustations', route: ''},
        {label: 'Profil', route: '/profil'},
    ];

    constructor(protected readonly authState: AuthStateService) {
    }
}
