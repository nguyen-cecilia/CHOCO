import {Injectable, signal} from '@angular/core';
import {User} from '@supabase/supabase-js';
import {supabase} from '../supabase/client';

@Injectable({
    providedIn: 'root',
})
export class AuthStateService {
    private userSignal = signal<User | null>(null);
    user$ = this.userSignal.asReadonly();

    private isAuthenticatedSignal = signal<boolean>(false);
    isAuthenticated$ = this.isAuthenticatedSignal.asReadonly();

    private loadingSignal = signal<boolean>(true);
    loading$ = this.loadingSignal.asReadonly();

    constructor() {
        this.initializeAuth();
    }

    private async initializeAuth() {
        const {data: {session}} = await supabase.auth.getSession();

        if (session?.user) {
            this.userSignal.set(session.user);
            this.isAuthenticatedSignal.set(true);
        }

        this.loadingSignal.set(false);

        supabase.auth.onAuthStateChange(async (event, session) => {
            this.userSignal.set(session?.user ?? null);
            this.isAuthenticatedSignal.set(!!session?.user);
        });
    }

    getCurrentUser(): User | null {
        return this.userSignal();
    }

    isAuthenticated(): boolean {
        return this.isAuthenticatedSignal();
    }

    isLoading(): boolean {
        return this.loadingSignal();
    }
}
