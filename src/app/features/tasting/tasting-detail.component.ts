import {Component, inject, OnInit, signal} from '@angular/core';
import {TastingService} from './tasting.service';
import {Tasting} from './tasting.model';
import {ActivatedRoute, Router} from '@angular/router';
import {LucideMapPin, LucidePencil, LucideTrash} from '@lucide/angular';
import {CurrencyPipe} from '@angular/common';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {User} from '@supabase/supabase-js';
import {AuthStateService} from '../auth/auth-state.service';
import {ButtonComponent} from '../../components/button/button.component';
import {ModalComponent} from '../../components/modal/modal.component';
import {TastingUpdateComponent} from './tasting-update.component';
import {AlertComponent} from '../../components/alert/alert.component';

@Component({
    selector: 'app-tasting-detail',
    imports: [
        LucideMapPin,
        CurrencyPipe,
        ButtonComponent,
        LucideTrash,
        LucidePencil,
        ModalComponent,
        TastingUpdateComponent,
        AlertComponent,
    ],
    templateUrl: './tasting-detail.component.html',
})
export class TastingDetailComponent implements OnInit {
    private authStateService = inject(AuthStateService);
    private tastingService = inject(TastingService);
    private dom = inject(DomSanitizer);
    private router = inject(Router);
    private activatedRoute = inject(ActivatedRoute);

    loading = signal(false);
    error = signal<string | null>(null);
    success = signal<string | null>(null);
    tastingId = signal<string>('');
    tasting = signal<Tasting>({} as Tasting);
    pictureUrl = signal<SafeResourceUrl | null>(null);
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
            this.error.set(`${error}`);
        } finally {
            this.loading.set(false);
        }
    }

    async onTastingUpdated() {
        this.loading.set(true);
        await this.getTasting();
        this.success.set('Dégustation modifiée !');
        this.loading.set(false);
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

    async deleteTasting() {
        try {
            if (!this.user) return;

            this.loading.set(true);
            await this.tastingService.deleteTasting(this.tastingId(), this.user.id, this.tasting().picture_url || undefined);
            await this.router.navigate(['/']);
        } catch (error) {
            this.error.set(`Erreur lors de la suppression. ${error}`);
        } finally {
            this.loading.set(false);
        }
    }
}
