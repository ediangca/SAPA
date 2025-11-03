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
    selector: 'ml-section',
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
        HospitalProperties,
        RouterModule,
    ],
    templateUrl: './ml.section.component.html',
    providers: [MessageService, ProductService, ConfirmationService]
})
export class Section implements OnInit {

    itemDialog: boolean = false;

    sections = signal<any[]>([]);
    section!: any;
    selectSections!: any[] | null;

    form!: FormGroup;

    submitted: boolean = false;

    @ViewChild('dt') dt!: Table;

    exportColumns!: ExportColumn[];

    cols!: Column[];


    model: MenuItem[] = [];
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
            sectionID: [null],
            sectionName: ['', Validators.required],
            userID: ['', Validators.required]
        });

    }

    exportCSV() {
        const sections = this.sections();

        if (!sections || sections.length === 0) {
            this.logger.printLogs('i', 'No sections to export', null)
            return;
        }
        const csv = [
            ['Section ID', 'Section Name'],
            ...sections.map(u => [u.sectionID, u.sectionName])
        ]
            .map(row => row.map(v => `"${v}"`).join(','))
            .join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', `section_export_${new Date().getTime()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    ngOnInit() {
        this.loadData();

        this.model = [
            {
                items: [
                    { label: 'Sections', icon: 'fas fa-table-columns' },

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

        this.cols = [
            { field: 'SectionID', header: 'ID', customExportHeader: 'Section ID' },
            { field: 'sectionName', header: 'Name' },
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
            sectionName: '',
            userID: this.tokenPayload.nameid
        });
        this.section = {};
        this.submitted = false;
        this.itemDialog = true;
    }

    openNewDialog() {
        this.form.reset();
        this.itemDialog = true;
    }

    edit(section: any) {
        this.section = section;
        this.logger.printLogs('e', 'Edit sections', section)
        this.form.patchValue(section);
        this.itemDialog = true;
    }

    deleteSelected() {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete the selected products?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.sections.set(this.sections().filter((val) => !this.selectSections?.includes(val)));
                this.selectSections = null;
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
        this.api.getSections().subscribe({
            next: (sections) => this.sections.set(sections),
            error: (err) => this.logger.printLogs('e', 'Failed to fetch sections', err)
        });
    }

    // "sectionID",
    // "sectionName",
    // "userID",
    // "dateCreated",
    // "dateUpdated"
    save() {
        this.submitted = true;

        if (!this.form.valid) {
            // Swal.fire('Warning!', 'Please complete all required fields before proceeding!', 'warning');
            this.toast.warning("Please complete all required fields before proceeding!", "Complete Fields!", 3000);
            this.vf.validateFormFields(this.form);
            return;
        }

        this.itemDialog = false;

        if (this.section?.sectionID) {
            // ✅ UPDATE section
            let id = this.section.sectionID
            this.section = this.form.value;
            this.logger.printLogs('i', 'Section details', this.section);
            this.api.updateSection(id, this.section).subscribe({
                next: (res) => {
                    this.logger.printLogs('i', 'Section updated successfully', res);
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
            this.section = this.form.value;
            // ✅ CREATE section
            this.api.createSection(this.section).subscribe({
                next: (res) => {
                    this.logger.printLogs('i', 'Section created successfully', res);
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
    delete(section: any) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete ${section.sectionName}?`,
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.logger.printLogs('i', `Deleting Section ${section.sectionName}`, section);

                this.api.deleteSection(section.sectionID).subscribe({
                    next: (res) => {
                        this.logger.printLogs('i', 'Section deleted successfully', res);
                        this.refreshTable();
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Section Deleted',
                            life: 3000
                        });
                    },
                    error: (err) => {
                        this.logger.printLogs('e', 'Failed to delete section', err);
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Failed to delete section',
                            life: 3000
                        });
                    }
                });
            }
        });
    }


    private showErrorAlert(title: string, message: string, dialogOpen: boolean) {
        this.logger.printLogs('e', 'Failed to create section', message);
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
            sectionName: '',
            userID: this.tokenPayload.nameid
        });
        this.section = {}; // reset form
    }


}
