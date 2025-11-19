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
import { ChipModule } from 'primeng/chip';
import { ProductService } from '../service/product.service';
import { ApiService } from '@/services/api.service';
import { LogsService } from '@/services/logs.service';
import ValidateForm from '@/helper/validator/validateForm';
import Swal from 'sweetalert2';
import { StoreService } from '@/services/store.service';
import { ToastModule } from 'primeng/toast';
import { HospitalProperties } from "./ml.hospital.sidebar";
import { NgToastService } from 'ng-angular-popup';
import { MultiSelectModule } from 'primeng/multiselect';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import { Tooltip } from "primeng/tooltip";
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { OverlayBadgeModule } from 'primeng/overlaybadge';


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
    selector: 'ml-hospital',
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
        HospitalProperties,
        ChipModule,
        MultiSelectModule,
        Tooltip,
        OverlayBadgeModule
    ],
    templateUrl: './ml.hospital.component.html',
    providers: [MessageService, ProductService, ConfirmationService]
})
export class Hospital implements OnInit {

    // "hospitalID",
    // "hospitalName",
    // "address",
    // "userID",
    // "dateCreated",
    // "dateUpdated"

    itemDialog: boolean = false;
    assignDialog: boolean = false;


    hospitals = signal<any[]>([]);
    hospital!: any;
    selectHospitals!: any[] | null;

    allSections: any[] = [];
    selectedSections: any[] = [];


