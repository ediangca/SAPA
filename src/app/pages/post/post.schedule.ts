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
import { CalendarOptions, DateSelectArg } from '@fullcalendar/core/index.js';
import { DatePickerModule } from 'primeng/datepicker';
import { MultiSelectModule } from 'primeng/multiselect';
import { mapSlotsToEvents, formatTimeString, computeEnd } from './post.schedule.utils';
import { Tooltip } from "primeng/tooltip";
import { ChipModule } from 'primeng/chip';


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
        ChipModule,
        Tooltip
    ],
    templateUrl: './post.schedule.component.html',
    styleUrl: './css/post.css',
    providers: [MessageService, ProductService, ConfirmationService]
})
export class Schedule implements OnInit {

    subcomponent: MenuItem[] = [];
    properties: MenuItem[] = [];

    itemDialog: boolean = false;
    displayEventDialog: boolean = false;
    printDialogVisible: boolean = false;

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

    INITIAL_EVENTS: any[] = [];

    calendarOptions = signal<CalendarOptions>({
        // validRange: {
        //     start: this.initDate()   // Disable today and past days
        // },
        plugins: [
            interactionPlugin,
            dayGridPlugin,
            timeGridPlugin,
            listPlugin,
        ],
        headerToolbar: {
            //today
            left: 'prev,next,myCustomButton',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
            //   listWeek
        },
        customButtons: {
            myCustomButton: {
                text: 'New Schedule',
                click: () => {
                    // This function runs when the button is clicked
                    console.log('Custom button clicked!');
                    // You can open a modal, add an event, etc.
                    this.openNew(null);
                }
            }
        },
        initialView: 'dayGridMonth',
        // initialEvents: INITIAL_EVENTS, // alternatively, use the `events` setting to fetch from a feed
        // initialEvents: this.INITIAL_EVENTS,
        events: [],
        weekends: true,
        editable: true,
        selectable: true,
        selectMirror: true,
        dayMaxEvents: true,
        eventClick: (clickInfo: any) => this.onEventClick(clickInfo),
        select: this.openNew.bind(this),
        // eventClick: this.handleEventClick.bind(this),
        // eventsSet: this.handleEvents.bind(this)
        /* you can update a remote database when these fire:
        eventAdd:
        eventChange:
        eventRemove:
        */
    });

    selectedEvent: any = null;
    dateRange: any;
    selectedDateFrom: string | null = null;
    selectedDateTo: string | null = null;
    dialogDateRange: Date[] = [];

    constructor(private fb: FormBuilder,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private store: StoreService,
        private api: ApiService,
        private logger: LogsService,
        private vf: ValidateForm,
        private pdfService: PdfService

    ) {

        this.initForm()
    }

    ngOnInit() {
        this.initDate();
        this.initSubComponent()
        this.initData();
        this.initCols();
    }

    initForm() {
        this.form = this.fb.group({
            slotID: [null],
            date: [new Date(), Validators.required],
            hospitalID: ['', Validators.required],
            shiftID: [[], Validators.required],
            allocationID: [[], Validators.required],
            userID: ['', Validators.required]
        });
    }

    initDate() {
        const today = new Date();
        this.minDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
        return this.minDate;

    }

    initSubComponent() {

        this.subcomponent = [
            {
                items: [
                    // { label: 'Sections', icon: 'fas fa-table-columns', routerLink: ['/dashboard/masterlist/sections'] },
                    { label: 'Print All', icon: 'fas fa-print', command: () => this.openPrintDialog() },

                ]
            }
        ];

        this.properties = [
            {
                label: 'Status',
                icon: 'fas fa-layer-group',
                items: [
                    { label: 'UNPOST', icon: 'pi pi-refresh', command: () => this.changeStatus(0) },
                    { label: 'POST', icon: 'pi pi-thumbtack', command: () => this.changeStatus(1) },
                    { label: 'CLOSED', icon: 'pi pi-lock', command: () => this.changeStatus(2) }
                ]
            }
        ];
        // this.properties = [
        //     {
        //         label: 'Status',
        //         icon: 'fas fa-layer-group',
        //         items: [
        //             { label: 'UNPOST', icon: 'pi pi-refresh', customClass: 'menu-contrast', command: () => this.changeStatus(0) },
        //             { label: 'POST', icon: 'pi pi-thumbtack', customClass: 'menu-info', command: () => this.changeStatus(1) },
        //             { label: 'CLOSED', icon: 'pi pi-lock', customClass: 'menu-danger', command: () => this.changeStatus(2) }
        //         ]
        //     }
        // ];


    }

