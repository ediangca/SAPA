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
import { ProductService } from '../service/product.service';
import { ApiService } from '@/services/api.service';
import { LogsService } from '@/services/logs.service';
import ValidateForm from '@/helper/validator/validateForm';
import Swal from 'sweetalert2';
import { StoreService } from '@/services/store.service';
import { ToastModule } from 'primeng/toast';
import { NgToastService } from 'ng-angular-popup';
import { RouterModule } from '@angular/router';
import { AppMenuitem } from '@/layout/component/app.menuitem';
import { MenuModule } from 'primeng/menu';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { PdfService } from '@/services/pdf.service';

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
    selector: 'ml-school',
    standalone: true,
    imports: [
        CommonModule,
        MenuModule,
        TieredMenuModule,
        TableModule,
        FormsModule,
        ButtonModule,
        AppMenuitem,
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
        PanelMenuModule,
        ReactiveFormsModule,
        FormsModule,
        RouterModule,
    ],
    templateUrl: './ml.school.component.html',
    styleUrl: './css/masterlist.css',
    providers: [MessageService, ProductService, ConfirmationService]
})
export class School implements OnInit {


    subcomponent: MenuItem[] = [];
    properties: MenuItem[] = [];

    itemDialog: boolean = false;

    schools = signal<any[]>([]);
    school!: any;
    selectSchools!: any[] | [];

    form!: FormGroup;

    submitted: boolean = false;

    @ViewChild('dt') dt!: Table;

    exportColumns!: ExportColumn[];

    cols!: Column[];
    coordinators: any[] = [];

    tokenPayload: any | null;

    assignDialog: boolean = false;

    coordinatorID: any | null;


    constructor(private fb: FormBuilder,
        private productService: ProductService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private store: StoreService,
        private api: ApiService,
        private logger: LogsService,
        private vf: ValidateForm,
        private toast: NgToastService,
        private pdfService: PdfService

    ) {

        this.form = this.fb.group({
            schoolID: [null],
            schoolName: ['', Validators.required],
            address: ['', Validators.required],
            userID: ['', Validators.required]
        });

    }


    exportCSV() {
        this.dt.exportCSV();
    }
    /*
        getStatus(status: any) {
            switch (status) {
                case 1:
                    return 'Approved'
                case 2:
                    return  'Inactive' 
                case 3:
                    return 'Suspemd'
    
                default:
                    return 'Pending'
            }
        }
    */

    getStatus(status: any, type: string) {
        switch (status) {
            case 1:
                return (type == 'value' ? 'Approved' : 'info')
            case 2:
                return (type == 'value' ? 'Inactive' : 'contrast')
            case 3:
                return (type == 'value' ? 'Suspemd' : 'danger')

            default:
                return (type == 'value' ? 'Pending' : 'warn');
        }
    }


    ngOnInit() {
        this.subcomponent = [
            {
                items: [
                    // { label: 'Sections', icon: 'fas fa-table-columns', routerLink: ['/dashboard/masterlist/sections'] },
                    { label: 'Print All', icon: 'fas fa-print', command: () => this.printAll() },

                ]
            }
        ];

        /*
        this.properties = [
            {
                label: 'Status',
                icon: 'fas fa-layer-group',
                items: [
                    { label: 'Approve', icon: 'fas fa-check-circle', command: () => this.changeStatus(1) },
                    { label: 'Inactive', icon: 'fas fa-ban', command: () => this.changeStatus(2) },
                    { label: 'Suspend', icon: 'fas fa-pause-circle', command: () => this.changeStatus(3) },
                    { label: 'Pending', icon: 'fas fa-clock', command: () => this.changeStatus(0) }
                ]
            },
            {
                separator: true
            },
            {
                label: 'Coordinator',
                icon: 'fas fa-user-edit',
                items: [
                    {
                        label: 'Re-assign Coordinator',
                        icon: 'fas fa-user-pen',
                        command: () => this.reAssignDialog()
                    }
                ]
            }
        ];
        */
        this.properties = [
            {
                label: 'Status',
                icon: 'fas fa-layer-group',
                items: [
                    { label: 'Approve', icon: 'pi pi-fw pi-list', command: () => this.changeStatus(1) },
                    { label: 'Inactive', icon: 'fas fa-ban', command: () => this.changeStatus(2) },
                    { label: 'Suspend', icon: 'fas fa-pause-circle', command: () => this.changeStatus(3) },
                    { label: 'Pending', icon: 'fas fa-clock', command: () => this.changeStatus(0) }
                ]
            },
            {
                label: 'Re-assign Coordinator',
                icon: 'pi pi-user-edit',
                command: () => this.reAssignDialog()
            }
        ];

        this.loadData();
    }

