import {Injectable} from '@angular/core';
import {supabase} from '../../core/supabase/client';

export interface Profile {
    id: string;
    display_name: string;
    avatar_url: string;
    updated_at?: string;
}

@Injectable({
    providedIn: 'root',
})
export class ProfileService {
    async getProfile(userId: string): Promise<Profile | null> {
        const {data, error} = await supabase
            .from('profiles')
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
            .from('profiles')
            .upsert({
                id: profile.id,
                display_name: profile.display_name,
                avatar_url: profile.avatar_url,
                updated_at: new Date().toISOString(),
            });

        if (error) {
            throw error;
        }
    }

    async uploadAvatar(filePath: string, file: File, oldAvatarPath?: string) {
        if (oldAvatarPath) {
            const {error: deleteError} = await supabase.storage
                .from('avatars')
                .remove([oldAvatarPath]);

            if (deleteError) {
                console.error('Erreur lors de la suppression de l\'ancienne image:', deleteError);
            }
        }

        const {error} = await supabase.storage
            .from('avatars')
            .upload(filePath, file, {upsert: true});

        if (error) {
            throw error;
        }

        return filePath;
    }

    downLoadImage(path: string) {
        return supabase.storage.from('avatars').download(path);
    }

    getAvatarUrl(filePath: string): string {
        const {data} = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

        return data.publicUrl;
    }
}
