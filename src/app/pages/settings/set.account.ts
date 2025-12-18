import { Component, OnInit} from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { PanelMenuModule } from 'primeng/panelmenu';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ApiService } from '@/services/api.service';
import { LogsService } from '@/services/logs.service';
import ValidateForm from '@/helper/validator/validateForm';
import Swal from 'sweetalert2';
import { StoreService } from '@/services/store.service';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from "primeng/tooltip";



@Component({
    selector: 'settings-account',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        ToastModule,
        SelectModule,
        RadioButtonModule,
        InputNumberModule,
        DialogModule,
        TagModule,
        InputIconModule,
        IconFieldModule,
        ConfirmDialogModule,
        PanelMenuModule,
        ReactiveFormsModule,
        TooltipModule
    ],
    templateUrl: './set.account.component.html',
    providers: [MessageService, ConfirmationService],
    styleUrl: './css/set.css'
})

export class Account implements OnInit {

    user!: any;
    tokenPayload: any | null;
    itemDialog: boolean = false;
    changePassDialog: boolean = false;
    form!: FormGroup;

    emailPattern: string = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$";
    submitted = false;

    newPassword: string = '';

    constructor(private fb: FormBuilder,
            private messageService: MessageService,
            private confirmationService: ConfirmationService,
            private store: StoreService,
            private api: ApiService,
            private logger: LogsService,
            private vf: ValidateForm
        ) {
        this.form = this.fb.group({
            userID: [null],
            username: ['', Validators.required],
            lastname: ['', Validators.required],
            firstname: ['', Validators.required],
            middlename: ['', Validators.required],
            email: ['', Validators.required],
            autoUsername: [false]
        });
    }

    ngOnInit() {
        this.store.getUserPayload()
            .subscribe(res => {
                this.tokenPayload = res;
                this.logger.printLogs('i', "Token Payload : ", this.tokenPayload)

                this.loadUserAccount();

            });
    }

    loadUserAccount() {
        this.api.getUserAccount(this.tokenPayload.nameid).subscribe({
            next: (account) => {
                this.user = account[0];
                this.logger.printLogs('i', 'View User Account: ', this.user);
            },
            error: (err) => this.logger.printLogs('e', 'Failed to fetch user', err)
        });
    }

    get statusLabel(): string {
        switch (this.user?.Status) {
            case 'A': return 'Active';
            case 'I': return 'Inactive';
            default: return 'Pending';
        }
    }

    get statusClass(): string {
        switch (this.user?.Status) {
            case 'A': return 'bg-green-100 text-green-700';
            case 'I': return 'bg-red-100 text-red-700';
            default: return 'bg-yellow-100 text-yellow-700';
        }
    }

    get isEmailVerified(): boolean {
        return !!this.user?.Email_Verified_At;
    }

    filterSpace() {
        const usernameControl = this.form.get('username');
        if (usernameControl) {
            const currentValue = usernameControl.value as string;
            const filteredValue = currentValue.replace(/\s+/g, ''); // Remove all spaces
            if (currentValue !== filteredValue) {
                usernameControl.setValue(filteredValue, { emitEvent: false });
            }
        }
    }

    isEmailInvalid(): boolean {
        const emailControl = this.form.get('email');
        if (emailControl) {
            const email = emailControl.value;
            const emailRegex = new RegExp(this.emailPattern);
            return !emailRegex.test(email);
        }
        return false;
    }

    isPasswordInvalid(): boolean {
        return this.submitted && (!this.newPassword || this.newPassword.trim() === '');
    }

    toggleAutoUsername(event: any) {
        const email = this.form.get('email')?.value || null;

        // If email is missing and user tried to check the box
        if (!email && event.checked) {
            this.messageService.add({
                severity: 'warning',
                summary: 'Warning',
                detail: 'Please enter email first!',
                life: 3000
            });

            // Revert checkbox to its original unchecked state
            this.form.get('autoUsername')?.setValue(false, { emitEvent: false });
            return;
        }

        if (event.checked) {
            const username = email.split('@')[0];
            this.form.get('username')?.patchValue(username);
            // this.form.get('username')?.disable();
        } else {
            this.form.get('username')?.reset();
            // this.form.get('username')?.enable();
        }
    }


