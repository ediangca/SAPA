import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToolbarModule } from 'primeng/toolbar';
import { RatingModule } from 'primeng/rating';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
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
import { UsersProperties } from "./set.user.sidebar";
import { TooltipModule } from "primeng/tooltip";
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { CheckboxModule } from "primeng/checkbox";
import { PasswordDirective, PasswordModule } from "primeng/password";
import { MultiSelectModule } from 'primeng/multiselect';
import { Hospital } from '../masterlist/ml.hospital';

interface Column {
    field: string;
    header: string;
    customExportHeader?: string;
}

interface ExportColumn {
    title: string;
    dataKey: string;
}

@Component({
    selector: 'settings-users',
    standalone: true,
    imports: [
        CommonModule,
        TableModule,
        FormsModule,
        ButtonModule,
        RippleModule,
        CheckboxModule,
        ToastModule,
        ToolbarModule,
        RatingModule,
        InputTextModule,
        PasswordModule,
        TextareaModule,
        ToggleSwitchModule,
        SelectModule,
        RadioButtonModule,
        InputNumberModule,
        MultiSelectModule,
        DialogModule,
        TagModule,
        InputIconModule,
        IconFieldModule,
        ConfirmDialogModule,
        PanelMenuModule,
        ReactiveFormsModule,
        UsersProperties,
        TooltipModule,
    ],
    templateUrl: './set.user.component.html',
    providers: [MessageService, ConfirmationService],
    styleUrl: './css/set.css'
})

export class Users implements OnInit {

    itemDialog: boolean = false;
    changePassDialog: boolean = false;

    users = signal<any[]>([]);
    user!: any;
    selectedUsers!: any[] | null;

    form!: FormGroup;

    submitted: boolean = false;

    @ViewChild('dt') dt!: Table;

    exportColumns!: ExportColumn[];

    cols!: Column[];
    filter: string = '';

    model: MenuItem[] = [];
    tokenPayload: any | null;

    roles: any | [];
    allocations: any[] = [];
    hospitals: any[] = [];
    sections: any[] = [];

    emailPattern: string = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$";

    autoUsername: boolean = false;
    newPassword: string = '';

    constructor(private fb: FormBuilder,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private store: StoreService,
        private api: ApiService,
        private logger: LogsService,
        private vf: ValidateForm,
    ) {
        this.form = this.fb.group({
            userID: [null],
            username: ['', Validators.required],
            lastname: ['', Validators.required],
            firstname: ['', Validators.required],
            middlename: ['', Validators.required],
            roleID: ['', Validators.required],
            email: ['', Validators.required],
            hospitalID: [null],
            autoUsername: [false]
        });
    }

    ngOnInit() {
        this.form = this.fb.group({
            userID: [null],
            username: ['', Validators.required],
            lastname: ['', Validators.required],
            firstname: ['', Validators.required],
            middlename: ['', Validators.required],
            roleID: ['', Validators.required],
            email: ['', Validators.required],
            hospitalID: [null],
            autoUsername: [false]
        });
        this.loadData();

        this.model = [
            {
                items: [
                    { label: 'Users', icon: 'fas fa-table-columns' },

                ]
            }
        ];


        this.form.get('roleID')?.valueChanges.subscribe(role => {

            const hospitalControl = this.form.get('hospitalID');

            if (role === 'UGR0005') {
                hospitalControl?.setValidators([Validators.required]);
            } else {
                hospitalControl?.clearValidators();
                hospitalControl?.setValue(null); // clear hospital if not supervisor
            }

            hospitalControl?.updateValueAndValidity();
        });
    }

    loadData() {
        this.store.getUserPayload()
            .subscribe(res => {
                this.tokenPayload = res;
                this.logger.printLogs('i', "Token Payload : ", this.tokenPayload)

                this.loadRoles();
                this.loadUsers();
                this.loadHospitals();
            });

        this.cols = [
            { field: 'UserID', header: 'ID', customExportHeader: 'User ID' },
            { field: 'fullname', header: 'Fullname' },
            { field: 'email', header: 'Email' },
            { field: 'role', header: 'Role' },
            { field: 'status', header: 'Status' },
            { field: 'date_create', header: 'Date Created' },
        ];


    }

