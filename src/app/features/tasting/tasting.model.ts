export interface Tasting {
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
    picture_url: string | null;
    user_id: string;
    created_at?: string;
    updated_at?: string;
}

export type TastingInput = Omit<Tasting, 'id' | 'created_at' | 'updated_at'> & {
    id?: string;
};
