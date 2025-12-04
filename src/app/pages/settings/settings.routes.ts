import { Routes } from '@angular/router';
import { Reports } from './reports';
import { Account } from './account';
import { Settings } from './settings';
import { Users } from './set.user';
import { Roles } from './set.role';

export default [
    { path: '', data: { breadcrumb: 'Settings' }, component: Settings },
    { path: 'users', data: { breadcrumb: 'Users' }, component: Users },
    { path: 'roles', data: { breadcrumb: 'Roles' }, component: Roles },
    { path: 'reports', data: { breadcrumb: 'Reports' }, component: Reports },
    { path: 'account', data: { breadcrumb: 'Account' }, component: Account },
    { path: '**', redirectTo: '/notfound' }
] as Routes;
