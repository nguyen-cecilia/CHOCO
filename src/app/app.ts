import {Component, HostListener} from '@angular/core';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {ButtonComponent} from './components/button/button.component';
import {LucidePlus} from '@lucide/angular';
import {AuthStateService} from './features/auth/auth-state.service';
import {CommonModule} from '@angular/common';
import {AppUpdateService} from './core/app-update.service';

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
    isScrolled = false;

    constructor(
        protected readonly authState: AuthStateService,
        private appUpdate: AppUpdateService
    ) {
    }

    @HostListener('window:scroll', [])
    onScroll() {
        this.isScrolled = window.scrollY > 30;
    }
}
