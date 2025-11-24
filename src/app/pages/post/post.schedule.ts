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
import { SelectButtonModule } from 'primeng/selectbutton';
import { FullCalendarModule } from '@fullcalendar/angular';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import { CalendarOptions } from '@fullcalendar/core/index.js';
import { DatePickerModule } from 'primeng/datepicker';
import { MultiSelectModule } from 'primeng/multiselect';


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
    selector: 'post-schedule',
    standalone: true,
    imports: [
        CommonModule,
        MenuModule,
        FormsModule,
        RouterModule,
        TieredMenuModule,
        TableModule,
        SelectButtonModule,
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
        FullCalendarModule,
        DatePickerModule,
        MultiSelectModule,
    ],
    templateUrl: './post.schedule.component.html',
    styleUrl: './css/post.css',
    providers: [MessageService, ProductService, ConfirmationService]
})
export class Schedule implements OnInit {

    subcomponent: MenuItem[] = [];
    properties: MenuItem[] = [];

    itemDialog: boolean = false;

    schools = signal<any[]>([]);
    // school!: any;
    // selectSchools!: any[] | [];

    slots = signal<any[]>([]);
    slot!: any;
    selectSlots!: any[] | [];

    form!: FormGroup;

    submitted: boolean = false;

    @ViewChild('dt') dt!: Table;

    exportColumns!: ExportColumn[];

    cols!: Column[];
    filter: string = '';
    coordinators: any[] = [];

    tokenPayload: any | null;

    assignDialog: boolean = false;
    qrDialog: boolean = false;
    coordinatorID: any | null;

    viewOptions = [
        { label: 'Table', value: true, icon: 'pi pi-table' },
        { label: 'Calendar', value: false, icon: 'pi pi-calendar' }
    ];
    tableOption: boolean = false;

    minDate!: Date;

    shiftOption: any[] = [
        // { shiftID: 1, shiftName: 'Morning', value: '7:00:00 - 15:00:00', icon: 'pi pi-calendar' },
        // { shiftID: 2, shiftName: 'Afternoon', value: '15:00:00 - 23:00:00', icon: 'pi pi-calendar' },
        // { shiftID: 3, shiftName: 'Evening', value: '23:00:00 - 7:00:00', icon: 'pi pi-calendar' }
    ];

    allocations: any[] = [];
    hospitals: any[] = [];

