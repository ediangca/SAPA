import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { AppFloatingConfigurator } from '../../layout/component/app.floatingconfigurator';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { AuthService } from '@/services/auth.service';
import { ApiService } from '@/services/api.service';
import ValidateForm from '@/helper/validator/validateForm';
import { LogsService } from '@/services/logs.service';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { validatePasswordMatch } from '@/helper/validator/validatePasswordMatch';
import { SelectButtonModule } from 'primeng/selectbutton';
import { MessageService } from 'primeng/api';
import { Toast, ToastModule } from "primeng/toast";
import { NgToastService } from 'ng-angular-popup';
import { StepperModule } from 'primeng/stepper';
import { Tooltip } from "primeng/tooltip";
import { Badge, BadgeModule } from "primeng/badge";

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        ReactiveFormsModule,
        ButtonModule,
        CheckboxModule,
        InputTextModule,
        PasswordModule,
        FormsModule,
        RouterModule,
        RippleModule,
        ToastModule,
        SelectButtonModule,
        AppFloatingConfigurator,
        ProgressSpinnerModule,
        StepperModule,
        Tooltip,
        BadgeModule,
    ],
    templateUrl: './register.component.html',
    styleUrls: ['./css/auth.component.scss'],
    providers: [MessageService]
})

export class Register {

    isStudent: boolean = false;

    @ViewChild('loadingModal') loadingModal!: ElementRef;

    @ViewChild('emailInput') emailInput!: ElementRef;
    @ViewChild('usernameInput') usernameInput!: ElementRef;

    @ViewChild('schoolCodeInput') schoolCodeInput!: ElementRef;

    checked: boolean = false;

    isLoading = false;

    form!: FormGroup;
    errorMessage: string = '';

    currentStep = 1;

    roleOptions = [
        { label: 'Coordinator', value: false, icon: 'pi pi-briefcase' },
        { label: 'Student', value: true, icon: 'pi pi-graduation-cap' }
    ];


    constructor(private fb: FormBuilder, private auth: AuthService,
        private router: Router, private api: ApiService,
        private vf: ValidateForm, private logger: LogsService, private toast: NgToastService) {

        this.form = this.fb.group({
            lastname: ['', Validators.required],
            firstname: ['', Validators.required],
            middlename: ['', Validators.required],
            email: [
                '',
                [
                    Validators.required,
                    Validators.email,
                    Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
                ]
            ],
            username: ['', Validators.required],
            password: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', Validators.required],
            autoUsername: [false],
            isStudent: [false],
            schoolCode: ['']
        }, { validators: validatePasswordMatch('password', 'confirmPassword') });

        this.errorMessage = '';

        if (this.auth.isAuthenticated()) {
            this.router.navigate(['dashboard']);
        }
    }

    onRoleToggle() {
        this.isStudent = this.form.get('isStudent')?.value || false;
        if (this.isStudent) {
            this.form.get('schoolCode')?.setValidators([Validators.required]);
        } else {
            this.form.get('schoolCode')?.clearValidators();
            this.form.get('schoolCode')?.setValue('');
        }

        this.form.get('schoolCode')?.updateValueAndValidity();
    }

    goToStep(step: number) {
        this.currentStep = step;
    }

    formStep1Valid() {
        return (
            this.form.get('firstName')?.valid &&
            this.form.get('lastName')?.valid &&
            (this.form.get('isStudent')?.value === false ||
                this.form.get('schoolCode')?.valid)
        );
    }

    get passwordMismatch(): boolean {
        const form = this.form;
        return form.hasError('passwordMismatch') && form.get('confirmPassword')?.touched === true;
    }

    get isvalidEmailFormat(): boolean {
        const form = this.form;
        return form.hasError('validateEmailFormat') && form.get('email')?.touched === true ||
            this.vf.validateEmailFormat(this.form.value['email']) === false;
    }

    toggleAutoUsername(event: any) {
        const email = this.form.get('email')?.value || null;
        if (!email && event.checked) {
            this.toast.warning('Please enter email first to copy email ID as username.', 'Warning', 5000);
            // Revert checkbox to its original unchecked state
            this.form.get('autoUsername')?.setValue(false, { emitEvent: false });
            return;
        }

        if (event.checked) {
            // Auto-generate username from email
            const username = email.split('@')[0];
            this.form.get('username')?.setValue(username);
            // this.form.get('username')?.disable();
        } else {
            // Allow manual entry again
            this.form.get('username')?.reset();
            // this.form.get('username')?.enable();
        }
    }

