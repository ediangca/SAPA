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
import { ToastrService } from 'ngx-toastr';
import { NgToastService } from 'ng-angular-popup';
import { Tooltip } from "primeng/tooltip";
import { ToggleSwitchModule } from 'primeng/toggleswitch';

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
        ToastModule,
        ToolbarModule,
        RatingModule,
        InputTextModule,
        TextareaModule,
        ToggleSwitchModule,
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
        FormsModule,
        UsersProperties,
        Tooltip
    ],
    templateUrl: './set.user.component.html',
    providers: [MessageService, ConfirmationService],
    styleUrl: './css/set.user.componnent.css'
})
export class Users implements OnInit {

    itemDialog: boolean = false;

    users = signal<any[]>([]);
    user!: any;
    selectUsers!: any[] | null;

    form!: FormGroup;

    submitted: boolean = false;

    @ViewChild('dt') dt!: Table;

    exportColumns!: ExportColumn[];

    cols!: Column[];

    model: MenuItem[] = [];
    tokenPayload: any | null;

    roles: any | [];

    emailPattern: string = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$";

    autoUsername: boolean = false;

    constructor(private fb: FormBuilder,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private store: StoreService,
        private api: ApiService,
        private logger: LogsService,
        private vf: ValidateForm,
        private toast: NgToastService
    ) {

        this.form = this.fb.group({
            userID: [null],
            username: ['', Validators.required],
            lastname: ['', Validators.required],
            firstname: ['', Validators.required],
            middlename: ['', Validators.required],
            roleId: ['', Validators.required],
            email: ['', Validators.required],
            autoUsername: [false]
        });
    }

    ngOnInit() {
        this.loadData();

        this.model = [
            {
                items: [
                    { label: 'Users', icon: 'fas fa-table-columns' },

                ]
            }
        ];


    }

    loadData() {
        this.store.getUserPayload()
            .subscribe(res => {
                this.tokenPayload = res;
                this.logger.printLogs('i', "Token Payload : ", this.tokenPayload)
            });
        this.refreshTable();

        this.api.getRoles().subscribe({
            next: (roles) => this.roles = roles,
            error: (err) => this.logger.printLogs('e', 'Failed to fetch Roles', err)
        });

        this.cols = [
            { field: 'UserID', header: 'ID', customExportHeader: 'User ID' },
            { field: 'fullname', header: 'Fullname' },
            { field: 'email', header: 'Email' },
            { field: 'role', header: 'Role' },
            { field: 'status', header: 'Status' },
        ];
        
    }

    exportCSV() {
        const users = this.users();

        if (!users || users.length === 0) {
            this.logger.printLogs('i', 'No users to export', null)
            return;
        }
        const csv = [
            ['User ID', 'FullName', 'Email', 'User Role', 'Status'],
            ...users.map(u => [u.userID, u.fullname, u.email, u.rolename, this.getStatus(u.status,'value')])
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


    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    getStatus(status: any, type: string) {
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
    toggleAutoUsername() {
        this.logger.printLogs('i', 'Auto Username toggled', this.form.get('autoUsername')?.value);
        if (this.form.get('autoUsername')?.value) {
            const email = this.form.get('email')?.value || '';
            const username = email.split('@')[0];
            this.form.get('username')?.setValue(username, { emitEvent: false });
        } else {
            this.form.get('username')?.setValue('', { emitEvent: false });
        }
    }

    // updateUsername() {
    //     if (this.form.get('autoUsername')?.value) {
    //         const email = this.form.get('email')?.value || '';
    //         const username = email.split('@')[0];
    //         this.form.get('username')?.setValue(username, { emitEvent: false });
    //     }
    // }

    /**
     * Filter if there are spaces in username field
     */
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
            message: `Do you really want to resend email verification to ${user.email}?`,
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.logger.printLogs('i', `Resending Email verification to ${user.email}`, user);

                this.api.resendVerification(user.email).subscribe({
                    next: (res) => {
                        this.logger.printLogs('i', 'Verification sent', res);
                        this.refreshTable();
                        this.showErrorAlert('Vefification Sent', 'Verification Successfully sent!', 'success', false);
                    },
                    error: (err) => {
                        this.logger.printLogs('e', 'Failed to resend verification', err);
                        this.showErrorAlert('Failed to resend verification', err, 'error', false);
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
            message: `Do you really want to approve <br> Mr./Ms. ${user.fullname}?`,
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.logger.printLogs('i', `Approving Account of Mr./Ms. ${user.fullname}`, user);

                this.api.approve(user.email).subscribe({
                    next: (res: any) => {
                        this.logger.printLogs('i', 'Approved Account', res);
                        this.refreshTable();
                        this.showErrorAlert('Account Approved', res.message, 'success', false);
                    },
                    error: (err) => {
                        this.logger.printLogs('e', 'Failed to approve account', err);
                        this.showErrorAlert('Failed to approve account', err, 'error', false);
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
            accept: () => {
                this.users.set(this.users().filter((val) => !this.selectUsers?.includes(val)));
                this.selectUsers = null;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Products Deleted',
                    life: 3000
                });
            }
        });
    }

    hideDialog() {
        this.itemDialog = false;
        this.submitted = false;
    }

    refreshTable() {
        this.api.getUsers().subscribe({
            next: (users) => this.users.set(users),
            error: (err) => this.logger.printLogs('e', 'Failed to fetch users', err)
        });
    }

    // "userID",
    // "email",
    // "userID",
    // "dateCreated",
    // "dateUpdated"
    save() {
        this.submitted = true;

        if (!this.form.valid) {
            // Swal.fire('Warning!', 'Please complete all required fields before proceeding!', 'warning');
            this.toast.warning("Please complete all required fields before proceeding!", "Complete Fields!", 2000);
            this.vf.validateFormFields(this.form);
            return;
        }


        /**
         * Validate valid email format
         */
        if (this.isEmailInvalid()) {
            this.toast.warning("Please enter a valid email address!", "Invalid Email!", 2000);
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
                    this.refreshTable(); // reload list
                    this.showErrorAlert('User Updated', 'User has been Successfully updated!', 'success', false);
                },
                error: (err) => {
                    this.showErrorAlert('Updating Failed', err, 'error', true);
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
                    this.refreshTable(); // reload list
                    this.closeDialog();
                },
                error: (err) => {
                    this.showErrorAlert('Saving Failed', err, 'error', true);
                },
                complete: () => {
                    this.submitted = false;
                }
            });
        }
    }

    delete(user: any) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete ${user.email}?`,
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.logger.printLogs('i', `Deleting User ${user.email}`, user);

                this.api.deleteUser(user.userID).subscribe({
                    next: (res) => {
                        this.logger.printLogs('i', 'User deleted', res);
                        this.refreshTable();
                        this.showErrorAlert('User Deleted', 'User has been Successfully deleted!', 'success', false);
                    },
                    error: (err) => {
                        this.logger.printLogs('e', 'Failed to delete user', err);
                        this.showErrorAlert('Deleting Failed', err, 'error', true);
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


    private showErrorAlert(title: string, message: any, type: 'success' | 'error' | 'warning' | 'info' | 'question', dialogOpen: boolean) {

        this.logger.printLogs(type, title, message);

        Swal.fire({
            title: title,
            text: message,
            icon: type,
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
