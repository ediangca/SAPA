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

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [RouterLink, ReactiveFormsModule, ButtonModule, CheckboxModule, InputTextModule, PasswordModule, FormsModule,
        RouterModule, RippleModule, AppFloatingConfigurator, ProgressSpinnerModule],
    templateUrl: './register.component.html'

})
export class Register {


    @ViewChild('loadingModal') loadingModal!: ElementRef;
    @ViewChild('usernameInput') usernameInput!: ElementRef;

    checked: boolean = false;

    isLoading = false;

    form!: FormGroup;
    errorMessage: string = '';


    constructor(private fb: FormBuilder, private auth: AuthService,
        private router: Router, private api: ApiService,
        private vf: ValidateForm, private logger: LogsService) {

        this.form = this.fb.group({
            email: ['', Validators.required],
            username: ['', Validators.required],
            password: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', Validators.required],
        }, { validators: validatePasswordMatch('password', 'confirmPassword') });

        this.errorMessage = '';

        if (this.auth.isAuthenticated()) {
            this.router.navigate(['dashboard']);
        }
    }

    // Validate Match Password and Confirm Password
    get passwordMismatch(): boolean {
        const form = this.form;
        return form.hasError('passwordMismatch') && form.get('confirmPassword')?.touched === true;
    }

    onSubmit() {
        if (this.form.valid) {
            this.isLoading = true;
            this.logger.printLogs('i', 'Fetching Login Form', this.form.value);


            const userAccount = {
                "email": this.form.value['email'],
                "username": this.form.value['username'],
                "password": this.form.value['password'],
                "roleId": "UGR0003"
            }

            setTimeout(() => {

                this.auth.registerCoordinator(userAccount)
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
                                    this.router.navigate(['/auth/login']);
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


        // Swal.fire('Successfully Registered!', 'Please check you email to verify you account.', 'success');
    }
}
