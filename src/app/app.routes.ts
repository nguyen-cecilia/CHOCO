import {Routes} from '@angular/router';
import {TastingsListingComponent} from './features/tasting/pages/tastings_listing';
import {LoginComponent} from './features/auth/login';
import {authGuard} from './core/auth/auth.guard';
import {ProfileComponent} from './features/auth/profile';

export const routes: Routes = [
    {
        path: 'connexion',
        component: LoginComponent,
    },
    {
        path: '',
        canActivate: [authGuard],
        children: [
            {
                path: '',
                component: TastingsListingComponent,
            },
            {
                path: 'profil',
                component: ProfileComponent,
            },
        ],
    },
];