    allocations: any[] = [];
    allocation!: any;
    selectAllocated!: any[] | null;

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

    ) {

        this.form = this.fb.group({
            hospitalID: [null],
            hospitalName: ['', Validators.required],
            address: ['', Validators.required],
            userID: ['', Validators.required],
            sections: [[], Validators.required]   // 👈 add this
        });

    }

    // exportCSV() {
    //     this.logger.printLogs('i', 'Exporting CSV', this.hospitals());
    //     this.dt.exportCSV();
    // }
    exportCSV() {

        const hospitals = this.hospitals();

        if (!hospitals || hospitals.length === 0) {
            this.logger.printLogs('i', 'No hospitals to export', null)
            return;
        }

        const exportData = hospitals.map((h: any) => ({
            hospitalID: h.hospitalID,
            hospitalName: h.hospitalName,
            address: h.address,
            sections: h.sections?.map((s: any) => s.sectionName + '(' + s.allocation + ')').join(', ') || 'No sections',
            totalAllocations: h.totalAllocations || 0
        }));

        const csv = [
            ['Hospital ID', 'Name', 'Address', 'Sections', 'Total Allocations'],
            ...exportData.map(d => [d.hospitalID, d.hospitalName, d.address, d.sections, d.totalAllocations || 0])
        ]
            .map(row => row.map(v => `"${v}"`).join(','))
            .join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', `hospitals_export_${new Date().getTime()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);


        // const exportData = this.hospitals().map((h: any) => ({
        //     'Hospital ID': h.hospitalID,
        //     'Hospital Name': h.hospitalName,
        //     'Address': h.address,
        //     'Sections': h.sections?.map((s: any) => s.sectionName).join(', ') || 'No sections'
        // }));

        // import('xlsx').then((xlsx) => {
        //     const worksheet = xlsx.utils.json_to_sheet(exportData);
        //     const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
        //     const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
        //     this.saveAsExcelFile(excelBuffer, 'hospitals');
        // });
    }

    saveAsExcelFile(buffer: any, fileName: string): void {
        import('file-saver').then((FileSaver) => {
            let EXCEL_TYPE =
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
            let EXCEL_EXTENSION = '.xlsx';
            const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
            FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
        });
    }

    ngOnInit() {
        this.loadData();

        this.model = [
            {
                items: [
                    { label: 'Sections', icon: 'fas fa-table-columns', routerLink: ['/dashboard/masterlist/sections'] },

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
        this.loadHospitals();
        this.loadSections();
        this.cols = [
            { field: 'hospitalID', header: 'ID', customExportHeader: 'Hospital ID' },
            { field: 'hospitalName', header: 'Name' },
            { field: 'address', header: 'Address' },
            { field: 'sections', header: 'Sections' },
            { field: 'sectionsDisplay', header: 'Sections' }  // ✅ use flattened string
        ];

        this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));

    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    getSectionsAsString(hospital: any): string {
        return hospital.sections?.map((s: any) => s.sectionName).join(', ') || '';
    }

    clear(table: Table,) {
        table.clear();
    }

    openNew() {
        this.form.reset({
            hospitalName: '',
            address: '',
            userID: this.tokenPayload.nameid
        });
        this.hospital = {};
        this.submitted = false;
        this.itemDialog = true;
    }

    openNewDialog() {
        this.form.reset();
        this.itemDialog = true;
    }

    edit(hospital: any) {
        this.hospital = hospital;
        // Patch base hospital info first
        this.form.patchValue({
            hospitalID: hospital.hospitalID,
            hospitalName: hospital.hospitalName,
            address: hospital.address,
            userID: this.tokenPayload.nameid,
        });
        // Load allocations for this hospital
        this.api.getAllocationsByHospitalID(hospital.hospitalID).subscribe({
            next: (allocations) => {

                this.form.patchValue({
                    sections: allocations.map((a: any) => a.sectionID) || []  // Patch the form with assigned sections
                });
                this.logger.printLogs('i', `Loaded sections for ${hospital.hospitalID}`, allocations.map((a: any) => a.sectionID));
            },
            error: (err) =>
                this.logger.printLogs('e', `Failed to load sections for ${hospital.hospitalID}`, err),
        });

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
                this.hospitals.set(this.hospitals().filter((val) => !this.selectHospitals?.includes(val)));
                this.selectHospitals = null;
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
        this.assignDialog = false;
        this.submitted = false;
    }

    loadHospitals() {
        this.api.getHospitals().subscribe({
            next: (hospitals) => {

                hospitals.forEach(hospital => {
                    this.api.getAllocationsByHospitalID(hospital.hospitalID).subscribe({
                        next: (sections) => {
                            // ✅ Sort sections alphabetically by section name or numerically by ID/order
                            sections.sort((a: any, b: any) => {
                                // Change 'sectionName' or 'order' to whatever field defines the order
                                return a.sectionName.localeCompare(b.sectionName);
                                // or for numeric order: return a.order - b.order;
                            });
                            hospital.sections = sections; // Assign sections properly
                            this.logger.printLogs('i', `Loaded sections for ${hospital.hospitalID}`, sections);
                            // Sum all allocations across sections
                            hospital.totalAllocations = sections.reduce(
                                (sum: number, s: any) => sum + (s.allocation || 0),
                                0
                            );

                        },
                        error: (err) => this.logger.printLogs('e', `Failed to load sections for ${hospital.hospitalID}`, err)
                    });
                });

                this.hospitals.set(hospitals || []);

                this.logger.printLogs('i', 'Hospitals loaded', this.hospitals());
            },
            error: (err) => this.logger.printLogs('e', 'Failed to fetch hospitals', err)
        });
    }


    loadSections() {
        this.api.getSections().subscribe({
            next: (sections) => { this.allSections = sections || []; this.logger.printLogs('i', 'Sections loaded', this.allSections); },
            error: (err) => this.logger.printLogs('e', 'Failed to fetch sections', err)
        });
    }
    chipSeverities = ['primary', 'success', 'info', 'warn', 'danger'];

    getChipClass(section: any): any {
        const lower = section.sectionName.toLowerCase();

        if (section.status === false) return 'secondary';

        if (lower.includes('emergency')) return 'danger';
        if (lower.includes('station') || lower.includes('ward') || lower.includes('opd') || lower.includes('ipd')) return 'primary';
        if (lower.includes('icu') || lower.includes('or')) return 'warn';
        if (lower.includes('pediatrics')) return 'info';
        if (lower.includes('radiology')) return 'warning';

        return 'secondary'; // default  
    }

    // getAllocationsByHospitalID(id: string): any { // get sections by hospitalID
    //     this.api.getAllocationsByHospitalID(id).subscribe({
    //         next: (sections) => { this.allSections = sections; return this.allSections.filter((sec) => sec.hospitalID === id).length; },
    //         error: (err) => { this.allSections = []; this.logger.printLogs('e', 'Failed to fetch allocations', err) }
    //     });
    // }

    onSectionsChange() {
        const selectedSections = this.form.value.sections;
        this.logger.printLogs('i', 'Selected sections:', selectedSections);

        // ✅ If you only want their IDs:
        const sectionIDs = selectedSections.map((s: any) => s.sectionID);
        this.logger.printLogs('i', 'Selected section IDs:', sectionIDs);
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

        this.itemDialog = false;

        this.hospital = this.form.value;
        const selectedSections = this.form.value['sections'] || [];


        if (this.hospital?.hospitalID) {

            let hospitalID = this.hospital.hospitalID

            this.logger.printLogs('i', 'Hospital details', this.hospital);
            this.api.updateHospital(hospitalID, this.hospital).subscribe({
                next: (res) => {
                    this.logger.printLogs('i', 'Hospital updated successfully', this.hospital);
                    this.saveAllocatedSections(hospitalID, selectedSections);
                    this.closeDialog();
                    this.showAlert('Update Successful', 'Hospital has been updated successfully.', false, 'success');
                },
                error: (err) => {
                    this.showAlert('Updating Failed', err, true);
                },
                complete: () => {
                    this.submitted = false;
                }
            });
        } else {
            // ✅ CREATE hospital
            this.api.createHospital(this.hospital).subscribe({
                next: (res: any) => {
                    this.logger.printLogs('i', 'Hospital created successfully', res);
                    const hospitalID = res.hospitalID;

                    this.saveAllocatedSections(hospitalID, selectedSections);
                    this.closeDialog();
                    this.showAlert('Creation Successful', 'Hospital has been created successfully.', false, 'success');
                },
                error: (err) => {
                    this.showAlert('Saving Failed', err, true, 'error');
                },
                complete: () => {
                    this.submitted = false;
                }
            });
        }
    }

    private saveAllocatedSections(hospitalID: string, sections: any[]) {
        if (!sections || sections.length === 0) {
            this.logger.printLogs('w', 'No sections selected, skipping allocation.', sections);
            this.showAlert('No Sections Selected', 'Please select at least one section to allocate.', true, 'warning');
            return;
        }

        const request = {
            hospitalID: hospitalID,
            userID: this.tokenPayload.nameid,
            sectionIDs: sections
        };

        this.api.createAllocationsBulk(request).subscribe({
            next: (res) => {
                this.logger.printLogs('i', 'Allocations saved successfully', res);
                this.loadHospitals();
            },
            error: (err) => {
                this.logger.printLogs('e', 'Failed to save allocations', err);
                this.showAlert('Allocation Failed', err, false, 'error');
            }
        });
    }

    openAllocatedSections(hospital: any) {
        this.hospital = hospital;

        this.api.getAllocationsByHospitalID(hospital.hospitalID).subscribe({
            next: (allocations) => {
                this.allocations = allocations || [];
                this.logger.printLogs('i', `Loaded sections for ${hospital.hospitalID}`, this.selectedSections);
                this.assignDialog = true;
            },
            error: (err) => {
                this.logger.printLogs('e', `Failed to load sections for ${hospital.hospitalID}`, err);
                this.showAlert('Loading Failed', err, false, 'error');
            }
        });

    }

    updateStatus(allocation: any) {
        this.allocation = allocation;
    }




    delete(hospital: any) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete ${hospital.hospitalName}?`,
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            rejectLabel: 'Cancel',
            acceptLabel: "Yes! I'm Sure",
            rejectIcon: 'pi pi-times',
            acceptIcon: 'pi pi-check',
            acceptButtonStyleClass: 'p-button-outlined p-button-success',
            rejectButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.logger.printLogs('i', `Deleting hospital ${hospital.hospitalName}`, hospital);

                this.api.deleteHospital(hospital.hospitalID).subscribe({
                    next: (res) => {
                        this.logger.printLogs('i', 'Hospital deleted successfully', res);
                        this.loadHospitals();
                        this.showAlert('Deletion Successful', `${hospital.hospitalName} has been deleted.`, false, 'success');
                    },
                    error: (err) => {
                        this.logger.printLogs('e', 'Failed to delete hospital', err);
                        this.showAlert('Deletion Failed', err, false, 'error');
                    }
                });
            }
        });
    }


    private showAlert(title: string, message: string, dialogOpen: boolean, severity: 'success' | 'error' | 'warning' | 'info' | 'question' | undefined = 'info') {
        this.logger.printLogs('e', 'Failed to create hospital', message);
        this.messageService.add({
            severity: severity,
            summary: title,
            detail: message,
            life: 3000
        });

        Swal.fire({
            title: title,
            html: message,
            icon: severity,
            showCancelButton: false,
            confirmButtonText: 'OK',
        }).then((result) => {
            if (result.isConfirmed) {
                this.itemDialog = dialogOpen;
            }
        });
    }

    onAllocationInput(section: any) {
        if (section.allocation < 1 || section.allocation == null) {
            section.allocation = 1; // force minimum to 1
        }
    }

    saveAllocated() {


        const invalid = this.allocations.some(s => !s.allocation || s.allocation < 1);

        if (invalid) {
            this.messageService.add({
                severity: 'error',
                summary: 'Validation Error',
                detail: 'Allocation values must be at least 1!',
                life: 3000
            });
            return;
        }

        const allocations = this.allocations.map(s => ({
            sectionID: s.sectionID,
            allocation: s.allocation, // || 1 default to 1 if not set
            status: s.status, // || false default to 1 if not set
            userID: this.tokenPayload.nameid, //  || 'USR0001' default to 1 if not set
        }));

        this.logger.printLogs('i', `Saving allocated sections for hospital ${this.hospital.hospitalID} ==> `, this.allocations);

        this.api.updateAllocationsBulk(this.hospital.hospitalID, allocations).subscribe({
            next: (res) => {
                this.logger.printLogs('i', 'Allocations saved successfully', res);
                this.showAlert('Allocated Successfully', 'Allocations have been updated successfully.', false, 'success');
                this.loadHospitals();
            },
            error: (err) => {
                this.logger.printLogs('e', 'Failed to save allocations', err);
                this.showAlert('Failed to save allocations', err, false, 'error');
            }
        });


        // TODO: Call service to save
        this.assignDialog = false;

    }

    onChangeStatus(selectedAllocation: any) {
        this.logger.printLogs('i', `On Change allocation status from ${!selectedAllocation.status} to `, selectedAllocation.status);
        this.allocations.map((a: any) => {
            if (a.allocationID == selectedAllocation.allocationID) {
                a.status = selectedAllocation.status
            }
        });
    }


    // helper to reset and close
    private closeDialog() {
        this.itemDialog = false;
        this.form.reset({
            hospitalName: '',
            address: '',
            userID: this.tokenPayload.nameid
        });
        this.hospital = {}; // reset form
    }


}
