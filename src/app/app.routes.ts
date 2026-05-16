import {Routes} from '@angular/router';
import {TastingsListingComponent} from './features/tasting/tastings-listing.component';
import {LoginComponent} from './features/auth/login.component';
import {authGuard} from './features/auth/auth.guard';
import {ProfileComponent} from './features/profile/profile.component';
// import {TastingAddComponent} from './features/tasting/tasting-add.component';

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
