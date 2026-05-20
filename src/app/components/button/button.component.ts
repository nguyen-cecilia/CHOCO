import {Component, Input} from '@angular/core';

@Component({
    selector: 'button[app-button], a[app-button]',
    template: `
        <ng-content/>
    `,
    host: {
        '[class]': 'classes()',
        '[attr.type]': 'type',
        '[attr.disabled]': 'disabled ? "" : null',
    },
})
export class ButtonComponent {
    @Input() type: 'button' | 'submit' | 'reset' = 'button';
    @Input() disabled = false;
    @Input() variant: 'primary' | 'secondary' | 'tertiary' | 'menu' = 'primary';
    @Input() shape: 'pill' | 'round' = 'pill';

    classes(): string {
        const base = 'flex items-center gap-2 leading-4 text-sm transition-all cursor-pointer';

        const variants = {
            primary: 'bg-green hover:bg-pink hover:text-white',
            secondary: 'bg-purple text-white hover:bg-brown',
            tertiary: 'bg-pink text-white hover:bg-purple',
            menu: 'bg-blue-light hover:bg-brown hover:text-white',
        };

        const shapes = {
            pill: 'rounded-full px-5 py-3',
            round: 'rounded-full p-2',
        };

        return `${base} ${variants[this.variant]} ${shapes[this.shape]}`;
    }
}
