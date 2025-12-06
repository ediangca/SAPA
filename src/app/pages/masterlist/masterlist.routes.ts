import { Routes } from '@angular/router';
import { School } from './ml.school';
import { Hospital } from './ml.hospital';
import { Appointment } from './ml.appointment';
import { Student } from './ml.student';
import { Section } from './ml.section';

export default [
    { path: 'schools', data: { breadcrumb: 'School', id: 'MOD0005' }, component: School },
    { path: 'hospitals', data: { breadcrumb: 'Hospital', id: 'MOD0002' }, component: Hospital },
    { path: 'sections', data: { breadcrumb: 'Section', id: 'MOD0003' }, component: Section },
    { path: 'students', data: { breadcrumb: 'Student', id: 'MOD0006' }, component: Student },
    { path: 'appointments', data: { breadcrumb: 'Appointment', id: 'MOD0007' }, component: Appointment },
    { path: '**', redirectTo: '/notfound' }
] as Routes;
