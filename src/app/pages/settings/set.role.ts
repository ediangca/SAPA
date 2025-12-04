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
import { Tooltip } from "primeng/tooltip";
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { CheckboxChangeEvent, CheckboxModule } from "primeng/checkbox";
import { SkeletonModule } from 'primeng/skeleton';

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
    selector: 'settings-role',
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
        Tooltip,
        SkeletonModule
    ],
    templateUrl: './set.role.component.html',
    providers: [MessageService, ConfirmationService],
    styleUrl: './css/set.css'
})


export class Roles implements OnInit {

    itemDialog: boolean = false;
    privelegeDialog: boolean = false;
    isLoading: boolean = false;

    roles = signal<any[]>([]);
    role!: any;
    selectRoles!: any[] | null;

    form!: FormGroup;


    privilege: any | null = null;
    modules: any[] = [];
    privileges: any[] = [];
    selectedPrivileges: any[] = []; // Array to track selected module

    submitted: boolean = false;
    isAllChecked: boolean = false;


    @ViewChild('dt') dt!: Table;

    exportColumns!: ExportColumn[];

    cols!: Column[];
    filter: string = '';

    tokenPayload: any | null;

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
        this.initForm();
    }

    ngOnInit() {
        this.initColumn();
        this.loadData();
    }

    initForm() {
        this.form = this.fb.group({
            roleID: [null],
            roleName: ['', Validators.required],
        });
    }

    initColumn() {
        this.cols = [
            { field: 'roleID', header: 'ID', customExportHeader: 'Role ID' },
            { field: 'roleName', header: 'Role Name' },
            { field: 'date_created', header: 'Date Created' },
        ];
    }

    loadData() {
        this.store.getUserPayload()
            .subscribe(res => {
                this.tokenPayload = res;
                this.logger.printLogs('i', "Token Payload : ", this.tokenPayload)
            });
        this.loadRoles();
    }

    loadRoles() {
        this.api.getRoles().subscribe({
            next: (roles) => this.roles.set(roles),
            error: (err) => this.logger.printLogs('e', 'Failed to fetch roles', err)
        });
    }


    exportCSV() {
        const users = this.roles();

        if (!users || users.length === 0) {
            this.logger.printLogs('i', 'No roles to export', null)
            return;
        }
        const csv = [
            ['Role ID', 'Role Name', 'Date Created'],
            ...users.map(r => [r.roleID, r.roleName, r.date_created])
        ]
            .map(row => row.map(v => `"${v}"`).join(','))
            .join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', `roles_export_${new Date().getTime()}.csv`);
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

    openNew() {
        this.form.reset({
            email: '',
            userID: this.tokenPayload.nameid
        });
        this.role = {};
        this.submitted = false;
        this.itemDialog = true;
    }

    openNewDialog() {
        this.form.reset();
        this.itemDialog = true;
    }

    edit(role: any) {
        this.role = role;
        this.logger.printLogs('i', 'Edit role', role)
        this.form.patchValue(role);
        this.itemDialog = true;
    }

    openPrivilege(role: any) {
        this.role = role;
        this.logger.printLogs('i', 'Edit role', role)

    }

    hideDialog() {
        this.itemDialog = false;
        this.submitted = false;
        this.privelegeDialog = false;
    }

    toggleAllModule(e: CheckboxChangeEvent) {
        this.privileges.forEach(p => {
            p.isActive = e.checked;

            if (!p.isActive) {
                p.c = p.r = p.u = p.d = p.post = p.unpost = false;
            }
        });
    }

    toggleSelectionModule(privilege: any, event: CheckboxChangeEvent) {
        const isChecked = event.checked;

        this.privileges.forEach(item => {
            if (item.moduleName == privilege.moduleName) {
                item.isActive = isChecked;

                if (!(item.moduleName == 'GLOBAL' || item.moduleName == 'REPORTS')) {
                    item.c = isChecked;
                    item.r = isChecked;
                    item.u = isChecked;
                    item.d = isChecked;
                }

                if (['PAR', 'ICS', 'OPR', 'PTR', 'ITR', 'OPTR', 'PRS', 'RRSEP', 'OPRR', 'USER ACCOUNTS'].includes(item.moduleName)) {
                    item.post = isChecked;
                    item.unpost = isChecked;
                }
            }
        });

        const importantModules = ['ITEM CATEGORY', 'COMPANY', 'POSITION', 'USER GROUPS', 'REPORTS'];
        const isAnyActive = this.privileges
            .filter(item => importantModules.includes(item.moduleName))
            .some(item => item.isActive);

        this.privileges.forEach(item => {
            if (item.moduleName === 'GLOBAL') {
                item.isActive = isAnyActive;
            }
        });

        this.selectedPrivileges = this.privileges;
        this.displaySelectedItems();
    }


    displaySelectedItems() {
        this.logger.printLogs('i', 'List of selected Module', this.selectedPrivileges!);
    }

    toggleSelection(action: string, privilege: any, event: CheckboxChangeEvent) {
        const isChecked = event.checked;

        this.privileges.forEach(item => {
            if (item.moduleName === privilege.moduleName) {
                switch (action) {
                    case 'add': item.c = isChecked; break;
                    case 'retrieve': item.r = isChecked; break;
                    case 'update': item.u = isChecked; break;
                    case 'delete': item.d = isChecked; break;
                    case 'post': item.post = isChecked; break;
                    case 'unpost': item.unpost = isChecked; break;
                }
            }
        });

        this.selectedPrivileges = this.privileges;
        this.displaySelectedItems();
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


        this.itemDialog = false;

        if (this.role?.roleID) {
            let id = this.role.userID
            this.role = this.form.value;
            this.logger.printLogs('i', 'role details', this.role);
            this.api.updateUser(id, this.role).subscribe({
                next: (res) => {
                    this.logger.printLogs('i', 'User updated successfully', res);
                    this.loadRoles();
                    this.showErrorAlert('Role Updated', 'Role has been Successfully updated!', false, 'success');
                },
                error: (err) => {
                    this.showErrorAlert('Updating Failed', err, true, 'error');
                },
                complete: () => {
                    this.submitted = false;
                }
            });
        } else {
            this.role = this.form.value;
            this.api.createRole(this.role).subscribe({
                next: (res) => {
                    this.logger.printLogs('i', 'Role created successfully', res);
                    this.loadRoles();
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

    delete(role: any) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete <b>${role.roleName}</b>?`,
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            rejectLabel: 'Cancel',
            acceptLabel: "Yes! I'm Sure",
            rejectIcon: 'pi pi-times',
            acceptIcon: 'pi pi-check',
            acceptButtonStyleClass: 'p-button-success',
            rejectButtonStyleClass: 'p-button-outlined p-button-secondary',
            accept: () => {
                this.logger.printLogs('i', `Deleting Role ${role.roleID}`, role);

                this.api.deleteRole(role.roleID).subscribe({
                    next: (res) => {
                        this.logger.printLogs('i', 'Role deleted', res);
                        this.loadRoles();
                        this.showErrorAlert('Role Deleted', 'Role has been Successfully deleted!', false, 'success');
                    },
                    error: (err) => {
                        this.logger.printLogs('e', 'Failed to delete role', err);
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

    isPasswordInvalid(): boolean {
        return this.submitted && (!this.newPassword || this.newPassword.trim() === '');
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

    closeDialog() {
        this.itemDialog = false;
        this.form.reset({
            roleName: '',
        });
        this.role = {}; // reset form
    }


    onSubmitPrivilege() {

    }

}
