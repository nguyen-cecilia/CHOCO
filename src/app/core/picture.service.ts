import {Injectable, inject} from '@angular/core';
import {TastingService} from '../features/tasting/tasting.service';
import {Tasting} from '../features/tasting/tasting.model';

@Injectable({
    providedIn: 'root'
})
export class PictureService {
    private tastingService = inject(TastingService);

    async loadPictures(tastings: Tasting[], userId: string): Promise<Record<string, string>> {
        const urls: Record<string, string> = {};

        const picturePromises = tastings.map(async (tasting) => {
            if (tasting.picture_url) {
                const url = await this.tastingService.getTastingPictureUrl(tasting.picture_url, userId);
                urls[tasting.id] = url || '';
            } else {
                urls[tasting.id] = '';
            }
        });

        await Promise.all(picturePromises);
        return urls;
    }

    getPictureUrl(urls: Record<string, string>, tastingId: string): string | null {
        const url = urls[tastingId];
        return url && url.length > 0 ? url : null;
    }
}
