import {SwUpdate} from '@angular/service-worker';
import {Injectable, inject} from '@angular/core';

@Injectable({providedIn: 'root'})
export class AppUpdateService {
    private swUpdate = inject(SwUpdate);

    constructor() {
        const swUpdate = this.swUpdate;

        if (!swUpdate.isEnabled) return;

        swUpdate.versionUpdates.subscribe(event => {
            if (event.type === 'VERSION_READY') {
                if (confirm('Nouvelle version disponible. Mettre à jour ?')) {
                    window.location.reload();
                }
            }
        });
    }
}