    initData() {

        this.store.getUserPayload()
            .subscribe(res => {
                this.tokenPayload = res;
                this.logger.printLogs('i', "Token Payload : ", this.tokenPayload)
            });

        this.loadSlots();
        this.loadHospitals();
        this.loadShifts();
    }

    initCols() {
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

    formatDate(date: Date): string {
        return date.toISOString().substring(0, 10);
    }

    toLocalDateString(date: Date): string {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    dateFormat(date: Date | string | null): string | null {
        if (!date) return null;

        // If the date is a string, convert it to a Date object
        if (typeof date === 'string') {
            date = new Date(date);
        }

        // Ensure it's a valid Date object
        if (date instanceof Date && !isNaN(date.getTime())) {
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            return `${year}-${month}-${day}`;
        } else {
            // Handle invalid date
            this.logger.printLogs('w', 'Invalid Date Format', [date]);
            return null;
        }
    }

    onChangeView(event: any) {
        this.tableOption = event?.value ?? false;
        this.logger.printLogs('i', 'Calendar View : ', this.tableOption);
    }

    onDateSelect(event: any) {
        // event will contain the selected date
        // this.selectedDate should also be updated by ngModelChange
        console.log('Selected date from onSelect:', event);
        // If you need the ngModel value immediately, and onSelect fires before ngModel updates,
        // you might need to use a timeout or check the ngModelChange event.
    }

    onModelChange(newDate: Date) {
        console.log('Selected date from ngModelChange:', newDate);
        // This event fires when the ngModel value actually changes.
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
            next: (slots) => {
                this.slots.set(slots)
                this.logger.printLogs('i', 'Slots loaded', this.slots())

                const mappedEvents = mapSlotsToEvents(slots);

                // 🔥 Update calendar options (required when using signals)
                this.calendarOptions.update(opts => ({
                    ...opts,
                    events: mappedEvents  // <<-- Use `events`, not `initialEvents`
                }));

                this.logger.printLogs('i', 'Events mapped', mappedEvents);
            },
            error: (err) => this.logger.printLogs('e', 'Failed to fetch slots', err)
        });
    }

    toggleWeekends() {
        this.calendarOptions().weekends = !this.calendarOptions().weekends // toggle the boolean!
    }

    filterByHospital(hospitalId: string) {
        const filtered = this.slots().filter(s => s.hospitalID === hospitalId);
        const mapped = mapSlotsToEvents(filtered);

        this.calendarOptions.update(opts => ({
            ...opts,
            events: mapped
        }));
    }

    getStatus(status: any, type: string): any {
        // this.logger.printLogs('i', 'Status: ', status)
        switch (status) {
            case 0:
                return (type == 'value' ? 'Unposted' : 'contrast')
            case 1:
                return (type == 'value' ? 'Posted' : 'info')

            default:
                return (type == 'value' ? 'Closed' : 'danger');
        }
    }

