import { Routes } from '@angular/router';
import { School } from './ml.school';
import { Hospital } from './ml.hospital';
import { Appointment } from './ml.appointment';
import { Student } from './ml.student';
import { Section } from './ml.section';
import { ConfirmAppointmentSuccess } from './confirm-success';
import { ClinicalInstructor } from './ml.clinical-instructor';

export default [
    { path: 'schools', data: { breadcrumb: 'School', id: 'MOD0005' }, component: School },
    { path: 'hospitals', data: { breadcrumb: 'Hospital', id: 'MOD0002' }, component: Hospital },
    { path: 'sections', data: { breadcrumb: 'Section', id: 'MOD0003' }, component: Section },
    { path: 'students', data: { breadcrumb: 'Student', id: 'MOD0006' }, component: Student },
    { path: 'clinical-instructors', data: { breadcrumb: 'Clinical Instructors', id: 'MOD0017' }, component: ClinicalInstructor },
    { path: 'appointments', data: { breadcrumb: 'Appointment', id: 'MOD0007' }, component: Appointment },
    { path: '**', redirectTo: '/notfound' }
] as Routes;
