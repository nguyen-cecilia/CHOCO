import {Component, inject, signal, OnInit} from '@angular/core';
import {AuthStateService} from '../auth/auth-state.service';
import {User} from '@supabase/supabase-js';
import {TastingService} from './tasting.service';
import {Tasting} from './tasting.model';
import {AlertComponent} from '../../components/alert/alert.component';
import {RouterLink} from '@angular/router';
import {LucideImage} from '@lucide/angular';
import {NgOptimizedImage} from '@angular/common';

@Component({
    selector: 'app-tastings-listing',
    imports: [
        AlertComponent,
        RouterLink,
        LucideImage
        NgOptimizedImage
    ],
    templateUrl: './tastings-listing.component.html',
})
export class TastingsListingComponent implements OnInit {
    private authStateService = inject(AuthStateService);
    private tastingService = inject(TastingService);

    loading = signal(false);
    error = signal<string | null>(null);
    tastings = signal<Tasting[]>([]);
    pictureUrls = signal<Record<string, SafeResourceUrl | null>>({});
    pictureUrls = signal<Record<string, string>>({});
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
        const urls: Record<string, string> = {};

        const picturePromises = tastings.map(async (tasting) => {
            if (tasting.picture_url && this.user) {
                const url = await this.tastingService.getTastingPictureUrl(tasting.picture_url, this.user.id);
                urls[tasting.id] = url || '';
            } else {
                urls[tasting.id] = '';
            }
        });

        await Promise.all(picturePromises);
        this.pictureUrls.set(urls);
    }

    getPictureUrl(tastingId: string): string | null {
        const url = this.pictureUrls()[tastingId];
        return url && url.length > 0 ? url : null;
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
