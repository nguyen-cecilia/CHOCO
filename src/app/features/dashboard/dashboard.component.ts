import {Component, inject, signal, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterLink} from '@angular/router';
import {AuthStateService} from '../auth/auth-state.service';
import {TastingService} from '../tasting/tasting.service';
import {Tasting} from '../tasting/tasting.model';
import {User} from '@supabase/supabase-js';
import {
    LucideMapPin,
    LucideZap,
    LucideAward,
    LucideThumbsDown,
    LucideClock,
    LucideImage,
    LucideHeart,
} from '@lucide/angular';
import {NgOptimizedImage} from '@angular/common';
import {DashboardService, TastingStatistics} from './dashboard.service';
import {AlertComponent} from '../../components/alert/alert.component';
import {ButtonComponent} from '../../components/button/button.component';
import {ColorService} from '../../core/color.service';
import {PictureService} from '../../core/picture.service';
import {ProfileService} from '../profile/profile.service';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        LucideMapPin,
        LucideZap,
        LucideAward,
        LucideThumbsDown,
        LucideClock,
        NgOptimizedImage,
        AlertComponent,
        LucideImage,
        ButtonComponent,
        LucideHeart,
    ],
    templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
    private authStateService = inject(AuthStateService);
    private tastingService = inject(TastingService);
    private statisticsService = inject(DashboardService);
    private profileService = inject(ProfileService);
    protected pictureService = inject(PictureService);
    protected colorService = inject(ColorService);

    loading = signal(false);
    error = signal<string | null>(null);
    tastings = signal<Tasting[]>([]);
    statistics = signal<TastingStatistics | null>(null);
    pictureUrls = signal<Record<string, string>>({});
    displayName = signal<string>('Inconnu');
    user: User | null = null;

    async ngOnInit() {
        this.user = this.authStateService.getCurrentUser();
        if (this.user) {
            await this.loadTastings();
            const profile = await this.profileService.getProfile(this.user.id);
            if (profile) this.displayName.set(profile.display_name);
        }
    }

    private async loadTastings() {
        try {
            this.loading.set(true);
            if (!this.user) return;

            const data = await this.tastingService.getTastings(this.user.id);
            if (data) {
                this.tastings.set(data);
                this.statistics.set(this.statisticsService.calculateStatistics(data));
                const urls = await this.pictureService.loadPictures(data, this.user.id);
                this.pictureUrls.set(urls);
            }
        } catch (error) {
            this.error.set(`Erreur lors du chargement des dégustations. ${error}`);
        } finally {
            this.loading.set(false);
        }
    }
}
