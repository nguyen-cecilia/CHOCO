import {inject} from '@angular/core';
import {CanActivateFn, Router} from '@angular/router';
import {AuthStateService} from './auth-state.service';

export const authGuard: CanActivateFn = async () => {
    const authState = inject(AuthStateService);
    const router = inject(Router);

    while (authState.isLoading()) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    if (!authState.isAuthenticated()) {
        await router.navigate(['/connexion']);
        return false;
    }

    return true;
};