    calendarOptions = signal<CalendarOptions>({
        plugins: [
            interactionPlugin,
            dayGridPlugin,
            timeGridPlugin,
            //   listPlugin,
        ],
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,'
            //   listWeek
        },
        initialView: 'dayGridMonth',
        // initialEvents: INITIAL_EVENTS, // alternatively, use the `events` setting to fetch from a feed
        weekends: true,
        editable: true,
        selectable: true,
        selectMirror: true,
        dayMaxEvents: true,
        // select: this.handleDateSelect.bind(this),
        // eventClick: this.handleEventClick.bind(this),
        // eventsSet: this.handleEvents.bind(this)
        /* you can update a remote database when these fire:
        eventAdd:
        eventChange:
        eventRemove:
        */
    });


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
            slotID: [null],
            date: [new Date(), Validators.required],
            hospitalID: ['', Validators.required],
            shiftID: [[], Validators.required],
            allocationID: [[], Validators.required],
            userID: ['', Validators.required]
        });


    }

    ngOnInit() {

        const today = new Date();
        this.minDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
        this.subcomponent = [
            {
                items: [
                    // { label: 'Sections', icon: 'fas fa-table-columns', routerLink: ['/dashboard/masterlist/sections'] },
                    { label: 'Print All', icon: 'fas fa-print', command: () => this.printAll() },

                ]
            }
        ];

        this.properties = [
            // {
            //     label: 'Status',
            //     icon: 'fas fa-layer-group',
            //     items: [
            //         { label: 'Approve', icon: 'pi pi-fw pi-list', command: () => this.changeStatus(1) },
            //         { label: 'Inactive', icon: 'fas fa-ban', command: () => this.changeStatus(2) },
            //         { label: 'Suspend', icon: 'fas fa-pause-circle', command: () => this.changeStatus(3) },
            //         { label: 'Pending', icon: 'fas fa-clock', command: () => this.changeStatus(0) }
            //     ]
            // },
            // {
            //     label: 'Re-assign Coordinator',
            //     icon: 'pi pi-user-edit',
            //     command: () => this.reAssignDialog()
            // }
        ];

        this.loadData();
    }

    formatDate(date: Date): string {
        return date.toISOString().substring(0, 10);
    }


    loadData() {

        this.store.getUserPayload()
            .subscribe(res => {
                this.tokenPayload = res;
                this.logger.printLogs('i', "Token Payload : ", this.tokenPayload)
            });

        this.loadSlots();
        this.loadHospitals();
        this.loadShifts();

        this.cols = [
            // { field: 'SlotID', header: 'ID', customExportHeader: 'Slot ID' },
            { field: 'slotDate', header: 'Date Slot' },
            { field: 'shiftName', header: 'Shift' },
            { field: 'hospitalName', header: 'Hospital' },
            { field: 'sectionName', header: 'Section' },
            { field: 'status', header: 'Status' },
            { field: 'date_created', header: 'Date Created' },
        ];

        this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));
    }

    onChangeView(event: any) {
        this.tableOption = event?.value ?? false;
        this.logger.printLogs('i', 'Calendar View : ', this.tableOption);
    }


    exportCSV() {
        this.dt.exportCSV();
    }

    // loadAllocations() {
    //     this.api.getAllocations().subscribe({
    //         next: (res) => {
    //             this.allocations = res || [];
    //             this.logger.printLogs('i', 'Allocations loaded', this.allocations)
    //         },
    //         error: (err) => this.logger.printLogs('e', 'Failed to fetch allocations', err)
    //     });
    // }

    getAllocationsByHospitalID(hospitalID: any) {
        this.allocations = []; // Clear previous allocations
        this.logger.printLogs('i', 'Selected Hospital ID : ', hospitalID);
        this.api.getAllocationsByHospitalID(hospitalID).subscribe({
            next: (res) => {
                this.allocations = res || [];
                this.logger.printLogs('i', 'Allocations loaded by Hospital ID', this.allocations)
            },
            error: (err) => this.logger.printLogs('e', 'Failed to fetch allocations by Hospital ID', err)
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

    loadShifts() {
        this.api.getShifts().subscribe({
            next: (shifts) => {
                this.shiftOption = shifts || [];
                this.logger.printLogs('i', 'Shifts loaded', this.shiftOption)
            },
            error: (err) => this.logger.printLogs('e', 'Failed to fetch shifts', err)
        });
    }

    formatTime(timeString: string): string {
        const date = new Date(`1970-01-01T${timeString}`);
        return new Intl.DateTimeFormat('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }).format(date);
    }

    loadSlots() {
        this.api.getSlots().subscribe({
            next: (slots) => this.slots.set(slots),
            error: (err) => this.logger.printLogs('e', 'Failed to fetch slots', err)
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
                return (type == 'value' ? 'Posted' : 'info')

            default:
                return (type == 'value' ? 'Unposted' : 'contrast');
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


    onShiftsChange() {
        const selectedShifts = this.form.value.schifts;
        this.logger.printLogs('i', 'Selected shifts:', selectedShifts);

        // ✅ If you only want their IDs:
        const shiftIDs = selectedShifts.map((s: any) => s.shiftID);
        this.logger.printLogs('i', 'Selected shift IDs:', shiftIDs);
    }

    onSchoolSelectionChange(selected: any[]) {
        this.logger.printLogs('i', "Select slots : ", selected)
        this.selectSlots = selected; // optional, if you want to keep it synced manually
    }

    onGlobalFilter(table: Table) {
        table.filterGlobal(this.filter, 'contains');
    }

    clear(table: Table,) {
        this.filter = ''
        table.clear();
    }

    openNew() {
        this.form.reset({
            schoolName: '',
            userID: this.tokenPayload.nameid
        });
        this.slot = {};
        this.submitted = false;
        this.itemDialog = true;
    }

    openNewDialog() {
        this.form.reset();
        this.itemDialog = true;
    }


    edit(slot: any) {
        this.slot = slot;
        this.logger.printLogs('e', 'Edit slots', slot)
        this.form.patchValue(slot);
        this.itemDialog = true;
    }

    deleteSelected() {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete the selected slot?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            rejectLabel: 'Cancel',
            acceptLabel: "Yes! I'm Sure",
            rejectIcon: 'pi pi-times',
            acceptIcon: 'pi pi-check',
            acceptButtonStyleClass: 'p-button-outlined p-button-success',
            rejectButtonStyleClass: 'p-button-danger',

            accept: () => {

                this.selectSlots = [];
                this.messageService.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Slot Deleted',
                    life: 3000
                });
            }
        });
    }

    reAssignDialog() {
        if (!this.selectSlots || this.selectSlots.length === 0) {
            this.messageService.add({
                severity: 'warn',
                summary: 'No Selected Slot',
                detail: 'Please select at least one slot first!',
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
        this.slot = {};
        this.itemDialog = false;
        this.assignDialog = false;
        this.qrDialog = false;
        this.submitted = false;
    }

    changeStatus(status: number) {
        const schoolIDs = this.selectSlots?.map((school: any) => school.schoolID) ?? [];
        const schools = this.selectSlots?.map((school: any) => school.schoolName) ?? [];

        if (!schoolIDs.length) {
            this.messageService.add({
                severity: 'warn',
                summary: 'No Selected Slot',
                detail: 'Please select at least one slot first!',
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
                        this.loadSlots();
                        this.showErrorAlert('Successful', 'Slot status updated', false, 'success',);
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Slot status updated',
                            life: 3000
                        });
                        this.selectSlots = [];
                    },
                    error: (err) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: err,
                            detail: 'Failed to update slot status.',
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

        const request = {
            dateSlot: this.form.value.date, // Date object
            shiftIDs: this.form.value.shiftID ?? [],
            hospitalID: this.form.value.hospitalID,
            allocationIDs: this.form.value.allocationID ?? [],
            userID: this.form.value.userID
        };

        this.itemDialog = false;

        if (this.slot?.slotID) {
        } else {
            this.createSchedule(request);
        }

    }
    createSchedule(request: any) {
        this.api.createBulkSlots(request).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Created',
                    detail: 'Slots successfully created!'
                });
                this.itemDialog = false;
                this.loadSlots();
            },
            error: (err) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error: '+ err,
                    detail: 'Failed to save slots.'
                });
                this.logger.printLogs('e', 'Failed to create slots', err);
            }
        });
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
                        this.loadSlots();
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