    onEditAccount() {
        this.logger.printLogs('i', 'Edit users', this.user)
        this.form.patchValue(this.user);
        this.itemDialog = true;
    }

    onChangePassword(): void {
        console.log('Change Password clicked');
        // open password dialog
    }

    hideDialog() {
        this.itemDialog = false;
        this.submitted = false;
        this.changePassDialog = false;
    }

    save() {
        this.submitted = true;

        if (!this.form.valid) {
            this.messageService.add({
                severity: 'warning',
                summary: 'Warning',
                detail: 'Please complete all required fields before proceeding!',
                life: 3000
            });
            this.vf.validateFormFields(this.form);
            return;
        }


        /**
         * Validate valid email format
         */
        if (this.isEmailInvalid()) {
            this.messageService.add({
                severity: 'warning',
                summary: 'Warning',
                detail: 'Please enter a valid email address!',
                life: 3000
            });
            return;
        }

        this.itemDialog = false;

        if (this.user?.userID) {
            // ✅ UPDATE user
            let id = this.user.userID
            this.user = this.form.value;
            this.logger.printLogs('i', 'user details', this.user);
            this.api.updateUser(id, this.user).subscribe({
                next: (res) => {
                    this.logger.printLogs('i', 'User updated successfully', res);
                    this.loadUserAccount(); // reload list
                    this.showErrorAlert('User Updated', 'User has been Successfully updated!', false, 'success');
                },
                error: (err) => {
                    this.showErrorAlert('Updating Failed', err, false, 'error');
                },
                complete: () => {
                    this.submitted = false;
                }
            });
        }
    }

    changePassword() {
        this.changePassDialog = true;
    }

    updatePassword() {
        this.submitted = true;
        if (!this.newPassword) {
            this.messageService.add({
                severity: 'warning',
                summary: 'Warning',
                detail: 'Password is required!',
                life: 3000
            });
            return;
        }

        this.confirmationService.confirm({
            message: `Are you sure you want to change password for <b>${this.user.email}</b>?`,
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            rejectLabel: 'Cancel',
            acceptLabel: "Yes! I'm Sure",
            rejectIcon: 'pi pi-times',
            acceptIcon: 'pi pi-check',
            acceptButtonStyleClass: 'p-button-success',
            rejectButtonStyleClass: 'p-button-outlined p-button-secondary',
            accept: () => {
                this.logger.printLogs('i', `Changing password for ${this.user.email}`, this.newPassword);

                this.changePassDialog = false;

                this.api.changePassword(this.user.userID, this.newPassword).subscribe({
                    next: () => {
                        this.showErrorAlert('Password changed', 'Password updated & email sent to user!', false, 'success');
                        this.newPassword = '';
                    },
                    error: (err) => {
                        this.changePassDialog = false;
                        this.logger.printLogs('e', 'Failed to change password', err);
                        this.showErrorAlert('Change Password Failed', err, true, 'error');
                    },
                    complete: () => {
                        this.submitted = false;
                    }
                });
            }
        });

    }

    private showErrorAlert(title: string, message: any, dialogOpen: boolean, severity: 'success' | 'error' | 'warning' | 'info' | 'question' | undefined = 'info') {

        this.logger.printLogs(severity, title, message);

        this.messageService.add({
            severity: severity,
            summary: title,
            detail: message,
            life: 3000
        });

        Swal.fire({
            title: title,
            text: message,
            icon: severity,
            showCancelButton: false,
            confirmButtonText: 'OK',
        }).then((result) => {
            if (result.isConfirmed) {
                this.itemDialog = dialogOpen;
            }
        });
    }

    // helper to reset and close
    private closeDialog() {
        this.itemDialog = false;
        this.form.reset({
            email: '',
        });
        this.user = {}; // reset form
    }
}