    loadRoles() {
        this.api.getRoles().subscribe({
            next: (roles) => this.roles = roles,
            error: (err) => this.logger.printLogs('e', 'Failed to fetch Roles', err)
        });
    }

    loadHospitals() {
        this.api.getHospitals().subscribe({
            next: (hospitals) => {
                this.hospitals = hospitals || [];
                this.logger.printLogs('i', 'Hospitals loaded', this.hospitals)
            },
            error: (err) => this.logger.printLogs('e', 'Failed to fetch hospitals', err)
        });
    }

    onStatusChanged() {
        this.selectedUsers = [];
        this.loadUsers();
    }

    exportCSV() {
        const users = this.users();

        if (!users || users.length === 0) {
            this.logger.printLogs('i', 'No users to export', null)
            return;
        }
        const csv = [
            ['User ID', 'FullName', 'Email', 'User Role', 'Status', 'Date Created'],
            ...users.map(u => [u.userID, u.fullname, u.email, u.rolename, this.getStatus(u.status, 'value'), u.date_created])
        ]
            .map(row => row.map(v => `"${v}"`).join(','))
            .join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', `users_export_${new Date().getTime()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    onGlobalFilter(table: Table) {
        table.filterGlobal(this.filter, 'contains');
    }

    clear(table: Table,) {
        this.filter = ''
        table.clear();
    }

    getStatus(status: any, type: string): any {
        switch (status) {
            case 'P':
                return (type == 'value' ? 'Pending' : 'warn')
            case 'A':
                return (type == 'value' ? 'Approved' : 'info')
            case 'I':
                return (type == 'value' ? 'Inactive' : 'secondary')
            case 'U':
                return (type == 'value' ? 'Unverified' : 'contrast')

            default:
                return (type == 'value' ? 'Suspend' : 'danger');
        }
    }

