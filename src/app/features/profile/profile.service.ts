import {Injectable} from '@angular/core';
import {supabase} from '../../core/supabase/client';

export interface Profile {
    id: string;
    display_name: string;
    avatar_url: string;
    currencies?: string[];
    updated_at?: string;
}

@Injectable({
    providedIn: 'root',
})
export class ProfileService {
    private PROFILE_TABLE_NAME = 'profile';
    private AVATAR_BUCKET_NAME = 'avatars';

    async getProfile(userId: string): Promise<Profile | null> {
        const {data, error} = await supabase
            .from(this.PROFILE_TABLE_NAME)
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Erreur lors du chargement du profil:', error);
            return null;
        }

        return data;
    }

    async updateProfile(profile: Profile): Promise<void> {
        const {error} = await supabase
            .from(this.PROFILE_TABLE_NAME)
            .upsert({
                id: profile.id,
                display_name: profile.display_name,
                avatar_url: profile.avatar_url,
                currencies: profile.currencies || [],
                updated_at: new Date().toISOString(),
            });

        if (error) {
            throw error;
        }
    }

    async uploadAvatar(filePath: string, file: File, userId: string, oldAvatarPath: string | null) {
        if (oldAvatarPath) {
            const {error: deleteError} = await supabase.storage
                .from(this.AVATAR_BUCKET_NAME)
                .remove([`${userId}/${oldAvatarPath}`]);

            if (deleteError) {
                console.error('Erreur lors de la suppression de l\'ancienne image:', deleteError);
            }
        }

        const avatarFilePath = `${userId}/${filePath}`;

        const {error} = await supabase.storage
            .from(this.AVATAR_BUCKET_NAME)
            .upload(avatarFilePath, file, {upsert: true});

        if (error) {
            throw error;
        }

        return avatarFilePath;
    }

    async getAvatarUrl(path: string, userId: string, expiresIn = 3600) {
        const {data} = await supabase.storage
            .from(this.AVATAR_BUCKET_NAME)
            .createSignedUrl(`${userId}/${path}`, expiresIn);
        return data?.signedUrl || null;
    }
}
