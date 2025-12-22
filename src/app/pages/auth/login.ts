import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { AppFloatingConfigurator } from '../../layout/component/app.floatingconfigurator';
import { AuthService } from '@/services/auth.service';
import { ApiService } from '@/services/api.service';
import { LogsService } from '@/services/logs.service';
import ValidateForm from '@/helper/validator/validateForm';
import Swal from 'sweetalert2';
import { ProgressSpinnerModule } from 'primeng/progressspinner'
import { StoreService } from '@/services/store.service';
import { DialogModule } from 'primeng/dialog';

declare var bootstrap: any;

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [RouterLink,
        ReactiveFormsModule,
        ButtonModule,
        CheckboxModule,
        InputTextModule,
        PasswordModule,
        FormsModule,
        RouterModule,
        RippleModule,
        DialogModule,
        AppFloatingConfigurator,
        ProgressSpinnerModule],
    templateUrl: './login.component.html'

})
export class Login {


    @ViewChild('loadingModal') loadingModal!: ElementRef;
    @ViewChild('usernameInput') usernameInput!: ElementRef;

    checked: boolean = false;
    isForgotSubmit: boolean = false;

    isLoading = false;
    emailOrUsername: string = '';
    ForgotPasswordDialog: boolean = false;

    userPayload: any | null = null

    form!: FormGroup;
    errorMessage: string = '';


    constructor(private fb: FormBuilder, private auth: AuthService,
        private router: Router, private api: ApiService,
        private vf: ValidateForm, private logger: LogsService,
        private store: StoreService) {

        this.form = this.fb.group({
            username: ['', Validators.required],
            password: ['', Validators.required]
        });
        this.errorMessage = '';

        if (this.auth.isAuthenticated()) {
            this.router.navigate(['dashboard']);
        }
    }

    ngOnInit() {

        if (this.auth.isAuthenticated()) {
            this.router.navigate(['dashboard']);
        }
    }

    openForgotPassword() {
        this.ForgotPasswordDialog = true;
    }

    onSubmit() {

        if (this.form.valid) {
            this.isLoading = true;
            this.logger.printLogs('i', 'Fetching Login Form', this.form.value);

            setTimeout(() => {

                this.auth.login(this.form.value)
                    .subscribe({
                        next: (res) => {

                            this.isLoading = false;

                            Swal.fire({
                                title: 'Access Granted!',
                                text: res.message,
                                //  <br> Please wait for the verification from Admin.
                                icon: 'success',
                                confirmButtonText: 'OK',
                                allowOutsideClick: false
                            }).then((result) => {
                                if (result.isConfirmed) {
                                    this.auth.storeLocal(res);
                                    this.form.reset();
                                    this.router.navigate(['']);

                                    this.logger.printLogs('i', 'ACCESS GRANTED', res.message);
                                    this.api.showToast(res.message, 'ACCESS GRANTED', 'success');
                                }
                            });

                        },
                        error: (err: any) => {
                            this.isLoading = false;
                            this.logger.printLogs('e', 'Access Denied', err);
                            Swal.fire('Access Denied!', err, 'warning');
                            this.form.reset();
                            this.usernameInput.nativeElement.focus();
                        }
                    });

            }, 3000);

        }
        this.vf.validateFormFields(this.form);
    }

    onSubmitForgotPassword() {
        this.isLoading = true;
        this.isForgotSubmit = true;
        this.logger.printLogs('i', 'Submitting Forgot Password for', this.emailOrUsername);

        setTimeout(() => {
            this.auth.forgotPassword(this.emailOrUsername)
                .subscribe({
                    next: (res: any) => {
                        this.isLoading = false;
                        Swal.fire('Success!', res.message, 'success');
                        this.logger.printLogs('i', 'Forgot Password Success', res.message);
                        this.ForgotPasswordDialog = false;
                        this.isForgotSubmit = false;
                        this.emailOrUsername = '';
                    },
                    error: (err: any) => {
                        this.isLoading = false;
                        this.logger.printLogs('e', 'Forgot Password Error', err);
                        Swal.fire('Error!', err, 'error');
                    }
                });
        }, 2000);

    }

}
