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
    qrDialog: boolean = false;
    coordinatorID: any | null;


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
            schoolID: [null],
            schoolName: ['', Validators.required],
            address: ['', Validators.required],
            userID: ['', Validators.required]
        });

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


    exportCSV() {
        this.dt.exportCSV();
    }

    refreshTable() {
        this.api.getSchools().subscribe({
            next: (schools) => this.schools.set(schools),
            error: (err) => this.logger.printLogs('e', 'Failed to fetch schools', err)
        });
    }

    loadCoordinators() {
        this.api.getUsers().subscribe({
            next: (users) => {
                this.coordinators = users.filter((user: any) => user.roleId === 'UGR0003' && user.status === 'A') || []; //Role ID - Coordinators
                this.logger.printLogs('i', 'Users loaded', this.coordinators)
            },
            error: (err) => this.logger.printLogs('e', 'Failed to fetch users', err)
        });
    }

    getStatus(status: any, type: string): any {
        switch (status) {
            case 1:
                return (type == 'value' ? 'Approved' : 'info')
            case 2:
                return (type == 'value' ? 'Inactive' : 'contrast')
            case 3:
                return (type == 'value' ? 'Suspend' : 'danger')

            default:
                return (type == 'value' ? 'Pending' : 'warn');
        }
    }

    copyCode(code: string) {
        navigator.clipboard.writeText(code).then(() => {
            this.logger.printLogs('i', 'Copy School code: ', code)
            this.messageService.add({
                severity: 'secondary',
                summary: 'Copied',
                detail: 'School code copied to clipboard'
            });

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

    reAssignDialog() {
        if (!this.selectSchools || this.selectSchools.length === 0) {
            this.messageService.add({
                severity: 'warn',
                summary: 'No Selected School',
                detail: 'Please select at least one school first!',
                life: 3000
            });
            return;
        }

        this.loadCoordinators();
        this.assignDialog = true;
        this.coordinatorID = null;
    }


    hideDialog() {
        this.form.reset({
            schoolName: '',
            userID: this.tokenPayload.nameid
        });
        this.school = {};
        this.itemDialog = false;
        this.assignDialog = false;
        this.qrDialog = false;
        this.submitted = false;
    }

    changeStatus(status: number) {
        const schoolIDs = this.selectSchools?.map((school: any) => school.schoolID) ?? [];
        const schools = this.selectSchools?.map((school: any) => school.schoolName) ?? [];

        if (!schoolIDs.length) {
            this.messageService.add({
                severity: 'warn',
                summary: 'No Selected School',
                detail: 'Please select at least one school first!',
                life: 3000
            });
            return;
        }

        this.confirmationService.confirm({
            message: `Are you sure you want to change the status of selected schools <br><br>${schools.join('<br>')}<br><br>to<b>${this.getStatus(status, 'value')}</b>?`,
            header: 'Confirm Status Update',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: "Yes! I'm Sure",
            rejectLabel: 'Cancel',
            acceptButtonStyleClass: 'p-button-success',
            rejectButtonStyleClass: 'p-button-outlined  p-button-secondary',

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
                        this.showErrorAlert('Successful', 'School status updated', false, 'success', );
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'School status updated',
                            life: 3000
                        });
                        this.selectSchools = [];
                    },
                    error: (err) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: err,
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
            this.messageService.add({
                severity: 'warn',
                summary: 'No Selected Coordinator',
                detail: 'Please select at least one coordinator first!',
                life: 3000
            });
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
            acceptButtonStyleClass: 'p-button-success',
            rejectButtonStyleClass: 'p-button-outlined p-button-secondary',

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

        if (this.school?.schoolID) {
            // ✅ UPDATE school
            let id = this.school.schoolID
            this.school.schoolName = this.form.get('schoolName')?.value;
            this.school.address = this.form.get('address')?.value;

            this.logger.printLogs('i', 'School details', this.school);
            this.api.updateSchool(id, this.school).subscribe({
                next: (res) => {
                    this.logger.printLogs('i', 'School updated successfully', res,);
                    this.refreshTable(); // reload list
                    this.hideDialog();
                    this.showErrorAlert('Successful', 'School updated successfully', false, 'success');
                },
                error: (err) => {
                    this.showErrorAlert('Updating Failed', err, true, 'error');
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
                    this.hideDialog();
                    this.showErrorAlert('Successful', 'School created successfully', false, 'success');
                    // this.showErrorAlert('Created Successfully', "School created successfully", false);
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
                        this.showErrorAlert('Successful', 'School deleted successfully', false, 'success');
                    },
                    error: (err) => {
                        this.logger.printLogs('e', 'Failed to delete school', err);
                        this.showErrorAlert('Deleting Failed', err, false, 'error');
                    }
                });
            }
        });
    }

    printAll() {
        this.pdfService.generateSchoolsReport(this.schools());
    }

    showQR(school: any) {
        this.school = school;
        this.qrDialog = true;
    }

    saveAsImage() {
        if (!this.school?.qrCode) return;

        const qrImage = new Image();
        qrImage.src = 'data:image/png;base64,' + this.school.qrCode;

        qrImage.onload = () => {
            const qrSize = 200;
            const padding = 20;

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d')!;

            const nameFont = "bold 20px Arial";
            const poweredFont = "14px Arial";
            const poweredBlueFont = "italic 14px Arial";

            ctx.font = nameFont;

            // Wrap function
            const wrapText = (text: string, maxWidth: number): string[] => {
                const words = text.split(" ");
                const lines: string[] = [];
                let line = "";

                words.forEach(word => {
                    const testLine = line + word + " ";
                    if (ctx.measureText(testLine).width > maxWidth) {
                        lines.push(line.trim());
                        line = word + " ";
                    } else {
                        line = testLine;
                    }
                });

                lines.push(line.trim());
                return lines;
            };

            const maxWidth = qrSize + padding * 2;
            const nameLines = wrapText(this.school.schoolName, maxWidth - 20);
            const lineHeight = 26;

            const nameSectionHeight = nameLines.length * lineHeight;

            // ⬇ Add extra bottom margin here (+40px)
            const poweredHeight = 30;
            const extraBottomMargin = 70;

            canvas.width = maxWidth;
            canvas.height =
                qrSize +
                padding +
                nameSectionHeight +
                poweredHeight +
                extraBottomMargin;

            // Background
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw QR
            ctx.drawImage(qrImage, (canvas.width - qrSize) / 2, padding, qrSize, qrSize);

            // Draw school name
            ctx.textAlign = "center";
            ctx.fillStyle = "#2c3e50";
            ctx.font = nameFont;

            let textY = qrSize + padding + 40;

            nameLines.forEach(line => {
                ctx.fillText(line, canvas.width / 2, textY);
                textY += lineHeight;
            });

            // Draw “powered by”
            ctx.font = poweredFont;
            ctx.fillStyle = "#7f8c8d";
            ctx.fillText("powered by", canvas.width / 2, textY + 10);

            // Draw SAP Application (blue)
            ctx.font = poweredBlueFont;
            ctx.fillStyle = "#007bff";
            ctx.fillText("SAP Application", canvas.width / 2, textY + 28);

            // Download
            const link = document.createElement("a");
            link.href = canvas.toDataURL("image/png");
            link.download = `${this.school.schoolID}_qrcode.png`;
            link.click();
        };
    }


    private showErrorAlert(title: string, message: string, dialogOpen: boolean, severity: 'error' | 'warning' | 'success' = 'success') {
        this.logger.printLogs('e', 'Failed to create school', message);
        this.messageService.add({
            severity: severity,
            summary: title,
            detail: message,
            life: 3000
        });
        Swal.fire({
            title: 'Saving Failed',
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
}
