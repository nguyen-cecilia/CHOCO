import {Component, inject, signal, OnInit, computed} from '@angular/core';
import {AuthStateService} from '../auth/auth-state.service';
import {User} from '@supabase/supabase-js';
import {TastingService} from './tasting.service';
import {Tasting} from './tasting.model';
import {AlertComponent} from '../../components/alert/alert.component';
import {RouterLink} from '@angular/router';
import {
    LucideArrowDown,
    LucideArrowUp,
    LucideFunnel,
    LucideImage,
    LucideLayoutGrid,
    LucideList,
    LucideRefreshCcw
} from '@lucide/angular';
import {DrawerComponent} from '../../components/drawer/drawer.component';
import {ButtonComponent} from '../../components/button/button.component';
import {ReactiveFormsModule} from '@angular/forms';
import {NgOptimizedImage} from '@angular/common';

type SortType = 'creationDate' | 'lastEditDate' | 'note' | 'price' | 'name';

@Component({
    selector: 'app-tastings-listing',
    imports: [
        AlertComponent,
        RouterLink,
        LucideImage,
        DrawerComponent,
        ButtonComponent,
        LucideArrowDown,
        LucideArrowUp,
        LucideFunnel,
        LucideRefreshCcw,
        ReactiveFormsModule,
        NgOptimizedImage,
        LucideLayoutGrid,
        LucideList
    ],
    templateUrl: './tastings-listing.component.html',
})
export class TastingsListingComponent implements OnInit {
    private authStateService = inject(AuthStateService);
    private tastingService = inject(TastingService);

    loading = signal(false);
    error = signal<string | null>(null);
    tastings = signal<Tasting[]>([]);
    pictureUrls = signal<Record<string, string>>({});
    sortBy = signal<SortType>('creationDate');
    sortOrder = signal<'asc' | 'desc'>('desc');
    searchQuery = signal('');
    viewMode = signal<'grid' | 'list'>('list');
    user: User | null = null;

    sortOptions = [
        {id: 'creationDate', label: 'Date de création'},
        {id: 'lastEditDate', label: 'Dernière modification'},
        {id: 'note', label: 'Note'},
        {id: 'price', label: 'Prix'},
        {id: 'name', label: 'Nom du café'},
    ] as const;

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

    resetFilters() {
        this.sortBy.set('creationDate');
        this.sortOrder.set('desc');
        this.sortTastings();

        this.searchQuery.set('');
    }

    filteredTastings = computed(() => {
        const query = this.searchQuery().toLowerCase();
        if (!query) return this.tastings();

        return this.tastings().filter(t =>
            t.cafe_name.toLowerCase().includes(query) ||
            t.cafe_location?.toLowerCase().includes(query)
        );
    });

    onSearchInput(event: Event): void {
        const value = (event.target as HTMLInputElement).value;
        if (value.length > 2 || value.length === 0) {
            this.searchQuery.set(value);
        }
    }

    setSortBy(sortType: SortType) {
        if (this.sortBy() === sortType) {
            this.sortOrder.set(this.sortOrder() === 'asc' ? 'desc' : 'asc');
        } else {
            this.sortBy.set(sortType);
            this.sortOrder.set((sortType === 'name' || sortType === 'price') ? 'asc' : 'desc');
        }
        this.sortTastings();
    }

    private sortTastings() {
        const sorted = [...this.tastings()].sort((a, b) => {
            let compareValue = 0;

            switch (this.sortBy()) {
                case 'creationDate': {
                    const dateA = new Date(a.created_at || 0).getTime();
                    const dateB = new Date(b.created_at || 0).getTime();
                    compareValue = dateA - dateB;
                    break;
                }
                case 'lastEditDate': {
                    const dateA = new Date(a.updated_at || 0).getTime();
                    const dateB = new Date(b.updated_at || 0).getTime();
                    compareValue = dateA - dateB;
                    break;
                }
                case 'note': {
                    compareValue = a.note - b.note;
                    break;
                }
                case 'price': {
                    const priceA = a.price ?? 0;
                    const priceB = b.price ?? 0;
                    compareValue = priceA - priceB;
                    break;
                }
                case 'name': {
                    compareValue = a.cafe_name.localeCompare(b.cafe_name);
                    break;
                }
            }

            return this.sortOrder() === 'asc' ? compareValue : -compareValue;
        });

        this.tastings.set(sorted);
    }
}