    loadData() {

        this.store.getUserPayload()
            .subscribe(res => {
                this.tokenPayload = res;
                this.logger.printLogs('i', "Token Payload : ", this.tokenPayload)
            });
        this.refreshTable();

        this.cols = [
            { field: 'SchoolID', header: 'ID', customExportHeader: 'School ID' },
            { field: 'schoolName', header: 'Name' },
            { field: 'address', header: 'Address' },
            { field: 'coordinator', header: 'Coordinator' },
            { field: 'date_created', header: 'Date Created' },
        ];

        this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));
    }

    refreshTable() {
        this.api.getSchools().subscribe({
            next: (schools) => this.schools.set(schools),
            error: (err) => this.logger.printLogs('e', 'Failed to fetch schools', err)
        });
    }

    loadCoordinators() {
        this.api.getUsers().subscribe({
            next: (users) => { this.coordinators = users.filter((user: any) => user.roleId === 'UGR0003') || [], this.logger.printLogs('i', 'Users loaded', this.coordinators) },
            error: (err) => this.logger.printLogs('e', 'Failed to fetch users', err)
        });
    }


    onSchoolSelectionChange(selected: any[]) {
        this.logger.printLogs('i', "Select schools : ", selected)
        this.selectSchools = selected; // optional, if you want to keep it synced manually
    }

    clear(table: Table,) {
        table.clear();
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    openNew() {
        this.form.reset({
            schoolName: '',
            userID: this.tokenPayload.nameid
        });
        this.school = {};
        this.submitted = false;
        this.itemDialog = true;
    }

    openNewDialog() {
        this.form.reset();
        this.itemDialog = true;
    }


    edit(school: any) {
        this.school = school;
        this.logger.printLogs('e', 'Edit schools', school)
        this.form.patchValue(school);
        this.itemDialog = true;
    }

    deleteSelected() {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete the selected school?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            rejectLabel: 'Cancel',
            acceptLabel: "Yes! I'm Sure",
            rejectIcon: 'pi pi-times',
            acceptIcon: 'pi pi-check',
            acceptButtonStyleClass: 'p-button-outlined p-button-success',
            rejectButtonStyleClass: 'p-button-danger',

            accept: () => {

                this.selectSchools = [];
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

    reAssignDialog() {
        if (!this.selectSchools || this.selectSchools.length === 0) {
            this.toast.warning("Please select at least one school first!", "No selelected School", 3000);
            this.messageService.add({
                severity: 'warn',
                summary: 'No Selected School',
                detail: 'Please select at least one school first!',
                life: 3000
            });
            return;
        }

        this.assignDialog = true;
        this.coordinatorID = null;
        this.loadCoordinators();
    }


    hideAssignDialog() {
        this.assignDialog = false;
        this.submitted = false;
    }

    private closeDialog() {
        this.form.reset({
            schoolName: '',
            userID: this.tokenPayload.nameid
        });
        this.school = {};
        this.itemDialog = false;
        this.submitted = false;
    }

    changeStatus(status: number) {
        const schoolIDs = this.selectSchools?.map((school: any) => school.schoolID) ?? [];

        if (!schoolIDs.length) {
            this.toast.warning("Please select at least one school first!", "No selelected School", 3000);
            this.messageService.add({
                severity: 'warn',
                summary: 'No Selected School',
                detail: 'Please select at least one school first!',
                life: 3000
            });
            return;
        }

        this.confirmationService.confirm({
            message: `Are you sure you want to change the status of selected schools to  <b>${this.getStatus(status, 'value')}</b>?`,
            header: 'Confirm Status Update',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: "Yes! I'm Sure",
            rejectLabel: 'Cancel',
            acceptButtonStyleClass: 'p-button-outlined p-button-success',
            rejectButtonStyleClass: 'p-button-danger',

            accept: () => {
                this.api.updateSchoolStatus(status, schoolIDs).subscribe({
                    next: (res: any) => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: res.message,
                            life: 3000
                        });

                        this.logger.printLogs('s', 'Status updated successfully', res);
                        this.refreshTable();
                        this.selectSchools = [];
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


    saveAssignCoor() {
        const schoolIDs = this.selectSchools?.map((school: any) => school.schoolID) ?? [];
        const schools = this.selectSchools?.map((school: any) => school.schoolName) ?? [];

        if (this.coordinatorID == null) {
            this.toast.warning("Please select at coordinator first!", "No selelected Coordinator", 3000);
            return
        }
        // Find the selected coordinator object
        const coordinator = this.coordinators?.find(
            (c: any) => c.userID === this.coordinatorID
        );

        const coordinatorName = coordinator?.fullname || coordinator?.name || 'Unknown';

        this.logger.printLogs('s', `Assign selected schoolIDs [${schoolIDs}] to coordinator : `, coordinatorName);

        this.confirmationService.confirm({
            message: `Are you sure you want to assign the selected school(s):<br><br>${schools.join('<br>')}<br><br>to <b>${coordinatorName}</b>?`,
            header: 'Assign Confirm',
            icon: 'pi pi-exclamation-triangle',
            rejectLabel: 'Cancel',
            acceptLabel: "Yes! I'm Sure",
            rejectIcon: 'pi pi-times',
            acceptIcon: 'pi pi-check',
            acceptButtonStyleClass: 'p-button-outlined p-button-success',
            rejectButtonStyleClass: 'p-button-danger',

            accept: () => {
                this.selectSchools = [];

                this.api.assignCoordinator(this.coordinatorID, schoolIDs).subscribe({
                    next: (res) => {
                        this.logger.printLogs('s', 'Coordinator assigned successfully', res);
                        this.refreshTable();
                    },
                    error: (err) => {
                        this.logger.printLogs('e', 'Failed to assign coordinator', err);
                    }
                });
                this.assignDialog = false;
            }
        });
    }





    save() {
        this.submitted = true;

        if (!this.form.valid) {
            // Swal.fire('Warning!', 'Please complete all required fields before proceeding!', 'warning');
            this.toast.warning("Please complete all required fields before proceeding!", "Complete Fields!", 3000);
            this.vf.validateFormFields(this.form);
            return;
        }

        this.itemDialog = false;

        if (this.school?.schoolID) {
            // ✅ UPDATE school
            let id = this.school.schoolID
            this.school = this.form.value;
            this.logger.printLogs('i', 'School details', this.school);
            this.api.updateSchool(id, this.school).subscribe({
                next: (res) => {
                    this.logger.printLogs('i', 'School updated successfully', res);
                    this.refreshTable(); // reload list
                    this.closeDialog();
                },
                error: (err) => {
                    this.showErrorAlert('Updating Failed', err, true);
                },
                complete: () => {
                    this.submitted = false;
                }
            });
        } else {
            this.school = this.form.value;
            // ✅ CREATE school
            this.api.createSchool(this.school).subscribe({
                next: (res) => {
                    this.logger.printLogs('i', 'School created successfully', res);
                    this.refreshTable(); // reload list
                    this.closeDialog();
                },
                error: (err) => {
                    this.showErrorAlert('Saving Failed', err, true);
                },
                complete: () => {
                    this.submitted = false;
                }
            });
        }
    }
    delete(school: any) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete ${school.schoolName}?`,
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            rejectLabel: 'Cancel',
            acceptLabel: "Yes! I'm Sure",
            rejectIcon: 'pi pi-times',
            acceptIcon: 'pi pi-check',
            acceptButtonStyleClass: 'p-button-outlined p-button-success',
            rejectButtonStyleClass: 'p-button-danger',

            accept: () => {
                this.logger.printLogs('i', `Deleting School ${school.schoolName}`, school);

                this.api.deleteSchool(school.schoolID).subscribe({
                    next: (res) => {
                        this.logger.printLogs('i', 'School deleted successfully', res);
                        this.refreshTable();
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'School Deleted',
                            life: 3000
                        });
                    },
                    error: (err) => {
                        this.logger.printLogs('e', 'Failed to delete school', err);
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Failed to delete school',
                            life: 3000
                        });
                    }
                });
            }
        });
    }

    printAll() {
        this.pdfService.generateSchoolsReport(this.schools());
    }



    private showErrorAlert(title: string, message: string, dialogOpen: boolean) {
        this.logger.printLogs('e', 'Failed to create school', message);
        Swal.fire({
            title: 'Saving Failed',
            text: message,
            icon: 'warning',
            showCancelButton: false,
            confirmButtonText: 'OK',
        }).then((result) => {
            if (result.isConfirmed) {
                this.itemDialog = dialogOpen;
            }
        });
    }
}
