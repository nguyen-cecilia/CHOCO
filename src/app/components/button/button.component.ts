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
    @Input() variant: 'primary' | 'secondary' | 'tertiary' | 'menu' | 'invalid' = 'primary';
    @Input() shape: 'pill' | 'round' = 'pill';

    classes(): string {
        const base = 'flex items-center gap-2 leading-4 text-sm transition-all cursor-pointer';

        const variants = {
            primary: 'bg-linear-to-br/oklch from-green to-green/50 hover:from-pink hover:to-pink/75 hover:text-white',
            secondary: 'bg-linear-to-br/oklch from-purple to-pink text-white hover:bg-linear-to-br hover:from-brown hover:to-brown-light',
            tertiary: 'bg-linear-to-br/oklch from-pink to-orange text-white hover:from-purple hover:to-purple-light',
            menu: 'bg-blue-light hover:bg-linear-to-br hover:from-brown hover:to-brown-light hover:text-white',
            invalid: 'bg-red text-white hover:bg-red-800',
        };

        const shapes = {
            pill: 'rounded-full px-5 py-3',
            round: 'rounded-full p-2.5',
        };

        return `${base} ${variants[this.variant]} ${shapes[this.shape]}`;
    }
}
