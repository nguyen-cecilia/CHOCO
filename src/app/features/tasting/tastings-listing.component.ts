import {Component, inject, signal, OnInit} from '@angular/core';
import {AuthStateService} from '../auth/auth-state.service';
import {User} from '@supabase/supabase-js';
import {TastingService} from './tasting.service';
import {Tasting} from './tasting.model';
import {AlertComponent} from '../../components/alert/alert.component';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {RouterLink} from '@angular/router';

@Component({
    selector: 'app-tastings-listing',
    imports: [
        AlertComponent,
        RouterLink
    ],
    templateUrl: './tastings-listing.component.html',
})
export class TastingsListingComponent implements OnInit {
    private authStateService = inject(AuthStateService);
    private tastingService = inject(TastingService);
    private dom = inject(DomSanitizer);

    loading = signal(false);
    error = signal<string | null>(null);
    tastings = signal<Tasting[]>([]);
    pictureUrls = signal<Record<string, SafeResourceUrl | null>>({});
    user: User | null = null;

    async ngOnInit() {
        this.user = this.authStateService.getCurrentUser();
        if (this.user) {
            await this.getTastings();
        }
    }

    private async getTastings() {
        try {
            this.loading.set(true);
            if (!this.user) return;

            const data = await this.tastingService.getTastings(this.user.id);
            if (data) {
                this.tastings.set(data);
                await this.loadPictures(data);
            }
        } catch (error) {
            this.error.set(`Erreur lors du chargement des dégustations. ${error}`);
        } finally {
            this.loading.set(false);
        }
    }

    private async loadPictures(tastings: Tasting[]) {
        const urls: Record<string, SafeResourceUrl | null> = {};

        for (const tasting of tastings) {
            if (tasting.picture_url && this.user) {
                const {data} = await this.tastingService.downloadTastingPicture(tasting.picture_url, this.user.id);
                if (data instanceof Blob) {
                    urls[tasting.id] = this.dom.bypassSecurityTrustResourceUrl(URL.createObjectURL(data));
                }
            } else {
                urls[tasting.id] = null;
            }
        }

        this.pictureUrls.set(urls);
    }

    getPictureUrl(tastingId: string): SafeResourceUrl | null {
        return this.pictureUrls()[tastingId] || null;
    }

    getColorsByNote(note: number): { border: string; bg: string } {
        if (note <= 2) {
            return {border: 'border-pink', bg: 'bg-yellow'};
        } else if (note <= 5) {
            return {border: 'border-orange', bg: 'bg-purple-light'};
        } else if (note <= 8) {
            return {border: 'border-yellow', bg: 'bg-blue-light'};
        } else {
            return {border: 'border-blue-light', bg: 'bg-green'};
        }
    }
}
