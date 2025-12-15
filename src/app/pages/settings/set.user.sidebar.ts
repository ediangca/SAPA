import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProductService } from '../service/product.service';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { PdfService } from '@/services/pdf.service';
import { PanelMenuModule } from 'primeng/panelmenu';
import { LogsService } from '@/services/logs.service';
import { NgToastService } from 'ng-angular-popup';
import { StoreService } from '@/services/store.service';
import { ApiService } from '@/services/api.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';


@Component({
    selector: 'set-users-sidebar',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        DialogModule,
        // AppMenuitem,
        PanelMenuModule,
        ReactiveFormsModule,
        FormsModule,
        ConfirmDialogModule,
    ],
    templateUrl: './set.user.sidebar.component.html',
    providers: [MessageService, ProductService, ConfirmationService]
})
export class UsersProperties implements OnInit, OnChanges {

    subcomponent: MenuItem[] = [];
    properties: MenuItem[] = [];
    submitted: boolean = false;
    assignDialog: boolean = false;

    @Input() users: any[] = [];
    @Input() roles: any[] = [];

    @Input() selectedUsers!: any[] | null;
    tokenPayload: any | null;

    @Output() statusChanged = new EventEmitter<void>();

    constructor(private pdfService: PdfService, private logger: LogsService,
        private toast: NgToastService, private messageService: MessageService,
        private store: StoreService, private api: ApiService,
        private confirmationService: ConfirmationService,
    ) {

    }

    ngOnInit(): void {

        this.store.getUserPayload()
            .subscribe(res => {
                this.tokenPayload = res;
                this.logger.printLogs('i', "Token Payload : ", this.tokenPayload)
                this.initSubcomponent();
            });
    }
    ngOnChanges(changes: SimpleChanges): void {
        if ((changes['users'] || changes['selectedUsers'])
            && this.tokenPayload) {
            this.initSubcomponent();
        }
    }

    initSubcomponent() {
        const hasUsers = Array.isArray(this.users) && this.users.length > 0;
        const isAdmin = this.tokenPayload?.role === 'UGR0001';
        const hasSelection = Array.isArray(this.selectedUsers) && this.selectedUsers.length > 0;

        this.subcomponent = [
            ...(isAdmin
                ? [
                    { label: 'Roles', icon: 'fas fa-table-columns', routerLink: ['/dashboard/settings/roles'] },
                    { label: 'Print All', icon: 'fas fa-print', command: () => this.printAll() },

                    ...(hasSelection ? [this.getStatusMenu()] : [])
                ]
                : [
                    { label: 'Print All', icon: 'fas fa-print', command: () => this.printAll() }
                ])
        ];
    }
    private getStatusMenu() {
        return {
            id: 's',
            label: 'Status',
            icon: 'fas fa-layer-group',
            items: [
                { label: 'Unverified', icon: 'fas fa-clock', command: () => this.changeStatus('U') },
                { label: 'Pending', icon: 'fas fa-clock', command: () => this.changeStatus('P') },
                { label: 'Approve', icon: 'fas fa-check', command: () => this.changeStatus('A') },
                { label: 'Suspend', icon: 'fas fa-pause-circle', command: () => this.changeStatus('S') },
                { label: 'Inactive', icon: 'fas fa-ban', command: () => this.changeStatus('I') },
            ]
        };
    }

    hideDialog() {
        this.assignDialog = false;
        this.submitted = false;
    }
    openAssignDialog() {
        this.assignDialog = true;
    }

    save() {
        this.submitted = true;
        this.assignDialog = false;
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

    changeStatus(status: any) {
        this.logger.printLogs('i', 'Status change to ', status);

        const userIDs = this.selectedUsers?.map((user: any) => user.userID) ?? [];

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

                        // 🔔 Notify parent to reset selection / reload
                        this.statusChanged.emit();

                        this.logger.printLogs('s', 'Status updated successfully', res);
                        // this.loadStudents();
                        this.selectedUsers = [];
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

    printAll() {
        if (this.users && this.users.length > 0) {
            this.logger.printLogs('e', 'Generate Report for Users', this.users)
            this.pdfService.generateUserReport(this.users, 'LIST OF USER');
            return;
        }
        if (this.roles && this.roles.length > 0) {
            this.logger.printLogs('e', 'Generate Report for Roles', this.roles)
            this.pdfService.generateRoleReport(this.roles, 'LIST OF ROLE');
            return;
        }
        this.toast.warning("No Record found to print.", 'No Record', 3000);
    }

}