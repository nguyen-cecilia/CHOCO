import {Component, Input} from '@angular/core';

@Component({
    selector: 'app-alert',
    imports: [],
    templateUrl: './alert.html',
    host: {
        '[class]': 'classes()',
    }
})
export class Alert {
    @Input() variant: 'error' | 'success' = 'error';

    classes(): string {
        const base = 'w-full rounded-sm px-5 py-2';

        const variants = {
            error: 'bg-red/30 text-red',
            success: 'bg-green/30 text-lime-600',
        };

        return `${base} ${variants[this.variant]}`
    }
}
