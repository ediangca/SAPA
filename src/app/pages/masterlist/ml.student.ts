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
import { ToastrService } from 'ngx-toastr';
import { NgToastService, ToastIconDirective } from 'ng-angular-popup';
import { Tooltip, TooltipModule } from "primeng/tooltip";
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { CheckboxModule } from "primeng/checkbox";
import { PdfService } from '@/services/pdf.service';
import { MenuModule } from 'primeng/menu';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { AppMenuitem } from '@/layout/component/app.menuitem';
import { RouterModule } from '@angular/router';

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
    selector: 'ml-student',
    standalone: true,
    imports: [
    CommonModule,
    MenuModule,
    TieredMenuModule,
    TableModule,
    FormsModule,
    TooltipModule,
    ButtonModule,
    CheckboxModule,
    // AppMenuitem,
    PanelMenuModule,
    RippleModule,
    ToastModule,
    ToolbarModule,
    RatingModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    RadioButtonModule,
    InputNumberModule,
    DialogModule,
    TagModule,
    InputIconModule,
    IconFieldModule,
    ConfirmDialogModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
],
    templateUrl: './ml.student.component.html',
    providers: [MessageService, ConfirmationService],
    styleUrl: './css/masterlist.scss'
})
export class Student implements OnInit {

    subcomponent: MenuItem[] = [];
    properties: MenuItem[] = [];

    itemDialog: boolean = false;

    users = signal<any[]>([]);
    user!: any;
    selectUsers!: any[] | null;

    form!: FormGroup;

    submitted: boolean = false;

    @ViewChild('dt') dt!: Table;

    exportColumns!: ExportColumn[];

    cols!: Column[];
    schools: any[] = [];

    // model: MenuItem[] = [];
    filter: string = '';
    tokenPayload: any | null;

    roles: any | [];

    emailPattern: string = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$";


    assignDialog: boolean = false;
    schoolID: any | null;

    constructor(private fb: FormBuilder,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private store: StoreService,
        private api: ApiService,
        private logger: LogsService,
        private vf: ValidateForm,
        private pdfService: PdfService
    ) {

        this.form = this.fb.group({
            userID: [null],
            roleID: [null],
            lastname: ['', Validators.required],
            firstname: ['', Validators.required],
            middlename: ['', Validators.required],
            email: ['', Validators.required],
            username: ['', Validators.required]
        });
    }

    ngOnInit() {
        this.loadData();
        this.buildSubComponent();

    }

    buildSubComponent() {
        this.subcomponent = [
            ...(this.tokenPayload.role === 'UGR0001'
                ? [
                    { label: 'Print All', icon: 'fas fa-print', command: () => this.printAll() },
                ]
                : [
                    { label: 'Print All', icon: 'fas fa-print', command: () => this.printAll() },
                ]),
            {
                id: 's',
                label: 'Status',
                icon: 'fas fa-layer-group',
                disabled: !this.selectUsers || this.selectUsers.length === 0,
                items: [
                    ...(this.tokenPayload.role === 'UGR0001' ?
                        [
                            { label: 'Unverified', icon: 'fas fa-clock', command: () => this.changeStatus('U') },
                            { label: 'Pending', icon: 'fas fa-clock', command: () => this.changeStatus('P') },
                            { label: 'Approve', icon: 'fas fa-check', command: () => this.changeStatus('A') },
                            { label: 'Suspend', icon: 'fas fa-pause-circle', command: () => this.changeStatus('S') },
                            { label: 'Inactive', icon: 'fas fa-ban', command: () => this.changeStatus('I') },
                        ] : [
                            { label: 'Approve', icon: 'fas fa-check', command: () => this.changeStatus('A') },
                            { label: 'Inactive', icon: 'fas fa-ban', command: () => this.changeStatus('I') },
                        ]
                    ),

                ]
            },
        ];
    }

    loadData() {
        this.store.getUserPayload()
            .subscribe(res => {
                this.tokenPayload = res;
                this.logger.printLogs('i', "Token Payload : ", this.tokenPayload)
            });
        this.loadStudents();

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
            ['Student ID', 'FullName', 'Email', 'Status'],
            ...users.map(u => [u.userID, u.fullname, u.email, this.getStatus(u.status, 'value')])
        ]
            .map(row => row.map(v => `"${v}"`).join(','))
            .join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', `students_export_${new Date().getTime()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    onStudentSelectionChange(selected: any[]) {
        this.logger.printLogs('i', "Select users : ", selected)
        this.selectUsers = selected;
        this.buildSubComponent()
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

