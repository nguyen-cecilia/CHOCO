import {Component, signal} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {Button} from './shared/components/button/button';
import {LucidePlus} from '@lucide/angular';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, Button, LucidePlus],
    templateUrl: './app.html',
})
export class App {
    protected readonly title = signal('choco');
}
