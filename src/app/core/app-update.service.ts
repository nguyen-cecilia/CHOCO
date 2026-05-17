import {SwUpdate} from '@angular/service-worker';
import {Injectable} from '@angular/core';

@Injectable({providedIn: 'root'})
export class AppUpdateService {
    constructor(private swUpdate: SwUpdate) {
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
