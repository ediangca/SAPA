import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Dashboard } from './app/pages/dashboard/dashboard';
import { Documentation } from './app/pages/documentation/documentation';
import { Landing } from './app/pages/landing/landing';
import { Notfound } from './app/pages/notfound/notfound';
import { authGuard } from '@/helper/guard/auth.guard';
import { UserResolver } from '@/helper/resolver/user.resolver';
import { authRoutes } from './app/pages/auth/auth.routes';
import { ConfirmAppointmentSuccess } from '@/pages/masterlist/confirm-success';


export const appRoutes: Routes = [
    { path: '', component: Landing },
    {
        path: 'dashboard',
        component: AppLayout,
        resolve: { user: UserResolver },
        canActivate: [authGuard],
        data: { title: 'Dashboard' },
        children: [
            { path: '', component: Dashboard },
            { path: 'masterlist', loadChildren: () => import('./app/pages/masterlist/masterlist.routes') },
            { path: 'post', loadChildren: () => import('./app/pages/post/post.routes') },
            { path: 'settings', loadChildren: () => import('./app/pages/settings/settings.routes') },
            { path: 'documentation', component: Documentation },
            { path: 'pages', loadChildren: () => import('./app/pages/pages.routes') }
        ]
    },

    ...authRoutes,
    { path: 'confirm-success', component: ConfirmAppointmentSuccess },
    // { path: 'landing', component: Landing },
    { path: 'notfound', component: Notfound },
    // { path: 'auth', loadChildren: () => import('./app/pages/auth/auth.routes') },
    { path: '**', redirectTo: '/notfound' }
];
