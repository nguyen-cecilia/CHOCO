import {Routes} from '@angular/router';
import {TastingsListingComponent} from './features/tasting/tastings-listing.component';
import {LoginComponent} from './features/auth/login.component';
import {authGuard} from './features/auth/auth.guard';
import {ProfileComponent} from './features/profile/profile.component';
import {TastingUpdateComponent} from './features/tasting/tasting-update.component';
import {TastingDetailComponent} from './features/tasting/tasting-detail.component';
import {PageNotFoundComponent} from './components/page-not-found/page-not-found.component';
import {DashboardComponent} from './features/dashboard/dashboard.component';

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
                component: DashboardComponent,
            },
            {
                path: 'degustations',
                component: TastingsListingComponent,
            },
            {
                path: 'degustation/:id',
                component: TastingDetailComponent,
            },
            {
                path: 'profil',
                component: ProfileComponent,
            },
            {
                path: 'ajouter-degustation',
                component: TastingUpdateComponent,
            }
        ],
    },
    {
        path: 'not-found',
        component: PageNotFoundComponent,
    },
    {
        path: '**',
        component: PageNotFoundComponent,
    },
];
