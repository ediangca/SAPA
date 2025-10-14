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

declare var bootstrap: any;

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [RouterLink, ReactiveFormsModule, ButtonModule, CheckboxModule, InputTextModule, PasswordModule, FormsModule,
        RouterModule, RippleModule, AppFloatingConfigurator, ProgressSpinnerModule],
    templateUrl: './login.component.html'

})
export class Login {


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
            username: ['', Validators.required],
            password: ['', Validators.required]
        });
        this.errorMessage = '';

        if (this.auth.isAuthenticated()) {
            this.router.navigate(['dashboard']);
        }
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
