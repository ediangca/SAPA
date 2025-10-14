import { Routes } from '@angular/router';
import { School } from './ml.school';
import { Hospital } from './ml.hospital';
import { Appointment } from './ml.appointment';
import { Student } from './ml.student';
import { Section } from './ml.section';

export default [
    { path: 'schools', data: { breadcrumb: 'School' }, component: School },
    { path: 'hospitals', data: { breadcrumb: 'Hospital' }, component: Hospital },
    { path: 'sections', data: { breadcrumb: 'Section' }, component: Section },
    { path: 'students', data: { breadcrumb: 'Student' }, component: Student },
    { path: 'appointments', data: { breadcrumb: 'Appointment' }, component: Appointment },
    { path: '**', redirectTo: '/notfound' }
] as Routes;