    onCheckSchoolCode() {
        const schoolCode = this.form.get('schoolCode')?.value || '';
        if (schoolCode) {
            this.api.checkSchoolCode(schoolCode).subscribe({
                next: (res: any) => {
                    // res return true or false if it is valid School Code
                    if (res === true) {
                        this.toast.success('Valid school code.', 'Success', 3000);
                    } else {
                        this.toast.danger('Invalid school code. Please check and try again.', 'Error', 5000);
                        this.form.get('schoolCode')?.setValue('');
                        this.form.get('schoolCode')?.markAsUntouched();
                        this.form.get('schoolCode')?.markAsPristine();

                        this.schoolCodeInput.nativeElement.focus();
                    }
                },
                error: (err: any) => {
                    this.toast.danger('Invalid school code. Please check and try again.', 'Error', 5000);

                    this.schoolCodeInput.nativeElement.focus();
                }
            });
        }
    }

    step1HasError(): boolean {
        return ((this.form.controls['lastname'].invalid &&
            this.form.hasError('required', 'lastname') &&
            this.form.get('lastname')?.touched ||
            (this.form.controls['lastname'].dirty &&
                this.form.hasError('required', 'lastname'))) ||
            (this.form.controls['firstname'].invalid &&
                this.form.hasError('required', 'firstname') &&
                this.form.get('firstname')?.touched ||
                (this.form.controls['firstname'].dirty &&
                    this.form.hasError('required', 'firstname'))) ||
            (this.form.controls['middlename'].invalid &&
                this.form.hasError('required', 'middlename') &&
                this.form.get('middlename')?.touched ||
                (this.form.controls['middlename'].dirty &&
                    this.form.hasError('required', 'middlename')))
        );
    }

    step2HasError(): boolean {
        return (
            (this.form.controls['email'].invalid &&
                this.form.hasError('required', 'email') &&
                this.form.get('email')?.touched ||
                (this.form.controls['email'].dirty &&
                    this.form.hasError('required', 'email'))) ||
            (this.form.controls['email']?.touched &&
                (this.form.get('email')?.hasError('required') ||
                    this.form.get('email')?.hasError('email'))) ||
            (this.form.controls['username'].invalid &&
                this.form.hasError('required', 'username') &&
                this.form.get('username')?.touched ||
                (this.form.controls['username'].dirty &&
                    this.form.hasError('required', 'username'))) ||
            (this.form.controls['password'].invalid &&
                this.form.hasError('required', 'password') &&
                this.form.get('password')?.touched ||
                (this.form.controls['password'].dirty &&
                    this.form.hasError('required', 'password'))) ||
            (this.form.controls['confirmPassword'].invalid &&
                this.form.hasError('required', 'confirmPassword') &&
                this.form.get('confirmPassword')?.touched ||
                (this.form.controls['confirmPassword'].dirty &&
                    this.form.hasError('required', 'confirmPassword'))) ||
            (this.form.hasError('minlength', 'password') &&
                this.form.get('password')?.touched) ||
            (!!this.passwordMismatch &&
                !!this.form.get('confirmPassword')?.touched)
        );

    }


    onSubmit() {

        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }
        if (this.vf.validateEmailFormat(this.form.value['email']) === false) {
            this.toast.danger('Invalid email format. Please check and try again.', 'Error', 5000);

            this.form.get('email')?.markAsTouched();
            this.emailInput.nativeElement.focus();

            return;
        }

        if (this.form.valid) {
            this.isLoading = true;
            this.logger.printLogs('i', 'Fetching Login Form', this.form.value);


            const roleId = this.isStudent ? 'UGR0004' : 'UGR0003'; // Example: Student / Coordinator

            const userAccount = {
                "lastname": this.form.value['lastname'],
                "firstname": this.form.value['firstname'],
                "middlename": this.form.value['middlename'],
                "email": this.form.value['email'],
                "username": this.form.value['username'],
                "password": this.form.value['password'],
                "roleId": roleId,
                "schoolId": this.isStudent ? this.form.value['schoolCode'] : null
            }

            setTimeout(() => {
                this.auth.register(userAccount)
                    .subscribe({
                        next: (res) => {

                            this.isLoading = false;

                            Swal.fire({
                                title: 'Successfully Register!',
                                text: res.message,
                                icon: 'success',
                                confirmButtonText: 'OK',
                                allowOutsideClick: false
                            }).then((result) => {
                                if (result.isConfirmed) {
                                    this.logger.printLogs('i', 'ACCESS GRANTED', res.message);
                                    this.api.showToast(res.message, 'SUCCESSFULL', 'success');
                                    this.router.navigate(['login']);
                                }
                            });

                        },
                        error: (err: any) => {
                            this.isLoading = false;
                            this.logger.printLogs('e', 'Error response', err);
                            Swal.fire('Access Denied!', err, 'warning');
                            this.form.reset();
                            this.usernameInput.nativeElement.focus();
                        }
                    });

            }, 3000); // Simulate a 2-second delay

        }
        this.vf.validateFormFields(this.form);
    }
}