    dateFormat(date: Date | string | null): string | null {
        if (!date) return null;

        if (typeof date === 'string') {
            date = new Date(date);
        }

        if (date instanceof Date && !isNaN(date.getTime())) {
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            return `${year}-${month}-${day}`;
        } else {
            this.logger.printLogs('w', 'Invalid Date Format', [date]);
            return null;
        }
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

    getAllocationsByHospitalID(hospitalID: any) {
        this.itemDialog = false;
        this.allocations = []; // Clear previous allocations
        this.logger.printLogs('i', 'Selected Hospital ID : ', hospitalID);
        this.api.getAllocationsByHospitalID(hospitalID).subscribe({
            next: (res) => {
                this.allocations = res || [];
                this.allocations = this.allocations.filter(a => a.status == true);
                this.logger.printLogs('i', 'Allocations loaded by Hospital ID', this.allocations)
                this.itemDialog = true;
            },
            error: (err) => this.logger.printLogs('e', 'Failed to fetch allocations by Hospital ID', err),
        });
        this.itemDialog = true;
    }

    openNew() {
        this.form.reset({
            email: '',
            userID: this.tokenPayload.nameid
        });
        this.user = {};
        this.submitted = false;
        this.itemDialog = true;
    }

    openNewDialog() {
        this.form.reset();
        this.itemDialog = true;
    }

    resendVerification(user: any) {
        this.confirmationService.confirm({
            message: `Are you sure you really want to resend email verification to <b>${user.email}</b>?`,
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            rejectLabel: 'Cancel',
            acceptLabel: "Yes! I'm Sure",
            acceptButtonStyleClass: 'p-button-success',
            rejectButtonStyleClass: 'p-button-outlined p-button-secondary',
            accept: () => {
                this.logger.printLogs('i', `Resending Email verification to ${user.email}`, user);

                this.api.resendVerification(user.email).subscribe({
                    next: (res) => {
                        this.logger.printLogs('i', 'Verification sent', res);
                        this.loadUsers();
                        this.showErrorAlert('Vefification Sent', 'Verification Successfully sent!', false, 'success');
                    },
                    error: (err) => {
                        this.logger.printLogs('e', 'Failed to resend verification', err);
                        this.showErrorAlert('Failed to resend verification', err, false, 'error');
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Failed to resend verification',
                            life: 3000
                        });
                    }
                });
            }
        });
    }

    approve(user: any) {
        this.confirmationService.confirm({
            message: `Are you sure you really want to approve <br> Mr./Ms. ${user.fullname}?`,
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            rejectIcon: 'pi pi-times',
            acceptIcon: 'pi pi-check',
            rejectLabel: 'Cancel',
            acceptLabel: "Yes! I'm Sure",
            acceptButtonStyleClass: 'p-button-success',
            rejectButtonStyleClass: 'p-button-outlined p-button-secondary',
            accept: () => {
                this.logger.printLogs('i', `Approving Account of Mr./Ms. ${user.fullname}`, user);

                this.api.approve(user.email).subscribe({
                    next: (res: any) => {
                        this.logger.printLogs('i', 'Approved Account', res);
                        this.loadUsers();
                        this.showErrorAlert('Account Approved', res.message, false, 'success');
                    },
                    error: (err) => {
                        this.logger.printLogs('e', 'Failed to approve account', err);
                        this.showErrorAlert('Failed to approve account', err, false, 'error');
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Failed to approve account',
                            life: 3000
                        });
                    }
                });
            }
        });
    }

    edit(user: any) {
        this.user = user;
        this.logger.printLogs('i', 'Edit users', user)
        this.form.patchValue(user);
        this.itemDialog = true;
    }

    deleteSelected() {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete the selected products?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            rejectLabel: 'Cancel',
            acceptLabel: "Yes! I'm Sure",
            rejectIcon: 'pi pi-times',
            acceptIcon: 'pi pi-check',
            acceptButtonStyleClass: 'p-button-success',
            rejectButtonStyleClass: 'p-button-outlined p-button-secondary',
            accept: () => {
                this.users.set(this.users().filter((val) => !this.selectedUsers?.includes(val)));
                this.selectedUsers = null;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Products Deleted',
                    life: 3000
                });
            }
        });
    }

    changePassword(user: any) {
        this.user = user
        this.changePassDialog = true;
    }


    hideDialog() {
        this.itemDialog = false;
        this.submitted = false;
        this.changePassDialog = false;
    }

    loadUsers() {
        this.api.getUsers().subscribe({
            next: (users) => this.users.set(users),
            error: (err) => this.logger.printLogs('e', 'Failed to fetch users', err)
        });
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
                    this.loadUsers(); // reload list
                    this.showErrorAlert('User Updated', 'User has been Successfully updated!', false, 'success');
                },
                error: (err) => {
                    this.showErrorAlert('Updating Failed', err, false, 'error');
                },
                complete: () => {
                    this.submitted = false;
                }
            });
        } else {
            this.user = this.form.value;
            // ✅ CREATE user
            this.api.createUser(this.user).subscribe({
                next: (res) => {
                    this.logger.printLogs('i', 'User created successfully', res);
                    this.loadUsers(); // reload list
                    this.closeDialog();
                },
                error: (err) => {
                    this.showErrorAlert('Saving Failed', err, false, 'error');
                },
                complete: () => {
                    this.submitted = false;
                }
            });
        }
    }

    delete(user: any) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete <b>${user.email}</b>?`,
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            rejectLabel: 'Cancel',
            acceptLabel: "Yes! I'm Sure",
            rejectIcon: 'pi pi-times',
            acceptIcon: 'pi pi-check',
            acceptButtonStyleClass: 'p-button-success',
            rejectButtonStyleClass: 'p-button-outlined p-button-secondary',
            accept: () => {
                this.logger.printLogs('i', `Deleting User ${user.email}`, user);

                this.api.deleteUser(user.userID).subscribe({
                    next: (res) => {
                        this.logger.printLogs('i', 'User deleted', res);
                        this.loadUsers();
                        this.showErrorAlert('User Deleted', 'User has been Successfully deleted!', false, 'success');
                    },
                    error: (err) => {
                        this.logger.printLogs('e', 'Failed to delete user', err);
                        this.showErrorAlert('Deleting Failed', err, false, 'error');
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Failed to delete user',
                            life: 3000
                        });
                    }
                });
            }
        });
    }

    isPasswordInvalid(): boolean {
        return this.submitted && (!this.newPassword || this.newPassword.trim() === '');
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
