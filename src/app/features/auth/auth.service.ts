import {Injectable} from '@angular/core';
import {supabase} from '../../core/supabase/client';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    async signInWithPassword(email: string, password: string) {
        return supabase.auth.signInWithPassword({email, password});
    }

    async signInWithOtp(email: string) {
        return supabase.auth.signInWithOtp({email});
    }

    async signOut() {
        return supabase.auth.signOut();
    }

    async updatePassword(newPassword: string) {
        return supabase.auth.updateUser({password: newPassword});
    }
}
