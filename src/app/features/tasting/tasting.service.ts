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
            .eq('user_id', userId)
            .order('created_at', {ascending: false});

        if (error) {
            console.error('Erreur lors du chargement des dégustations:', error);
            return null;
        }

        return data;
    }

    async getTasting(id: string): Promise<Tasting | null> {
        const {data, error} = await supabase
            .from(this.TASTING_TABLE_NAME)
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Erreur lors du chargement de la dégustation:', error);
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

    async deleteTasting(id: string): Promise<void> {
        const {error} = await supabase
            .from(this.TASTING_TABLE_NAME)
            .delete()
            .eq('id', id);

        if (error) {
            throw error;
        }
    }
}
