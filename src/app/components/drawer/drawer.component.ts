import {Component, Input, signal} from '@angular/core';
import {LucideX} from '@lucide/angular';

@Component({
    selector: 'app-drawer',
    imports: [
        LucideX
    ],
    templateUrl: './drawer.component.html',
})
export class DrawerComponent {
    @Input() isOpen = signal(false);
    @Input() title = '';

    open(): void {
        this.isOpen.set(true);
    }

    close(): void {
        this.isOpen.set(false);
    }
}
