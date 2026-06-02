import {Component, inject, OnInit, signal} from '@angular/core';
import {TastingService} from './tasting.service';
import {Tasting} from './tasting.model';
import {ActivatedRoute} from '@angular/router';
import {LucideMapPin} from '@lucide/angular';
import {CurrencyPipe} from '@angular/common';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {User} from '@supabase/supabase-js';
import {AuthStateService} from '../auth/auth-state.service';

@Component({
    selector: 'app-tasting-detail',
    imports: [
        LucideMapPin,
        CurrencyPipe
    ],
    templateUrl: './tasting-detail.component.html',
})
export class TastingDetailComponent implements OnInit {
    private authStateService = inject(AuthStateService);
    private tastingService = inject(TastingService);
    private dom = inject(DomSanitizer);

    loading = signal(false);
    error = signal<string | null>(null);
    tastingId = signal<string>('');
    tasting = signal<Tasting>({} as Tasting);
    pictureUrl = signal<SafeResourceUrl | null>(null);
    private activatedRoute = inject(ActivatedRoute);
    user: User | null = null;

    constructor() {
        this.activatedRoute.params.subscribe((params) => {
            this.tastingId.set(params['id']);
        });
    }

    async ngOnInit() {
        this.user = this.authStateService.getCurrentUser();
        if (this.user) {
            await this.getTasting();
        }
    }

    private async getTasting() {
        try {
            this.loading.set(true);

            const data = await this.tastingService.getTasting(this.tastingId());
            if (data) {
                this.tasting.set(data);

                if (data.picture_url && this.user) {
                    const {data: picture} = await this.tastingService.downloadTastingPicture(data.picture_url, this.user.id);
                    if (picture instanceof Blob) {
                        this.pictureUrl.set(this.dom.bypassSecurityTrustResourceUrl(URL.createObjectURL(picture)));
                    }
                }
            }
        } catch (error) {
            this.error.set(`Erreur lors du chargement de la dégustation. ${error}`);
        } finally {
            this.loading.set(false);
        }
    }

    private qualityLabels: Record<number, string> = {
        1: 'Artisanal',
        2: 'Industriel'
    };

    getChocoQuality(quality: number | null): string {
        if (quality === null || quality === undefined) {
            return 'Non défini';
        }
        return this.qualityLabels[quality] ?? 'Inconnu';
    }
}
