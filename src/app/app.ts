import {Component, HostListener, inject} from '@angular/core';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {ButtonComponent} from './components/button/button.component';
import {LucideCoffee, LucideHouse, LucidePlus, LucideUser} from '@lucide/angular';
import {AuthStateService} from './features/auth/auth-state.service';
import {CommonModule} from '@angular/common';
import {AppUpdateService} from './core/app-update.service';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [CommonModule, RouterOutlet, ButtonComponent, LucidePlus, RouterLink, RouterLinkActive, LucideCoffee, LucideUser, LucideHouse],
    templateUrl: './app.html',
})
export class App {
    protected readonly authState = inject(AuthStateService);
    private appUpdate = inject(AppUpdateService);

    protected readonly title = 'choco';
    protected navItems = [
        {icon: 'lucideHouse', route: ''},
        {icon: 'lucideCoffee', route: '/degustations'},
        {icon: 'lucideUser', route: '/profil'},
    ];
    isScrolled = false;

    @HostListener('window:scroll', [])
    onScroll() {
        this.isScrolled = window.scrollY > 30;
    }
}
