import {Component, Input} from '@angular/core';

@Component({
    selector: 'app-button',
    imports: [],
    templateUrl: './button.html',
    host: {
        '[class]': 'classes()',
        '[attr.disabled]': 'disabled ? "" : null',
        '[attr.type]': 'type',
    },
})
export class Button {
    @Input() type: 'button' | 'submit' | 'reset' = 'button';
    @Input() disabled = false;
    @Input() variant: 'primary' | 'secondary' | 'menu' = 'primary';
    @Input() shape: 'pill' | 'round' = 'pill';

    classes(): string {
        const base = 'flex items-center gap-2  text-sm transition-all cursor-pointer';

        const variants = {
            primary: 'bg-green hover:bg-pink',
            secondary: 'bg-purple text-white hover:bg-brown',
            menu: 'bg-blue-light hover:bg-brown hover:text-white',
        };

        const shapes = {
            pill: 'rounded-full px-5 py-2',
            round: 'rounded-full p-2',
        };

        return `${base} ${variants[this.variant]} ${shapes[this.shape]}`;
    }
}
