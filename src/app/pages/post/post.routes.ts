import { Routes } from '@angular/router';
import { Orientation } from './post.orientation';
import { Schedule } from './post.schedule';
import { NewsUpdates } from './ml.newsupdates';
import { Slot } from './post.slot';
import { Billing } from './billing.component';

export default [
    { path: 'schedules', data: { breadcrumb: 'Schedule', id: 'MOD0008' }, component: Schedule },
    { path: 'slots', data: { breadcrumb: 'Slot', id: 'MOD0008' }, component: Slot },
    { path: 'billing', data: { breadcrumb: 'Billing', id: 'MOD0018' }, component: Billing },
    { path: 'orientations', data: { breadcrumb: 'Orientation', id: 'MOD0009' }, component: Orientation },
    { path: 'newsupdates', data: { breadcrumb: 'NewsUpdates', id: 'MOD0010' }, component: NewsUpdates },
    { path: '**', redirectTo: '/notfound' }
] as Routes;
