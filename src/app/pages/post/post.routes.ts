import { Routes } from '@angular/router';
import { Orientation } from './post.orientation';
import { Schedule } from './post.schedule';
import { NewsUpdates } from './ml.newsupdates';

export default [
    { path: 'schedules', data: { breadcrumb: 'Schedule', id: 'MOD0008' }, component: Schedule },
    { path: 'orientations', data: { breadcrumb: 'Orientation', id: 'MOD0009' }, component: Orientation },
    { path: 'newsupdates', data: { breadcrumb: 'NewsUpdates', id: 'MOD0010' }, component: NewsUpdates },
    { path: '**', redirectTo: '/notfound' }
] as Routes;
