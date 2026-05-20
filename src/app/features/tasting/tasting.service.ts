import {Injectable} from '@angular/core';
import {supabase} from '../../core/supabase/client';

interface Tasting {
    id: string;
    cafe_name: string;
    cafe_location?: string;
    price: number | null;
    price_currency?: string;
    note: number;
    choco_intensity: number | null;
    choco_quality: number | null;
    choco_balance: number | null;
    comment?: string;
    picture_url: string | null; // TODO: Enlever le null
    user_id: string;
    created_at?: string;
    updated_at?: string;
}

type TastingInput = Omit<Tasting, 'id' | 'created_at' | 'updated_at'> & {
    id?: string;
};

@Injectable({
    providedIn: 'root',
})
export class TastingService {
    private TASTING_TABLE_NAME = 'tasting';

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
}
