import { Routes } from '@angular/router';
import { Reports } from './reports';
import { Account } from './set.account';
import { Users } from './set.user';
import { Roles } from './set.role';
import { SystemSettings } from './set.settings';

export default [
    { path: '', data: { breadcrumb: 'Settings', id: 'MOD0013'}, component: SystemSettings },
    { path: 'users', data: { breadcrumb: 'Users', id: 'MOD0013' }, component: Users },
    { path: 'roles', data: { breadcrumb: 'Roles', id: 'MOD00014' }, component: Roles },
    { path: 'reports', data: { breadcrumb: 'Reports', id: 'MOD0015' }, component: Reports },
    { path: 'account', data: { breadcrumb: 'Account', id: 'MOD0016' }, component: Account },
    { path: '**', redirectTo: '/notfound' }
] as Routes;