    getShiftSeverity(shift: any): any {

        switch (shift.toLowerCase()) {
            case 'morning':
                return 'success'
            case 'afternoon':
                return 'warn'
            case 'evening':
                return 'danger'

            default:
                return 'contrast';
        }
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

    // onEventClick(clickInfo: any) {
    //     const props = clickInfo.event.extendedProps;
    //     this.confirmationService.confirm({
    //         header: 'Event Details',
    //         message: `
    //     <b>Shift:</b> ${props.shiftName} <br/>
    //     <b>Start Time:</b> ${props.startTime} <br/>
    //     <b>End Time:</b> ${props.endTime} <br/>
    //     <b>Allocation:</b> ${props.allocation}
    //   `,
    //         acceptVisible: false, // hide accept button if just viewing
    //         rejectVisible: true,
    //         icon: 'pi pi-info-circle',
    //         acceptLabel: 'Close',
    //         rejectLabel: 'Cancel',
    //         accept: () => { },
    //         reject: () => { }
    //     });
    // }

    onEventClick(slot: any) {
        this.logger.printLogs('i', 'Selected Slot', slot.event || slot);
        if (slot.event) {
            this.selectedEvent = slot.event;
        } else {
            this.selectedEvent =
                ({
                    id: slot.slotID,
                    title: `${slot.hospitalName}(${slot.sectionName}) - ${slot.shiftName}`,
                    shift: slot.shiftName,
                    // `${slot.shiftName} - ${slot.sectionName}`,
                    // describedAs: slot.shiftName,
                    // status: slot.allocationStatus,
                    start: `${slot.dateSlot}T${slot.startTime}`,
                    end: computeEnd(slot.dateSlot!, slot.endTime!),
                    extendedProps: {
                        slotStatus: slot.slotStatus,
                        shiftID: slot.shiftID,
                        shiftName: slot.shiftName,
                        startTime: `${formatTimeString(slot.dateSlot + 'T' + slot.startTime)}`,
                        endTime: `${formatTimeString(computeEnd(slot.dateSlot!, slot.endTime!))}`,
                        hospitalID: slot.hospitalID,
                        hospitalName: slot.hospitalName,
                        sectionID: slot.sectionID,
                        sectionName: slot.sectionName,
                        allocation: slot.allocation,
                        allocationStatus: slot.allocationStatus,
                        userID: slot.userID,
                    }
                })
        }

        this.displayEventDialog = true;
    }


    openNew(selectInfo: DateSelectArg | null) {
        const selectedDate = selectInfo?.startStr
            ? new Date(selectInfo.startStr)  // Convert string to Date
            : null;

        const minAllowedDate = this.initDate(); // tomorrow

        if (selectedDate && selectedDate < minAllowedDate) {
            // Trap: Prevent opening dialog
            this.showErrorAlert('Invalid Date', 'You can only create a schedule starting tomorrow.', false, 'warning');
            return;
        }

        this.form.reset({
            date: selectedDate,
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
        const slotIDs = this.selectSlots?.map((slot: any) => slot.slotID) ?? [];
        const slots = this.selectSlots?.map(
            (slot: any) =>
                `${slot.hospitalName} (${this.dateFormat(slot.dateSlot)} ${this.formatTime(slot.startTime)} - ${this.formatTime(slot.endTime)})`
        ) ?? [];
        this.logger.printLogs('i', 'Selected status', slotIDs);

        if (!slotIDs.length) {
            this.messageService.add({
                severity: 'warn',
                summary: 'No Selected Slot',
                detail: 'Please select at least one slot first!',
                life: 3000
            });
            return;
        }
        if (slotIDs.length > 10) {
            this.messageService.add({
                severity: 'warn',
                summary: 'No Selected Slot',
                detail: 'Please select not more than 10!',
                life: 3000
            });
            return;
        }

        this.confirmationService.confirm({
            message: `Are you sure you want to change the status of selected slot <br><br>${slots.join('<br>')} <br><br>to <b> ${this.getStatus(status, 'value')} </b>?`,
            header: 'Confirm Status Update',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: "Yes! I'm Sure",
            rejectLabel: 'Cancel',
            acceptButtonStyleClass: 'p-button-success',
            rejectButtonStyleClass: 'p-button-outlined  p-button-secondary',

            accept: () => {
                this.api.updateSlotStatus(status, slotIDs).subscribe({
                    next: (res: any) => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: res.message,
                            life: 3000
                        });

                        this.logger.printLogs('i', 'Status updated successfully', res);
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
            dateSlot: this.toLocalDateString(this.form.value.date),
            shiftIDs: this.form.value.shiftID ?? [],
            hospitalID: this.form.value.hospitalID,
            allocationIDs: this.form.value.allocationID ?? [],
            userID: this.form.value.userID
        };

        this.logger.printLogs('i', 'Create Slot Request : ', request);

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
                    summary: 'Error: ' + err,
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

    openPrintDialog() {
        this.printDialogVisible = true;
    }

    closePrintDialog() {
        this.printDialogVisible = false;
    }

    confirmPrintSchedule() {
        const start = this.dialogDateRange[0];
        const end = this.dialogDateRange[1];

        const dateFrom = start.toISOString().split('T')[0];
        const dateTo = end.toISOString().split('T')[0];


        const filteredSlots: any = this.slots().filter((s: any) => {
            return s.dateSlot >= dateFrom && s.dateSlot <= dateTo;
        });

        this.logger.printLogs('i', `Slot from ${dateFrom} to ${dateTo}`, filteredSlots)

        this.pdfService.generateScheduleReport(
            `LIST OF SCHEDULE
            (${this.dateFormat(dateFrom)} - ${this.dateFormat(dateTo)})`,
            filteredSlots,
            start.toString(),
            end.toString()
        );

        this.printDialogVisible = false;
    }
}
