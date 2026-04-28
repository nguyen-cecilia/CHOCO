import {Component, signal} from '@angular/core';
import {Router} from '@angular/router';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, Validators, ReactiveFormsModule} from '@angular/forms';
import {AuthService} from '../../core/auth/auth.service';
import {ButtonComponent} from '../../shared/components/button/button';
import {Alert} from '../../shared/components/alert/alert';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, ButtonComponent, Alert],
    templateUrl: './login.html',
})
export class LoginComponent {
    loginForm: FormGroup;
    loading = signal(false);
    error = signal<string | null>(null);
    success = signal<string | null>(null);

    constructor(
        private authService: AuthService,
        private router: Router,
        private fb: FormBuilder,
    ) {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
        });
    }

    async login() {
        if (!this.loginForm.valid) {
            this.error.set('Veuillez vérifier les champs du formulaire.');
            return;
        }

        try {
            this.loading.set(true);
            this.error.set(null);
            this.success.set(null);

            const {email, password} = this.loginForm.value;

            const {error} = await this.authService.signInWithPassword(email, password);

            if (error) {
                this.error.set(error.message || 'Erreur lors de la connexion.');
                return;
            }

            this.success.set('Connexion réussie !');
            this.loginForm.reset();

            setTimeout(() => {
                this.router.navigate(['']);
            }, 1000);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erreur inconnue.';
            this.error.set(message);
            console.error('[Login] Exception:', err);
        } finally {
            this.loading.set(false);
        }
    }

    get emailControl() {
        return this.loginForm.get('email');
    }

    get passwordControl() {
        return this.loginForm.get('password');
    }

    get emailError() {
        const control = this.emailControl;
        return control?.invalid && control?.touched;
    }

    get passwordError() {
        const control = this.passwordControl;
        return control?.invalid && control?.touched;
    }
}
