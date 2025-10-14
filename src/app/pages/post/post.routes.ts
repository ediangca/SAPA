import { Routes } from '@angular/router';
import { Orientation } from './post.orientation';
import { Schedule } from './post.schedule';
import { NewsUpdates } from './ml.newsupdates';

export default [
    { path: 'orientations', data: { breadcrumb: 'Orientation' }, component: Orientation },
    { path: 'schedules', data: { breadcrumb: 'Schedule' }, component: Schedule },
    { path: 'newsupdates', data: { breadcrumb: 'NewsUpdates' }, component: NewsUpdates },
    { path: '**', redirectTo: '/notfound' }
] as Routes;