    openNew() {
        this.form.reset({
            email: '',
            roleID: 'UGR0004',
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
            rejectLabel: 'Cancel',
            acceptLabel: "Yes! I'm Sure",
            rejectIcon: 'pi pi-times',
            acceptIcon: 'pi pi-check',
            acceptButtonStyleClass: 'p-button-outlined p-button-success',
            rejectButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.logger.printLogs('i', `Resending Email verification to ${user.email}`, user);

                this.api.resendVerification(user.email).subscribe({
                    next: (res) => {
                        this.logger.printLogs('i', 'Verification sent', res);
                        this.loadStudents();
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
            message: `Do you really want to approve <br> Mr./Ms. ${user.fullname}?`,
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            rejectLabel: 'Cancel',
            acceptLabel: "Yes! I'm Sure",
            rejectIcon: 'pi pi-times',
            acceptIcon: 'pi pi-check',
            acceptButtonStyleClass: 'p-button-outlined p-button-success',
            rejectButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.logger.printLogs('i', `Approving Account of Mr./Ms. ${user.fullname}`, user);

                this.api.approve(user.email).subscribe({
                    next: (res: any) => {
                        this.logger.printLogs('i', 'Approved Account', res);
                        this.loadStudents();
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
            acceptButtonStyleClass: 'p-button-outlined p-button-success',
            rejectButtonStyleClass: 'p-button-danger',
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

    loadStudents() {
        if (this.tokenPayload.role === 'UGR0001' || this.tokenPayload.role === 'UGR0002') {
            this.api.getUsers().subscribe({
                next: (users) => {
                    this.logger.printLogs('i', 'Students loaded', users)
                    this.users.set(users.filter((user: any) => user.roleID === 'UGR0004'))
                    this.logger.printLogs('i', 'Students loaded for AdminSys | SAP Admin', this.users)
                },
                error: (err) => this.logger.printLogs('e', 'Failed to fetch users', err)
            });
        } else {
            this.api.GetStudentBySchoolCoordinatorID(this.tokenPayload.nameid).subscribe({
                next: (users) => {
                    this.users.set(users.filter((user: any) => user.roleID === 'UGR0004'))
                    this.logger.printLogs('i', 'Students loaded for Others', this.users)
                },
                error: (err) => this.logger.printLogs('e', 'Failed to fetch users', err)
            });
        }
    }


    hideAssignDialog() {
        this.assignDialog = false;
        this.submitted = false;
    }

    changeStatus(status: any) {
        const userIDs = this.selectUsers?.map((user: any) => user.userID) ?? [];

        if (!userIDs.length) {
            this.messageService.add({
                severity: 'warn',
                summary: 'No Selected USer',
                detail: 'Please select at least one Student first!',
                life: 3000
            });
            return;
        }

        this.confirmationService.confirm({
            message: `Are you sure you want to change the status of selected Student to  <b>${this.getStatus(status, 'value')}</b>?`,
            header: 'Confirm Status Update',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: "Yes! I'm Sure",
            rejectLabel: 'Cancel',
            acceptButtonStyleClass: 'p-button-outlined p-button-success',
            rejectButtonStyleClass: 'p-button-danger',

            accept: () => {
                this.api.updateUserStatus(status, userIDs).subscribe({
                    next: (res: any) => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: res.message,
                            life: 3000
                        });

                        this.logger.printLogs('s', 'Status updated successfully', res);
                        this.loadStudents();
                        this.selectUsers = [];
                    },
                    error: (err) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Failed to update school status.',
                            life: 3000
                        });
                        this.logger.printLogs('e', 'Failed to update status', err);
                    }
                });
            }
        });
    }

    save() {
        this.submitted = true;

        if (!this.form.valid) {
            this.messageService.add({
                severity: 'warning',
                summary: 'Incomplete Fields',
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
                summary: 'Invalid Email',
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
                    this.loadStudents(); // reload list
                    this.showErrorAlert('User Updated', 'User has been Successfully updated!', false, 'success');
                },
                error: (err) => {
                    this.showErrorAlert('Updating Failed', err, true, 'error');
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
                    this.loadStudents(); // reload list
                    this.closeDialog();
                },
                error: (err) => {
                    this.showErrorAlert('Saving Failed', err, true, 'error');
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
            acceptButtonStyleClass: 'p-button-outlined p-button-success',
            rejectButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.logger.printLogs('i', `Deleting User ${user.email}`, user);

                this.api.deleteUser(user.userID).subscribe({
                    next: (res) => {
                        this.logger.printLogs('i', 'User deleted', res);
                        this.loadStudents();
                        this.showErrorAlert('User Deleted', 'User has been Successfully deleted!', false, 'success');
                    },
                    error: (err) => {
                        this.logger.printLogs('e', 'Failed to delete user', err);
                        this.showErrorAlert('Deleting Failed', err, true, 'error');
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

    printAll() {
        this.pdfService.generateUserReport(this.users(), 'LIST OF STUDENTS');
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
