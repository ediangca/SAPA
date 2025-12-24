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
import { mapSlotsToEvents, formatTimeString, computeEnd, aggregateSlotsByDay } from './post.schedule.utils';
import { Tooltip } from "primeng/tooltip";
import { ChipModule } from 'primeng/chip';
import { BehaviorSubject, combineLatest, filter, switchMap, take, tap } from 'rxjs';
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
        // AppMenuitem,
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
        SkeletonModule,
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
    public loading: boolean = false;

    form!: FormGroup;

    submitted: boolean = false;

    @ViewChild('dt') dt!: Table;

    exportColumns!: ExportColumn[];

    cols!: Column[];
    headStatuses: any[] = [];
    headHospitals: any[] = [];
    headSections: any[] = [];

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
    tableOption: boolean = true;

    minDate!: Date;

    shiftOption: any[] = [
        // { shiftID: 1, shiftName: 'Morning', value: '7:00:00 - 15:00:00', icon: 'pi pi-calendar' },
        // { shiftID: 2, shiftName: 'Afternoon', value: '15:00:00 - 23:00:00', icon: 'pi pi-calendar' },
        // { shiftID: 3, shiftName: 'Evening', value: '23:00:00 - 7:00:00', icon: 'pi pi-calendar' }
    ];

    allocations: any[] = [];
    hospitals: any[] = [];
    sections: any[] = [];

    INITIAL_EVENTS: any[] = [];

    // calendarOptions = signal<CalendarOptions>({
    //     // validRange: {
    //     //     start: this.initDate()   // Disable today and past days
    //     // },
    //     height: '100%',       // fill parent div height
    //     plugins: [
    //         interactionPlugin,
    //         dayGridPlugin,
    //         timeGridPlugin,
    //         listPlugin,
    //     ],
    //     headerToolbar: {
    //         //today
    //         left: 'prev,next,myCustomButton',
    //         center: 'title',
    //         right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
    //         //   listWeek
    //     },
    //     customButtons: {
    //         myCustomButton: {
    //             text: 'New Schedule',
    //             click: () => {
    //                 // This function runs when the button is clicked
    //                 console.log('Custom button clicked!');
    //                 // You can open a modal, add an event, etc.
    //                 this.openNew(null);
    //             }
    //         }
    //     },
    //     initialView: 'dayGridMonth',
    //     // initialEvents: INITIAL_EVENTS, // alternatively, use the `events` setting to fetch from a feed
    //     // initialEvents: this.INITIAL_EVENTS,
    //     events: [],
    //     weekends: true,
    //     editable: true,
    //     selectable: true,
    //     selectMirror: true,
    //     dayMaxEvents: true,
    //     eventClick: (clickInfo: any) => this.onEventClick(clickInfo),
    //     select: this.openNew.bind(this),
    //     // eventClick: this.handleEventClick.bind(this),
    //     // eventsSet: this.handleEvents.bind(this)
    //     //  you can update a remote database when these fire:
    //     // eventAdd:
    //     // eventChange:
    //     // eventRemove:
    //     // height: 'calc(100vh - 12rem)', 
    //     // contentHeight: 'auto'
    // });
    selectedEvent: any = null;
    dateRange: any;
    selectedDateFrom: string | null = null;
    selectedDateTo: string | null = null;
    dialogDateRange: Date[] = [];

    showForceDialog: boolean = false;
    availableSlots: any[] = [];
    existingSlots: any[] = [];
    blockedSlots: any[] = [];
    forceRequest: any;


    calendarOptions: CalendarOptions = {};
    selectedDay: string = '';
    daySlots: any[] = [];
    dayDialog: boolean = false;


    private privilegesLoadedSubject = new BehaviorSubject<boolean>(false);
    privilegesLoaded$ = this.privilegesLoadedSubject.asObservable();

    c: boolean = false;
    r: boolean = false;
    u: boolean = false;
    d: boolean = false;
    s: boolean = false;
    p: boolean = false;

    constructor(private fb: FormBuilder,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private store: StoreService,
        private api: ApiService,
        private logger: LogsService,
        private vf: ValidateForm,
        private pdfService: PdfService

    ) {
    }

    ngOnInit() {
        this.initForm()
        this.initDate();
        this.initData();
        this.initCols();
    }


    initForm() {
        this.form = this.fb.group({
            slotID: [null],
            date: [[], Validators.required],
            hospitalID: ['', Validators.required],
            shiftID: [[], Validators.required],
            allocationID: [[], Validators.required],
            userID: ['', Validators.required]
        });
    }

    initDate() {
        const today = new Date();
        this.minDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7);
        return this.minDate;
    }

    initData() {
        this.store.getUserPayload()
            .pipe(
                filter(Boolean),
                tap(p => this.tokenPayload = p),
                switchMap(() => this.store.getPrivilegesLoaded())
            )
            .subscribe(() => {
                this.initPrivileges();
                this.buildSubComponent();
                this.loadSlots();
                this.loadHospitals();
                this.loadSections();
                this.loadShifts();
            });
    }

    buildSubComponent() {

        this.subcomponent = [...(this.tokenPayload.role === 'UGR0001'
            ? [
                { label: 'Print All', icon: 'fas fa-print', command: () => this.openPrintDialog() },
                {
                    id: 's',
                    label: 'Status',
                    icon: 'fas fa-layer-group',
                    disabled: !this.selectSlots || this.selectSlots.length === 0,
                    items: [
                        { label: 'Pending', severity: 'warning', icon: 'fas fa-file-powerpoint', command: () => this.changeStatus(0) },
                        { label: 'Confirm', severity: 'primary', icon: 'fas fa-clipboard-check', command: () => this.changeStatus(1) },
                        { label: 'Request Cancel', severity: 'warning', icon: 'fas fa-file-arrow-up', command: () => this.changeStatus(3) },
                        { label: 'Confirm Cancelation', severity: 'info', icon: 'fas fa-file-circle-xmark', command: () => this.changeStatus(4) },
                        { label: 'Declined', severity: 'danger', icon: 'fas fa-file-excel', command: () => this.changeStatus(2) }
                    ]
                }
            ]
            :
            [
                { label: 'Print All', icon: 'fas fa-print', command: () => this.openPrintDialog() },
                ...(this.c ?
                    [
                        {
                            label: 'Request Cancel',
                            icon: 'fas fa-file-arrow-up',
                            disabled: !this.selectSlots || this.selectSlots.length === 0,
                            command: () => this.changeStatus(3)
                        },
                    ]
                    :
                    []
                ),
            ]),
        ];

    }

    initPrivileges() {
        const moduleID = 'MOD0008';
        this.c = this.store.isAllowedAction(moduleID, 'create');
        this.r = this.store.isAllowedAction(moduleID, 'retrieve');
        this.u = this.store.isAllowedAction(moduleID, 'update');
        this.d = this.store.isAllowedAction(moduleID, 'delete');
        this.s = this.store.isAllowedAction(moduleID, 'status');
        this.p = this.store.isAllowedAction(moduleID, 'printall');


        this.subcomponent = this.subcomponent.filter((item: any) => {
            this.logger.printLogs('i', `Component Accessability: s${this.s}, p${this.p}`, item);
            switch (item.id) {
                case 's': return this.s;
                case 'p': return this.p;
                default: return true;
            }
        });

        this.buildSubComponent()
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

        this.headStatuses = [
            { label: 'Unposted', value: 0 },
            { label: 'Posted', value: 1 },
            { label: 'Inactive', value: 2 },
            { label: 'Closed', value: 3 },
        ];


        this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));

    }

    // this.calendarOptions = signal<CalendarOptions>({
    //     height: '100%',       // fill parent div height
    //     plugins: [
    //         interactionPlugin,
    //         dayGridPlugin,
    //         timeGridPlugin,
    //         listPlugin,
    //     ],
    //     headerToolbar: {
    //         //today
    //         left: 'prev,next,myCustomButton',
    //         center: 'title',
    //         right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
    //         //   listWeek
    //     },
    //     customButtons: {
    //         myCustomButton: {
    //             text: 'New Schedule',
    //             click: () => {
    //                 // This function runs when the button is clicked
    //                 console.log('Custom button clicked!');
    //                 // You can open a modal, add an event, etc.
    //                 this.openNew(null);
    //             }
    //         }
    //     },
    //     initialView: 'dayGridMonth',
    //     // initialEvents: INITIAL_EVENTS, // alternatively, use the `events` setting to fetch from a feed
    //     // initialEvents: this.INITIAL_EVENTS,
    //     events: [],
    //     weekends: true,
    //     editable: true,
    //     selectable: true,
    //     selectMirror: true,
    //     dayMaxEvents: true,
    //     eventClick: (clickInfo: any) => this.onEventClick(clickInfo),
    //     select: this.openNew.bind(this),
    //     // eventClick: this.handleEventClick.bind(this),
    //     // eventsSet: this.handleEvents.bind(this)
    //     //  you can update a remote database when these fire:
    //     // eventAdd:
    //     // eventChange:
    //     // eventRemove:


    //     // height: 'calc(100vh - 12rem)', 
    //     // contentHeight: 'auto'
    // });

    // buildCalendarEvents() {

    //     this.calendarOptions = {
    //         initialView: 'dayGridMonth',
    //         height: '100%',
    //         plugins: [dayGridPlugin, interactionPlugin],
    //         headerToolbar: {
    //             left: 'prev,next today',
    //             center: 'title',
    //             right: ''
    //         },

    //         dayMaxEvents: true,        // "+X more"
    //         fixedWeekCount: false,
    //         eventDisplay: 'block',
    //         lazyFetching: true,

    //         selectable: true,

    //         events: this.loadMonthEvents.bind(this),

    //         eventClick: (info) => this.onMonthEventClick(info),
    //     };
    // }

    buildCalendarEvents() {
        this.calendarOptions = {
            initialView: 'dayGridMonth',
            height: '100%',
            plugins: [dayGridPlugin, interactionPlugin],
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: ''
            },

            dayMaxEvents: true,        // "+X more"
            fixedWeekCount: false,
            eventDisplay: 'block',
            lazyFetching: true,

            selectable: true,

            // bind to the new loadMonthEvents
            events: this.loadMonthEvents.bind(this),

            eventClick: (info) => this.onMonthEventClick(info),
        };
    }

    loadMonthEvents(info: any, success: any, failure: any) {
        const startDate = this.dateFormat(info.startStr) || '';
        const endDate = this.dateFormat(info.endStr) || '';

        // call API and aggregate with role-based logic
        this.api.getSlotsByRange(startDate, endDate).subscribe({
            next: slots => {
                const aggregated = aggregateSlotsByDay(
                    slots,
                    this.tokenPayload.role,      // role of current user
                    this.tokenPayload.nameid     // userID for filtering
                );
                success(aggregated);
            },
            error: err => failure(err)
        });

    }

    // loadMonthEvents(info: any, success: any, failure: any) {
    //     const startDate = this.dateFormat(info.startStr) || '';
    //     const endDate = this.dateFormat(info.endStr) || '';

    //     this.api.getSlotsByRange(startDate, endDate).subscribe({
    //         next: slots => {
    //             const aggregated = aggregateSlotsByDay(slots);
    //             success(aggregated);
    //         },
    //         error: err => failure(err)
    //     });
    // }

    loadSlots() {
        this.loading = true;
        this.api.getSlots().subscribe({
            next: (slots) => {
                this.logger.printLogs('i', 'Slots loaded', slots);

                let filteredSlots;
                if (this.tokenPayload.role === 'UGR0001' || this.tokenPayload.role === 'UGR0002') {
                    this.slots.set(slots);
                    filteredSlots = slots;
                } else {
                    filteredSlots = slots.filter((slot: any) => slot.userID === this.tokenPayload.nameid);
                    this.slots.set(filteredSlots);
                }
                
                this.buildCalendarEvents();
                this.loading = false;

                // const mappedEvents = mapSlotsToEvents(filteredSlots, this.tokenPayload.role);

                // this.calendarOptions.update(opts => ({
                //     ...opts,
                //     events: mappedEvents
                // }));

                // this.logger.printLogs('i', 'Events mapped', mappedEvents);
            },
            error: (err) => this.logger.printLogs('e', 'Failed to fetch slots', err)
        });
    }

    onMonthEventClick(info: any) {
        const slots = info.event.extendedProps.slots;

        this.selectedDay = info.event.startStr;
        this.daySlots = slots;

        this.logger.printLogs('i', 'Day slots', this.daySlots)

        this.dayDialog = true; // open p-dialog
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
        this.logger.printLogs('i', 'Selected date from onSelect:', event);
    }

    onModelChange(newDate: Date[]) {
        this.logger.printLogs('i', 'Selected date from ngModelChange:', newDate);

        this.dialogDateRange = newDate;

    }

    exportCSV() {
        this.dt.exportCSV();
    }


    getAllocationsByHospitalID(hospitalID: any) {
        this.itemDialog = false;
        this.allocations = []; // Clear previous allocations
        this.logger.printLogs('i', 'Selected Hospital ID : ', hospitalID);
        this.api.getAllocationsByHospitalID(hospitalID).subscribe({
            next: (res) => {
                this.allocations = res || [];
                this.logger.printLogs('i', 'Allocations loaded by Hospital ID', this.allocations)
                this.itemDialog = true;
            },
            error: (err) => this.logger.printLogs('e', 'Failed to fetch allocations by Hospital ID', err),
        });
        this.itemDialog = true;
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

    loadSections() {
        this.api.getSections().subscribe({
            next: (sections) => {
                this.sections = sections || [];
                this.logger.printLogs('i', 'Sections loaded', sections)
            },
            error: (err) => this.logger.printLogs('e', 'Failed to fetch Sections', err)
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

    // toggleWeekends() {
    //     this.calendarOptions().weekends = !this.calendarOptions().weekends // toggle the boolean!
    // }

    // filterByHospital(hospitalId: string) {
    //     const filtered = this.slots().filter(s => s.hospitalID === hospitalId);
    //     const mapped = mapSlotsToEvents(filtered);

    //     this.calendarOptions.update(opts => ({
    //         ...opts,
    //         events: mapped
    //     }));
    // }

    getStatus(status: any, type: string): any {
        // this.logger.printLogs('i', 'Status: ', status)
        switch (status) {
            case 0:
                return (type == 'value' ? 'Unposted' : 'contrast')
            case 1:
                return (type == 'value' ? 'Post | Confirm' : 'info')
            case 2:
                return (type == 'value' ? 'Inactive' : 'secondary')

            default:
                return (type == 'value' ? 'Closed' : 'danger');
        }
    }

    getShiftSeverity(shift: any): any {
        // this.logger.printLogs('i', 'Shift:', shift);
        switch (shift.toLowerCase()) {
            case 'morning':
                return 'success'
            case 'afternoon':
                return 'warn'
            case 'evening':
                return 'secondary'
            case 'closed':
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

    onScheduleSelectionChange(selected: any[]) {
        this.logger.printLogs('i', "Select slots : ", selected)
        this.selectSlots = selected; // optional, if you want to keep it synced manually
        this.buildSubComponent();
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
                        schoolID: slot.schoolID,
                        schoolName: slot.schoolName,
                        hospitalID: slot.hospitalID,
                        hospitalName: slot.hospitalName,
                        sectionID: slot.sectionID,
                        sectionName: slot.sectionName,
                        shiftID: slot.shiftID,
                        shiftName: slot.shiftName,
                        startTime: `${formatTimeString(slot.dateSlot + 'T' + slot.startTime)}`,
                        endTime: `${formatTimeString(computeEnd(slot.dateSlot, slot.endTime))}`,
                        allocation: slot.allocation,
                        allocationStatus: slot.allocationStatus,
                        userID: slot.userID,
                        fullname: slot.fullname,
                    }
                })
        }

        this.displayEventDialog = true;
    }


    openNew(selectInfo: DateSelectArg | null) {

        this.dialogDateRange = [];

        if (selectInfo) {
            const start = new Date(selectInfo.start);
            const end = new Date(selectInfo.end); // exclusive

            const current = new Date(start);
            while (current < end) {
                this.dialogDateRange.push(new Date(current));
                current.setDate(current.getDate() + 1);
            }
        }

        const minAllowedDate = this.initDate();

        if (this.dialogDateRange.length && this.dialogDateRange.some(d => d < minAllowedDate)) {
            this.showErrorAlert(
                'Invalid Date',
                'You can only create a schedule 1 week from today.',
                false,
                'warning'
            );
            return;
        }

        this.form.reset({
            slotID: null,
            date: this.dialogDateRange,   // ✅ ARRAY for multiple mode
            hospitalID: null,
            shiftID: [],
            allocationID: [],
            userID: this.tokenPayload.nameid
        });

        this.allocations = [];
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

    changeStatus(status: number, slot: any | null = null) {
        this.logger.printLogs('i', `Selected Slots to ${this.getStatus(status, 'value')}`, slot);

        const slotIDs = slot ? [slot.slotID] :
            (this.selectSlots?.map((slot: any) => slot.slotID) ?? []);
        const slots =
            slot ? [`${slot.hospitalName}(${slot.sectionName}) <br> (${this.dateFormat(slot.dateSlot)} ${this.formatTime(slot.startTime)} - ${this.formatTime(slot.endTime)})`] :
                (this.selectSlots?.map(
                    (slot: any) =>
                        `- ${slot.hospitalName}(${slot.sectionName}) <br> (${this.dateFormat(slot.dateSlot)} ${this.formatTime(slot.startTime)} - ${this.formatTime(slot.endTime)})`
                ) ?? []);

        if (!slotIDs.length) {
            this.messageService.add({
                severity: 'warn',
                summary: 'No Selected Slot(s)',
                detail: 'Please select at least one slot first!',
                life: 3000
            });
            return;
        }

        const rules: Record<number, { allowed: number[]; message: string }> = {
            3: {
                allowed: [1],
                message: 'Please select only those Confirmed Slot(s)!'
            },
            0: {
                allowed: [1, 4, 2],
                message: 'Please select only those Confirmed  Slot(s)!'
            },
            1: {
                allowed: [0],
                message: 'Please select only those Pending  Slot(s)!'
            },
            4: {
                allowed: [3],
                message: 'Please select only those requested to Cancel  Slot(s)!'
            },
            2: {
                allowed: [0],
                message: 'Please select only those Pending  Slot(s)!'
            }
        };

        const rule = rules[status];

        if (rule) {
            const hasInvalid = slot ?
                !rule.allowed.includes(slot.status)
                :
                this.selectSlots.some(
                    (a: any) => !rule.allowed.includes(a.status)
                );

            if (hasInvalid) {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Invalid Slot(s) Selection',
                    detail: rule.message,
                    life: 3000
                });
                return;
            }
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
            // dateSlot: this.toLocalDateString(this.form.value.date),
            dateSlots: this.form.value.date.map((d: Date) =>
                this.toLocalDateString(d)
            ),
            shiftIDs: this.form.value.shiftID ?? [],
            hospitalID: this.form.value.hospitalID,
            allocationIDs: this.form.value.allocationID ?? [],
            userID: this.form.value.userID
        };

        this.logger.printLogs('i', 'Create Slot Request : ', request);

        this.itemDialog = false;
        this.createSchedule(request);
    }

    // createSchedule(request: any, force: boolean = false) {
    //     this.forceRequest = request;

    //     this.api.createBulkSchedules(request, force).subscribe({
    //         next: (res: any) => {
    //             this.logger.printLogs('i', 'Create Slot Response : ', res);

    //             // Blocked slots
    //             if (res.blocked?.length > 0) {
    //                 this.messageService.add({
    //                     severity: 'warn',
    //                     summary: 'Blocked Slots',
    //                     detail: `${res.blocked.length} slot(s) already confirmed and cannot be overridden.`,
    //                     life: 5000
    //                 });
    //             }

    //             // Existing unconfirmed slots → ask user
    //             if ((res.skipped?.length > 0 || (res.blocked?.length > 0 && res.added?.length > 0)) && !force) {
    //                 this.messageService.add({
    //                     severity: 'warn',
    //                     summary: 'Existing Slots',
    //                     detail: `${res.skipped.length} slot(s) already exist as unconfirmed. Choose an action to proceed.`,
    //                     life: 5000
    //                 });
    //                 this.availableSlots = res.added || [];
    //                 this.blockedSlots = res.blocked || [];
    //                 this.existingSlots = res.skipped; // skipped represents existing unconfirmed
    //                 this.showForceDialog = true;
    //             }

    //             // Slots newly created
    //             if (res.added?.length > 0 && res.blocked?.length < 1) {
    //                 this.showErrorAlert('Successful', 'Slots created successfully', false, 'success',);
    //                 this.loadSlots();
    //             }
    //             if (res.added?.length > 0 && (res.skipped?.length > 0 || res.blockedSlots?.length > 0) && force) {
    //                 this.showErrorAlert('Successful', 'Slots created successfully', false, 'success',);
    //                 this.loadSlots();
    //             }
    //             if (res.added?.length > 0 && res.skipped?.length < 1  && !force) {
    //                 this.showErrorAlert('Successful', 'Slots created successfully', false, 'success',);
    //                 this.loadSlots();
    //             }
    //         },
    //         error: (err) => {
    //             this.messageService.add({
    //                 severity: 'error',
    //                 summary: 'Error',
    //                 detail: err?.error?.message || 'Failed to save slots.',
    //                 life: 5000
    //             });
    //         }
    //     });
    // }

    createSchedule(request: any, force: boolean = false) {
        this.forceRequest = request;

        this.api.createBulkSchedules(request, force).subscribe({
            next: (res: any) => {
                this.logger.printLogs('i', 'Create Slot Response:', res);

                const blockedCount = res.blocked?.length || 0;
                const skippedCount = res.skipped?.length || 0;
                const addedCount = res.added?.length || 0;


                // Show dialog if there are skipped/unconfirmed slots and not forcing
                if (((skippedCount > 0 || blockedCount > 0)) && !force) {
                    this.messageService.add({
                        severity: 'warn',
                        summary: `Existing Slots`,
                        // detail: `${skippedCount + blockedCount} slot(s) already exist as unconfirmed & confirmed. Choose an action to proceed.`,
                        detail: res.message || `${skippedCount + blockedCount} slot(s) already exist as unconfirmed & confirmed. Choose an action to proceed.`,
                        life: 5000
                    });

                    this.availableSlots = res.added || [];
                    this.blockedSlots = res.blocked || [];
                    this.existingSlots = res.skipped || [];
                    this.showForceDialog = true;
                }

                this.logger.printLogs('i', 'Count >>> ', `Added: ${addedCount}, Skipped: ${skippedCount}, Blocked: ${blockedCount}`);

                this.logger.printLogs('i', 'Condition 1 >>> ', `${(addedCount > 0 && skippedCount > 0 && force)}`);

                this.logger.printLogs('i', 'Condition 2 >>> ', `${(skippedCount < 1 && blockedCount < 1 && addedCount > 0 && !force)}`);

                // Show success if any slots were created
                if ((addedCount > 0 && skippedCount > 0 && force) ||
                    (skippedCount < 1 && blockedCount < 1 && addedCount > 0 && !force)) {
                    this.showErrorAlert('Successful', res.message, false, 'success');
                    this.loadSlots();
                }
            },
            error: (err: any) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: err.message || 'Failed to save slots.',
                    life: 5000
                });
            }
        });
    }


    getMaxLengthIndices(): number[] {
        const maxLength = Math.max(
            this.availableSlots.length,
            this.existingSlots.length,
            this.blockedSlots.length
        );
        return Array.from({ length: maxLength }, (_, i) => i);
    }


    forceAddSlots() {
        this.showForceDialog = false;
        if (!this.forceRequest) return;
        this.createSchedule(this.forceRequest, true);
    }

    addAvailableOnly() {
        this.showForceDialog = false;
        if (!this.forceRequest) return;

        this.logger.printLogs('i', 'Available Slots to Add:', this.availableSlots);

        // Make a copy of the request containing only available slots
        const availableRequest = {
            ...this.forceRequest,
            DateSlots: this.availableSlots.map(s => s.dateSlot),
            ShiftIDs: this.availableSlots.map(s => s.shiftID),
            HospitalID: this.availableSlots[0].hospitalID,
            AllocationIDs: this.availableSlots.map(s => s.allocationID),
            UserID: this.tokenPayload.nameid

        };

        // public List<DateTime> DateSlots { get; set; } = new();
        // public List<string> ShiftIDs { get; set; } = new();
        // public string HospitalID { get; set; } = string.Empty;
        // public List<string> AllocationIDs { get; set; } = new();
        // public string UserID { get; set; } = string.Empty;

        this.createSchedule(availableRequest, false); // force = false
    }

    forceAddAll() {
        this.showForceDialog = false;
        if (!this.forceRequest) return;

        this.createSchedule(this.forceRequest, true); // force = true, adds available + existing
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

                this.api.deleteSlot(school.schoolID).subscribe({
                    next: (res: any) => {
                        this.logger.printLogs('i', 'School deleted successfully', res);
                        this.loadSlots();
                        this.showErrorAlert('Successful', 'School deleted successfully', false, 'success');
                    },
                    error: (err: any) => {
                        this.logger.printLogs('e', 'Failed to delete school', err);
                        this.showErrorAlert('Deleting Failed', err, false, 'error');
                    }
                });
            }
        });
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

                const slotIDs = this.selectSlots?.map((slot: any) => slot.slotID);
                this.api.deleteSlots(slotIDs).subscribe({
                    next: (res: any) => {

                        this.logger.printLogs('i', 'Slots deleted successfully', res);
                        this.showErrorAlert('Successful', 'Selected slots deleted', false, 'success',);
                        this.loadSlots();
                    },
                    error: (err: any) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: err,
                            detail: 'Failed to delete selected slots.',
                            life: 3000
                        });
                        this.logger.printLogs('e', 'Failed to delete slots', err);
                    }
                });

                this.selectSlots = [];
            }
        });
    }


    printAll() {
        this.pdfService.generateSchoolsReport(this.schools());
    }

    private showErrorAlert(title: string, message: string, dialogOpen: boolean, severity: 'error' | 'info' | 'warning' | 'success' = 'success') {

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
        this.dialogDateRange = [];
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
