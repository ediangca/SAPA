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
import { Product, ProductService } from '../service/product.service';
import { AppMenuitem } from '@/layout/component/app.menuitem';
import { ApiService } from '@/services/api.service';
import { LogsService } from '@/services/logs.service';
import ValidateForm from '@/helper/validator/validateForm';
import Swal from 'sweetalert2';
import { StoreService } from '@/services/store.service';
import { ToastModule } from 'primeng/toast';
import { HospitalProperties } from "./ml.hospital.sidebar";
import { NgToastService } from 'ng-angular-popup';
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
    selector: 'ml-school',
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
    providers: [MessageService, ProductService, ConfirmationService]
})
export class School implements OnInit {

    itemDialog: boolean = false;

    schools = signal<any[]>([]);
    school!: any;
    selectSchools!: any[] | null;

    form!: FormGroup;

    submitted: boolean = false;

    @ViewChild('dt') dt!: Table;

    exportColumns!: ExportColumn[];

    cols!: Column[];

    tokenPayload: any | null;

    constructor(private fb: FormBuilder,
        private productService: ProductService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private store: StoreService,
        private api: ApiService,
        private logger: LogsService,
        private vf: ValidateForm,
        private toast: NgToastService

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

    ngOnInit() {
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
        ];

        this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));
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
            message: 'Are you sure you want to delete the selected products?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.schools.set(this.schools().filter((val) => !this.selectSchools?.includes(val)));
                this.selectSchools = null;
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
        this.api.getSchools().subscribe({
            next: (schools) => this.schools.set(schools),
            error: (err) => this.logger.printLogs('e', 'Failed to fetch schools', err)
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

    // helper to reset and close
    private closeDialog() {
        this.itemDialog = false;
        this.form.reset({
            schoolName: '',
            userID: this.tokenPayload.nameid
        });
        this.school = {}; // reset form
    }


}
