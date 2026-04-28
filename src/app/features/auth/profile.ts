import {Component, OnInit, signal} from '@angular/core';
import {FormGroup, FormBuilder, Validators, ReactiveFormsModule} from '@angular/forms';
import {ButtonComponent} from '../../shared/components/button/button';
import {AuthService} from '../../core/auth/auth.service';
import {AuthStateService} from '../../core/auth/auth-state.service';
import {ProfileService} from '../../core/auth/profile.service';
import {CommonModule} from '@angular/common';
import {User} from '@supabase/supabase-js';
import {LucideLogOut, LucideSave} from '@lucide/angular';
import {Alert} from '../../shared/components/alert/alert';
import {Router} from '@angular/router';
import {AvatarComponent} from '../../shared/components/avatar/avatar';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, ButtonComponent, LucideLogOut, LucideSave, Alert, AvatarComponent],
    templateUrl: './profile.html',
})
export class ProfileComponent implements OnInit {
    profileForm!: FormGroup;
    loading = signal(false);
    error = signal<string | null>(null);
    success = signal<string | null>(null);
    user: User | null = null;

    constructor(
        private authService: AuthService,
        private authStateService: AuthStateService,
        private profileService: ProfileService,
        private fb: FormBuilder,
        private router: Router,
    ) {
        this.profileForm = this.fb.group({
            email: [{value: '', disabled: true}],
            displayName: ['', [Validators.required, Validators.minLength(3)]],
            avatarUrl: '',
            newPassword: [''],
            newPasswordConfirm: [''],
        });
    }

    async ngOnInit() {
        this.user = this.authStateService.getCurrentUser();
        if (this.user) {
            await this.getProfile();
        }
    }

    get avatarUrl() {
        return this.profileForm.value.avatarUrl as string;
    }

    async updateAvatar(event: string): Promise<void> {
        this.profileForm.patchValue({
            avatarUrl: event,
        });
        await this.updateProfile();
    }

    private async getProfile() {
        try {
            this.loading.set(true);
            if (!this.user) return;

            const profile = await this.profileService.getProfile(this.user.id);

            this.profileForm.patchValue({
                email: this.user.email,
                avatarUrl: profile?.avatar_url || '',
                displayName: profile?.display_name || '',
            });
        } catch (error) {
            this.error.set(`Erreur lors du chargement du profil. ${error}`);
        } finally {
            this.loading.set(false);
        }
    }

    async updateProfile() {
        if (!this.profileForm.valid || !this.user) {
            this.error.set('Veuillez remplir tous les champs requis.');
            return;
        }

        try {
            this.loading.set(true);

            const {displayName, avatarUrl, newPassword, newPasswordConfirm} = this.profileForm.getRawValue();

            await this.profileService.updateProfile({
                id: this.user.id,
                display_name: displayName,
                avatar_url: avatarUrl,
            });

            if (newPassword && newPasswordConfirm) {
                if (newPassword !== newPasswordConfirm) {
                    this.error.set('Les mots de passe ne correspondent pas.');
                    return;
                }
                await this.authService.updatePassword(newPassword);
            }

            this.success.set('Profil mis à jour avec succès !');
            this.profileForm.get('newPassword')?.reset();
            this.profileForm.get('newPasswordConfirm')?.reset();
        } catch (error) {
            this.error.set('Erreur lors de la mise à jour du profil.');
            console.error('Erreur:', error);
        } finally {
            this.loading.set(false);
        }
    }

    async signOut() {
        try {
            await this.authService.signOut();
            await this.router.navigate(['/connexion']);
        } catch (error) {
            this.error.set('Erreur lors de la déconnexion.');
            console.error('Erreur:', error);
        }
    }
}
