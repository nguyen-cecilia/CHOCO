import {Injectable} from '@angular/core';
import {supabase} from '../../core/supabase/client';
import {Tasting, TastingInput} from './tasting.model';


@Injectable({
    providedIn: 'root',
})
export class TastingService {
    private TASTING_TABLE_NAME = 'tasting';
    private TASTING_PICTURES_BUCKET_NAME = 'tasting-pictures';

    async getTastings(userId: string): Promise<Tasting[] | null> {
        const {data, error} = await supabase
            .from(this.TASTING_TABLE_NAME)
            .select('*')
            .eq('user_id', userId);

        if (error) {
            console.error('Erreur lors du chargement des dégustations:', error);
            return null;
        }

        return data;
    }

    async upsertTasting(tasting: TastingInput): Promise<void> {
        const {error} = await supabase
            .from(this.TASTING_TABLE_NAME)
            .upsert({
                ...tasting,
                updated_at: new Date().toISOString(),
            });

        if (error) {
            throw error;
        }
    }

    async uploadTastingPicture(filePath: string, file: File, userId: string, oldPicturePath?: string) {
        if (oldPicturePath) {
            const {error: deleteError} = await supabase.storage
                .from(this.TASTING_PICTURES_BUCKET_NAME)
                .remove([`${userId}/${oldPicturePath}`]);

            if (deleteError) {
                console.error('Erreur lors de la suppression de l\'ancienne image:', deleteError);
            }
        }

        const picturePath = `${userId}/${filePath}`;

        const {error} = await supabase.storage
            .from(this.TASTING_PICTURES_BUCKET_NAME)
            .upload(picturePath, file, {upsert: true});

        if (error) {
            throw error;
        }

        return filePath;
    }

    downloadTastingPicture(path: string, userId: string) {
        return supabase.storage.from(this.TASTING_PICTURES_BUCKET_NAME).download(`${userId}/${path}`);
    }

    getTastingPictureUrl(filePath: string): string {
        const {data} = supabase.storage
            .from(this.TASTING_PICTURES_BUCKET_NAME)
            .getPublicUrl(filePath);

        return data.publicUrl;
    }
}
