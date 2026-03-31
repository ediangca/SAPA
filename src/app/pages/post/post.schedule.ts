import { ChangeDetectorRef, Component, OnInit, signal, ViewChild } from '@angular/core';
import { ConfirmationService, FilterService, MenuItem, MessageService } from 'primeng/api';
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
import { BehaviorSubject, combineLatest, filter, forkJoin, switchMap, take, tap } from 'rxjs';
import { SkeletonModule } from 'primeng/skeleton';
import { PickListModule } from 'primeng/picklist';
import { BadgeModule } from 'primeng/badge';
import { CheckboxModule } from 'primeng/checkbox';


interface Column {
    field: string;
    header: string;
    customExportHeader?: string;
}

interface ExportColumn {
    title: string;
    dataKey: string;
}

export enum ROLE {
    STUDENT = 'UGR0004',
    COORDINATOR = 'UGR0003',
    ADMIN = 'UGR0001',
    SAPADMIN = 'UGR0002'
}

export enum SLOT_STATUS {
    PENDING = 0,
    CONFIRM = 1,
    DECLINE = 2,
    CANCEL_REQUEST = 3, // must be 2 weeks prior
    CANCELED = 4
}

// export const STATUS_TRANSITIONS: Record<number, number[]> = {
//     [SLOT_STATUS.PENDING]: [SLOT_STATUS.CONFIRM, SLOT_STATUS.DECLINE],
//     [SLOT_STATUS.CONFIRM]: [SLOT_STATUS.PENDING, SLOT_STATUS.CANCEL_REQUEST],
//     [SLOT_STATUS.DECLINE]: [SLOT_STATUS.PENDING, SLOT_STATUS.CONFIRM],
//     [SLOT_STATUS.CANCEL_REQUEST]: [SLOT_STATUS.CANCELED, SLOT_STATUS.CONFIRM],
//     [SLOT_STATUS.CANCELED]: [SLOT_STATUS.CANCEL_REQUEST, SLOT_STATUS.PENDING, SLOT_STATUS.CONFIRM]
// };

export const STATUS_TRANSITIONS: Record<number, number[]> = {
    [SLOT_STATUS.PENDING]: [
        SLOT_STATUS.CONFIRM,
        SLOT_STATUS.DECLINE
    ],

    [SLOT_STATUS.CONFIRM]: [
        SLOT_STATUS.CANCEL_REQUEST,
        SLOT_STATUS.PENDING
    ],

    [SLOT_STATUS.DECLINE]: [
        SLOT_STATUS.PENDING,
        SLOT_STATUS.CONFIRM
    ],

    [SLOT_STATUS.CANCEL_REQUEST]: [
        SLOT_STATUS.CANCELED
    ],

    [SLOT_STATUS.CANCELED]: [
        SLOT_STATUS.PENDING,
        SLOT_STATUS.CONFIRM
    ]
};

const ROLE_PERMISSIONS: Record<string, number[]> = {
    [ROLE.STUDENT]: [SLOT_STATUS.CANCEL_REQUEST],
    [ROLE.COORDINATOR]: [
        SLOT_STATUS.CANCEL_REQUEST,
    ],
    [ROLE.ADMIN]: [
        SLOT_STATUS.PENDING,
        SLOT_STATUS.CONFIRM,
        SLOT_STATUS.DECLINE,
        SLOT_STATUS.CANCEL_REQUEST,
        SLOT_STATUS.CANCELED
    ],
    [ROLE.SAPADMIN]: [
        SLOT_STATUS.DECLINE
    ]
};


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
        CheckboxModule,
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
        BadgeModule,
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
        PickListModule,
        Tooltip
    ],
    templateUrl: './post.schedule.component.html',
    styleUrl: './css/post.css',
    providers: [MessageService, ProductService, ConfirmationService]
})
export class Schedule implements OnInit {

    user: any = null;

    subcomponent: MenuItem[] = [];
    properties: MenuItem[] = [];

    itemDialog: boolean = false;
    displayEventDialog: boolean = false;
    printDialogVisible: boolean = false;

    slots = signal<any[]>([]);
    public slot!: any;
    selectSlots!: any[] | [];
    public loading: boolean = false;
    loadingDaySlots: boolean = false;

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
    manageStudentDialog: boolean = false;

    manageAttendanceDialog: boolean = false;

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
    schools: any[] = [];

    INITIAL_EVENTS: any[] = [];

    selectedEvent: any = null;
    dateRange: any;
    selectedDateFrom: string | null = null;
    selectedDateTo: string | null = null;
    printDateRange: Date[] = [];
    selectedSchoolID: number | null = null;
    selectedHospitalID: number | null = null;
    selectedStatus: number | null = null;
    slotStatusOptions = [
        { label: 'PENDING', value: 0 },
        { label: 'CONFIRMED', value: 1 },
        { label: 'DECLINED', value: 2 },
        { label: 'CANCEL REQUEST', value: 3 },
        { label: 'CANCELED', value: 4 }
    ];

    showForceDialog: boolean = false;
    availableSlots: any[] = []
    existingSlots: any[] = [];
    blockedSlots: any[] = [];
    forceRequest: any;


    calendarOptions: CalendarOptions = {};
    selectedDay: string = '';
    daySlots: any[] = [];
    dayDialog: boolean = false;

    // sourceStudent: any[] = [];
    // targetStudent: any[] = [];
    // assignedStudents = 0;

    sourceStudent = signal<any[]>([]);
    targetStudent = signal<any[]>([]);
    assignedStudents = signal(0);

    allStudents!: any[];
    filteredStudents: any[] = [];
    selectedStudents: any[] = [];

    studentSearch = "";
    slotCapacity = 5;

    loadingAttendance: boolean = false;
    appointedStudents: any[] = [];
    attendanceRecords: any[] = [];


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
        private pdfService: PdfService,
        private cdr: ChangeDetectorRef,
        private filterService: FilterService

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
                switchMap(() => this.store.getPrivilegesLoaded()),
                switchMap(() => this.store.getUser().pipe(take(1)))
            )
            .subscribe((user) => {
                this.user = user;
                this.logger.printLogs('i', ' User', this.user);
                this.initPrivileges();
                this.loadHospitals();
                this.loadSchools();
                this.loadSections();
                this.loadShifts();
                this.buildSubComponent()
                this.cdr.detectChanges();
            });

        this.filterService.register('dateRangeFilter', (value: any, filter: any): boolean => {
            if (!filter || (Array.isArray(filter) && filter.every(f => !f))) {
                return true; // no filter applied
            }

            if (!value) return false;

            const cellDate = new Date(value);
            cellDate.setHours(0, 0, 0, 0);

            // Single date selected
            if (!Array.isArray(filter)) {
                const filterDate = new Date(filter);
                filterDate.setHours(0, 0, 0, 0);
                return cellDate.getTime() === filterDate.getTime();
            }

            const [startDate, endDate] = filter;

            if (startDate && !endDate) {
                // Only start date selected (range not yet complete)
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                return cellDate.getTime() === start.getTime();
            }

            if (startDate && endDate) {
                // Full range selected
                const start = new Date(startDate);
                const end = new Date(endDate);
                start.setHours(0, 0, 0, 0);
                end.setHours(23, 59, 59, 999);
                return cellDate >= start && cellDate <= end;
            }

            return true;
        });
    }

    initPrivileges() {
        const moduleID = 'MOD0008';
        this.c = this.store.isAllowedAction(moduleID, 'create');
        this.r = this.store.isAllowedAction(moduleID, 'retrieve');
        this.u = this.store.isAllowedAction(moduleID, 'update');
        this.d = this.store.isAllowedAction(moduleID, 'delete');
        this.s = this.store.isAllowedAction(moduleID, 'status');
        this.p = this.store.isAllowedAction(moduleID, 'printall');


        // this.subcomponent = this.subcomponent.filter((item: any) => {
        //     this.logger.printLogs('i', `Component Accessability: s${this.s}, p${this.p}`, item);
        //     switch (item.id) {
        //         case 's': return this.s;
        //         case 'p': return this.p;
        //         default: return true;
        //     }
        // });

        this.loadSlots();
    }

    // then, given those routes please help proceed with my logic to play with bar section,


    buildSubComponent() {
        const menu = [
            { label: 'Print All', icon: 'fas fa-print', visible: this.p, command: () => this.openPrintDialog() },
            ...(this.tokenPayload.role === 'UGR0001'
                ? [
                    {
                        id: 's',
                        label: 'Status',
                        icon: 'fas fa-layer-group',
                        disabled: !this.selectSlots || this.selectSlots.length === 0,
                        visible: this.s,
                        items: [
                            { label: 'Pending', icon: 'fas fa-file-powerpoint', command: () => this.changeStatus(0) },
                            { label: 'Confirm', icon: 'fas fa-clipboard-check', command: () => this.changeStatus(1) },
                            { label: 'Request Cancel', icon: 'fas fa-file-arrow-up', command: () => this.changeStatus(3) },
                            { label: 'Confirm Cancelation', icon: 'fas fa-file-circle-xmark', command: () => this.changeStatus(4) },
                            { label: 'Declined', icon: 'fas fa-file-excel', command: () => this.changeStatus(2) }
                        ]
                    }
                ]
                : [
                    {
                        label: 'Request Cancel',
                        icon: 'fas fa-file-arrow-up',
                        disabled: !this.selectSlots || this.selectSlots.length === 0,
                        visible: this.s,
                        command: () => this.changeStatus(3)
                    }
                ]),
        ];

        this.subcomponent = [...menu];
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
            { label: 'Unposted |Unconfirmed', value: 0 },
            { label: 'Posted | Confirmed', value: 1 },
            { label: 'Declined', value: 2 },
            { label: 'Cancel Request', value: 3 },
            { label: 'Cancelled', value: 4 },
        ];

        this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));

    }

    buildCalendarEvents() {
        this.calendarOptions = {
            initialView: 'dayGridMonth',
            height: '100%',
            // plugins: [dayGridPlugin, interactionPlugin],
            plugins: [
                interactionPlugin,
                dayGridPlugin,
                timeGridPlugin,
                listPlugin,
            ],
            headerToolbar: {
                left: 'myCustomButton',
                center: 'title',
                // 'today,dayGridMonth,listWeek prev,next'
                right: 'dayGridMonth,listWeek prev,next'
            },
            weekends: true,
            dayMaxEvents: true,        // "+X more"
            fixedWeekCount: false,
            eventDisplay: 'block',
            lazyFetching: true,
            selectable: true,
            ...(this.tokenPayload.role === 'UGR0004' ? {} : {
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
                }
            })
            ,
            selectAllow: (selectInfo) => {
                const minAllowed = new Date();
                minAllowed.setDate(minAllowed.getDate() + 7);
                minAllowed.setHours(0, 0, 0, 0);
                return selectInfo.start >= minAllowed;
            },
            // dayCellClassNames: (arg: any) => {
            //     const today = new Date();
            //     today.setHours(0, 0, 0, 0);

            //     const minAllowed = new Date(today);
            //     minAllowed.setDate(today.getDate() + 7);

            //     const cellDate = new Date(arg.date);
            //     cellDate.setHours(0, 0, 0, 0);

            //     if (cellDate < minAllowed) {
            //         return ['fc-blocked-date'];
            //     }

            //     return [];
            // },
            dayCellDidMount: (info: any) => {
                const cellDate = new Date(info.date);
                cellDate.setHours(0, 0, 0, 0);

                const today = new Date();
                today.setHours(0, 0, 0, 0);

                // Minimum allowed = 1 week from today
                const minAllowedDate = new Date(today);
                minAllowedDate.setDate(today.getDate() + 7);

                // Block: past, today, and < 1 week from today
                if (cellDate < minAllowedDate) {
                    info.el.style.backgroundColor = '#f5f5f5';   // light gray
                    // info.el.style.opacity = '0.55';
                    // info.el.style.pointerEvents = 'none';        // optional
                    info.el.style.cursor = 'not-allowed';

                    // Optional tooltip for justification
                    info.el.title = 'Booking allowed 1 week from today';
                }
            },
            // bind to the new loadMonthEvents
            events: this.loadMonthEvents.bind(this),
            select: this.openNew.bind(this),
            eventClick: (info) => this.onMonthEventClick(info),
        };
    }

    loadMonthEvents(info: any, success: any, failure: any) {
        const startDate = this.dateFormat(info.startStr) || '';
        const endDate = this.dateFormat(info.endStr) || '';

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const minAllowed = new Date(today);
        minAllowed.setDate(today.getDate() + 7);

        // const isAdmin =
        //     this.tokenPayload.role === 'UGR0001' ||
        //     this.tokenPayload.role === 'UGR0002';

        // Admin → no user filter
        // Others → pass userID
        const userID = this.isAdmin() ? null : (
            this.isSupervisor() ? null :
                this.tokenPayload.nameid);

        const schoolID = this.isSchoolCoordinator() || this.isIntern() ? this.user.schoolID : null;

        this.api.getSlotsByRange(startDate, endDate, this.tokenPayload.role, this.tokenPayload.nameid, this.tokenPayload.role === 'UGR0005' ? this.user.hospitalID : null).subscribe({
            next: slots => {
                success(
                    aggregateSlotsByDay(
                        slots,
                        this.tokenPayload.role,
                        this.tokenPayload.nameid,
                        schoolID,
                        (this.tokenPayload.role === 'UGR0005' ? this.user.hospitalID : null)
                    )
                );
                this.logger.printLogs('i', 'Monthly slots loaded', slots);
            },
            error: failure
        });
    }

    isAdmin(): boolean {
        return this.tokenPayload.role === 'UGR0001' || this.tokenPayload.role === 'UGR0002';
    }

    isSchoolCoordinator(): boolean {
        return this.tokenPayload.role === 'UGR0003';
    }

    isIntern(): boolean {
        return this.tokenPayload.role === 'UGR0004';
    }

    isSupervisor(): boolean {
        return this.tokenPayload.role === 'UGR0005';
    }


    loadSlots() {
        this.loading = true;

        if (this.tokenPayload.role === 'UGR0001' || this.tokenPayload.role === 'UGR0002') {
            this.api.getSlots().subscribe({
                next: (slots) => {
                    this.logger.printLogs('i', 'Slots loaded', slots);

                    // this.slots.set(slots);\

                    this.slots.set(slots.map(slot => ({
                        ...slot,
                        dateSlot: new Date(slot.dateSlot),       // ✅ convert string → Date
                        date_Created: new Date(slot.date_Created) // ✅ same for date_created if needed
                    })));

                    // let filteredSlots;
                    // if (this.tokenPayload.role === 'UGR0001' || this.tokenPayload.role === 'UGR0002') {
                    //     this.slots.set(slots);
                    //     filteredSlots = slots;
                    // } else {
                    //     filteredSlots = slots.filter((slot: any) => slot.userID === this.tokenPayload.nameid);
                    //     this.slots.set(filteredSlots);
                    // }
                    this.loading = false;
                    this.buildCalendarEvents();

                    // const mappedEvents = mapSlotsToEvents(filteredSlots, this.tokenPayload.role);

                    // this.calendarOptions.update(opts => ({
                    //     ...opts,
                    //     events: mappedEvents
                    // }));

                    // this.logger.printLogs('i', 'Events mapped', mappedEvents);
                },
                error: (err) => {
                    this.loading = false;
                    this.slots.set([]);
                    this.logger.printLogs('e', 'Failed to fetch slots', err)
                }
            });
        } else if (this.isSchoolCoordinator()) {
            this.api.getSlotsByUserID(this.tokenPayload.nameid).subscribe({
                next: (slots) => {
                    this.slots.set(slots);
                    this.loading = false;
                    this.buildCalendarEvents();
                },
                error: (err) => {
                    this.loading = false;
                    this.slots.set([]);
                    this.logger.printLogs('e', 'Failed to fetch slots', err)
                }
            });
        } else if (this.isIntern()) {
            this.api.GetSlotsByAppointUserID(this.tokenPayload.nameid).subscribe({
                next: (slots) => {
                    this.slots.set(slots);
                    this.loading = false;
                    this.buildCalendarEvents();
                },
                error: (err) => {
                    this.loading = false;
                    this.slots.set([]);
                    this.logger.printLogs('e', 'Failed to fetch slots', err)
                }
            });
        } else if (this.isSupervisor()) {
            this.api.getSlotsByHospitalID(this.user.hospitalID).subscribe({
                next: (slots) => {
                    this.slots.set(slots);
                    this.loading = false;
                    this.buildCalendarEvents();
                },
                error: (err) => {
                    this.loading = false;
                    this.slots.set([]);
                    this.logger.printLogs('e', 'Failed to fetch slots', err)
                }
            });
        }
    }

    onMonthEventClick(info: any) {
        this.dayDialog = true;              // open dialog immediately
        this.loadingDaySlots = true;        // show skeleton

        const slots = info.event.extendedProps.slots ?? [];
        this.selectedDay = info.event.startStr;

        // Small delay for UX (simulate fetch / smooth render)
        setTimeout(() => {
            this.daySlots = slots;
            this.loadingDaySlots = false;

            this.logger.printLogs('i', 'Day slots', this.daySlots);
        }, 400); // 300–500ms is ideal
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
        if (this.tableOption) {
            this.loadSlots();
        }
    }

    onDateSelect(event: any) {
        this.logger.printLogs('i', 'Selected date from onSelect:', event);
    }

    onModelChange(newDate: Date[]) {
        this.logger.printLogs('i', 'Selected date from ngModelChange:', newDate);

        this.printDateRange = newDate;

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
                this.allocations = this.allocations.filter(a => a.status == true);
                this.logger.printLogs('i', 'Allocations loaded by Hospital ID', this.allocations)
                this.itemDialog = true;
            },
            error: (err) => this.logger.printLogs('e', 'Failed to fetch allocations by Hospital ID', err),
        });
        this.itemDialog = true;
    }

    loadSchools() {
        this.api.getSchools().subscribe({
            next: (schools) => {
                this.schools = schools || [];
                if (this.isSchoolCoordinator() || this.isIntern()) {
                    this.schools = this.schools.filter((s: any) => s.schoolID === this.user.schoolID);
                }
                this.logger.printLogs('i', 'Schools loaded', this.schools)
            },
            error: (err) => this.logger.printLogs('e', 'Failed to fetch schools', err)
        });
    }

    loadHospitals() {
        this.api.getHospitals().subscribe({
            next: (hospitals) => {
                this.hospitals = hospitals || [];
                if (this.tokenPayload.role === 'UGR0005') {
                    this.hospitals = this.hospitals.filter((h: any) => h.hospitalID === this.user.hospitalID);
                }
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


    formatTimeOnly(time: string): Date {
        const today = new Date();
        const [hours, minutes, seconds] = time.split(':').map(Number);

        today.setHours(hours, minutes, seconds || 0);
        return today;
    }




    getStatus(status: any, type: string): any {
        // this.logger.printLogs('i', 'Status: ', status)
        switch (status) {
            case 0:
                return (type == 'value' ? 'Unconfirmed' : 'contrast')
            case 1:
                return (type == 'value' ? 'Posted | Confirmed' : 'info')
            case 2:
                return (type == 'value' ? 'Declined' : 'secondary')
            case 3:
                return (type == 'value' ? 'Cancel Request' : 'warn')

            default:
                return (type == 'value' ? 'Cancelled' : 'danger');
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


    onEventClick(slot: any) {
        this.selectedEvent = slot;
        this.slot = slot;
        this.logger.printLogs('i', 'Selected Slot', slot || []);
        this.displayEventDialog = true;
    }


    openNew(selectInfo: DateSelectArg | null) {

        if (!this.c) return;

        this.printDateRange = [];

        this.loadHospitals();
        this.loadSchools();
        this.loadSections();
        this.loadShifts();

        if (selectInfo) {
            const start = new Date(selectInfo.start);
            const end = new Date(selectInfo.end); // exclusive

            const current = new Date(start);
            while (current < end) {
                this.printDateRange.push(new Date(current));
                current.setDate(current.getDate() + 1);
            }
        }

        const minAllowedDate = this.initDate();

        if (this.printDateRange.length && this.printDateRange.some(d => d < minAllowedDate)) {
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
            date: this.printDateRange,   // ✅ ARRAY for multiple mode
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

    isWithinTwoWeeks(dateSlot: string | Date): boolean {
        const slotDate = new Date(dateSlot);
        const today = new Date();

        const diffTime = slotDate.getTime() - today.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);

        // this.logger.printLogs('i', 'Selected Date Slot is ', dateSlot);
        // this.logger.printLogs('i', 'Difference Days', diffDays);
        // this.logger.printLogs('i', 'isWithinTwoWeeks', diffDays < 14);

        return diffDays < 14;
    }

    canChangeStatus(targetStatus: number): boolean {
        if (!this.selectSlots || this.selectSlots.length === 0) {
            return false;
        }

        const allowedFromStatuses = STATUS_TRANSITIONS[targetStatus];
        if (!allowedFromStatuses) return false;

        // role permission
        const roleAllowed = ROLE_PERMISSIONS[this.tokenPayload.role] ?? [];
        if (!roleAllowed.includes(targetStatus)) return false;

        // status compatibility
        const validStatus = this.selectSlots.every(
            (s: any) => allowedFromStatuses.includes(s.status)
        );

        if (!validStatus) return false;

        // 2-week rule for cancel request
        if (targetStatus === SLOT_STATUS.CANCEL_REQUEST) {
            return this.selectSlots.every(
                (s: any) => !this.isWithinTwoWeeks(s.dateSlot)
            );
        }

        return true;
    }

    changeStatus(status: number, slot: any | null = null) {
        // Prepare slots to process
        const slotsToProcess = slot ? [slot] : this.selectSlots ?? [];
        const slotIDs = slotsToProcess.map((s: any) => s.slotID);

        if (slotIDs.length === 0) {
            this.messageService.add({
                severity: 'warn',
                summary: 'No Selected Slot(s)',
                detail: 'Please select at least one slot.',
                life: 3000
            });
            return;
        }

        // ROLE VALIDATION
        const roleAllowed = ROLE_PERMISSIONS[this.tokenPayload.role] ?? [];
        if (!roleAllowed.includes(status)) {
            this.messageService.add({
                severity: 'error',
                summary: 'Access Denied',
                detail: 'You are not allowed to perform this action.',
                life: 3000
            });
            return;
        }

        // STATUS TRANSITION VALIDATION
        const hasInvalidTransition = slotsToProcess.some((s: any) => {
            const currentStatus = Number(s.slotStatus);
            const allowedTargets = STATUS_TRANSITIONS[currentStatus] ?? [];

            return !allowedTargets.includes(status);
        });

        this.logger.printLogs('i', 'STATUS TRANSITION VALIDATION - status', status);
        this.logger.printLogs('i', 'STATUS TRANSITION VALIDATION - hasInvalidTransition', hasInvalidTransition);
        this.logger.printLogs(
            'i',
            'Transition Check',
            slotsToProcess.map(s => ({
                current: s.status,
                allowedNext: STATUS_TRANSITIONS[s.status],
                target: status
            }))
        );

        if (hasInvalidTransition) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Invalid Slot Selection',
                detail: 'Selected slot(s) are not in the correct status.',
                life: 3000
            });
            return;
        }


        // 2-WEEK RULE for CANCEL_REQUEST
        if (
            status === SLOT_STATUS.CANCEL_REQUEST &&
            slotsToProcess.some((s: any) => this.isWithinTwoWeeks(s.dateSlot))
        ) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Cancel Request Denied',
                detail: 'Cancel requests must be made at least 2 weeks in advance.',
                life: 4000
            });
            return;
        }

        // Prepare slot HTML for confirmation dialog
        const slotsHtml = slotsToProcess.map(
            (s: any) =>
                `- ${s.hospitalName} (${s.sectionName})<br>
             (${this.dateFormat(s.dateSlot)}
             ${this.formatTime(s.startTime)} -
             ${this.formatTime(s.endTime)})`
        );

        // Confirmation Dialog
        this.confirmationService.confirm({
            header: 'Confirm Status Update',
            icon: 'pi pi-exclamation-triangle',
            message: `
            Are you sure you want to change the status to
            <b>${this.getStatus(status, 'value')}</b>?<br><br>
            ${slotsHtml.join('<br>')}
        `,
            acceptLabel: "Yes, Proceed",
            rejectLabel: "Cancel",
            acceptButtonStyleClass: 'p-button-success',
            rejectButtonStyleClass: 'p-button-secondary p-button-outlined',

            accept: () => {
                this.api.updateSlotStatus(status, slotIDs).subscribe({
                    next: (res: any) => {

                        this.selectSlots = [];
                        this.showErrorAlert("Status Saved", res.message ?? 'Slot status updated.', false, "success")
                        this.loadSlots();
                    },
                    error: (err: any) => {
                        this.showErrorAlert("Status Failed to Updadte", err.message ?? 'Failed to update slot status.', false, "warning")
                    }
                });
            }
        });
    }

    canManageStudent(slot: any): boolean {
        return (
            (this.tokenPayload.role === 'UGR0001' ||
                this.tokenPayload.role === 'UGR0003') &&
            slot.slotStatus === 1 // CONFIRMED
        );
    }

    canRequestCancel(slot: any): boolean {
        return (
            (this.tokenPayload.role === 'UGR0001' ||
                this.tokenPayload.role === 'UGR0003') &&
            slot.slotStatus === 1 // CONFIRMED
        );
    }

    canApproveCancel(slot: any): boolean {
        return (
            (this.tokenPayload.role === 'UGR0001' ||
                this.tokenPayload.role === 'UGR0002') &&
            slot.slotStatus === 3 // CANCEL_REQUEST
        );
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
    //             this.logger.printLogs('i', 'Create Slot Response:', res);

    //             const blockedCount = res.blocked?.length || 0;
    //             const skippedCount = res.skipped?.length || 0;
    //             const addedCount = res.added?.length || 0;


    //             // Show dialog if there are skipped/unconfirmed slots and not forcing
    //             if (((skippedCount > 0 || blockedCount > 0)) && !force) {
    //                 this.messageService.add({
    //                     severity: 'warn',
    //                     summary: `Existing Slots`,
    //                     // detail: `${skippedCount + blockedCount} slot(s) already exist as unconfirmed & confirmed. Choose an action to proceed.`,
    //                     detail: res.message || `${skippedCount + blockedCount} slot(s) already exist as unconfirmed & confirmed. Choose an action to proceed.`,
    //                     life: 5000
    //                 });

    //                 this.availableSlots = res.added || [];
    //                 this.blockedSlots = res.blocked || [];
    //                 this.existingSlots = res.skipped || [];
    //                 this.showForceDialog = true;

    //                 return;
    //             }

    //             this.logger.printLogs('i', 'Count >>> ', `Added: ${addedCount}, Skipped: ${skippedCount}, Blocked: ${blockedCount}`);

    //             this.logger.printLogs('i', 'Condition 1 >>> ', `${(addedCount > 0 && skippedCount > 0 && force)}`);

    //             this.logger.printLogs('i', 'Condition 2 >>> ', `${(skippedCount < 1 && blockedCount < 1 && addedCount > 0 && !force)}`);

    //             // Show success if any slots were created
    //             if ((addedCount > 0 && skippedCount > 0 && force) ||
    //                 (skippedCount < 1 && blockedCount < 1 && addedCount > 0 && !force)) {
    //                 this.showErrorAlert('Successful', res.message, false, 'success');
    //                 if (this.tableOption) {
    //                     this.loadSlots();
    //                 } else {
    //                     this.buildCalendarEvents();
    //                 }
    //             }
    //         },
    //         error: (err: any) => {
    //             this.messageService.add({
    //                 severity: 'error',
    //                 summary: 'Error',
    //                 detail: err.message || 'Failed to save slots.',
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
                const totalCreated = res.totalCreated || 0;

                // Show conflict dialog only when NOT forcing and conflicts exist
                if ((skippedCount > 0 || blockedCount > 0) && !force) {
                    this.messageService.add({
                        severity: 'warn',
                        summary: 'Existing Slots',
                        detail: res.message || `${skippedCount + blockedCount} slot(s) already exist. Choose an action to proceed.`,
                        life: 5000
                    });

                    this.availableSlots = res.added || [];
                    this.blockedSlots = res.blocked || [];
                    this.existingSlots = res.skipped || [];
                    this.showForceDialog = true;
                    return;
                }

                // Success: slots were actually created
                if (totalCreated > 0) {
                    this.showErrorAlert('Successful', res.message, false, 'success');
                    if (this.tableOption) {
                        this.loadSlots();
                    } else {
                        this.buildCalendarEvents();
                    }
                    return;
                }

                // Nothing was created (e.g. all blocked)
                if (totalCreated === 0 && blockedCount > 0) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'No Slots Created',
                        detail: 'All requested slots are confirmed/blocked and cannot be overridden.',
                        life: 5000
                    });
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


    // forceAddSlots() {
    //     this.showForceDialog = false;
    //     if (!this.forceRequest) return;
    //     this.createSchedule(this.forceRequest, true);
    // }

    // addAvailableOnly() {
    //     this.showForceDialog = false;
    //     if (!this.forceRequest) return;

    //     this.logger.printLogs('i', 'Available Slots to Add:', this.availableSlots);

    //     // Make a copy of the request containing only available slots
    //     const availableRequest = {
    //         ...this.forceRequest,
    //         DateSlots: this.availableSlots.map(s => s.dateSlot),
    //         ShiftIDs: this.availableSlots.map(s => s.shiftID),
    //         HospitalID: this.availableSlots[0].hospitalID,
    //         AllocationIDs: this.availableSlots.map(s => s.allocationID),
    //         UserID: this.tokenPayload.nameid

    //     };

    //     this.createSchedule(availableRequest, true); // force = false
    // }

    // forceAddAll() {
    //     this.showForceDialog = false;
    //     if (!this.forceRequest) return;

    //     this.createSchedule(this.forceRequest, true); // force = true, adds available + existing
    // }

    // Adds ONLY the available (non-conflicting) slots
    addAvailableOnly() {
        this.showForceDialog = false;
        if (!this.forceRequest || this.availableSlots.length === 0) return;

        // Use only the dates from available slots, keep original shiftIDs and allocationIDs
        const availableDates = [...new Set(this.availableSlots.map((s: any) => s.dateSlot))];

        const availableRequest = {
            ...this.forceRequest,
            dateSlots: availableDates, // camelCase to match original request shape
        };

        this.logger.printLogs('i', 'Add Available Only Request:', availableRequest);

        // force = false: these are clean slots, no conflict expected
        this.createSchedule(availableRequest, true);
    }

    // Adds available + unconfirmed (skipped) slots — skips only blocked
    forceAddAll() {
        this.showForceDialog = false;
        if (!this.forceRequest) return;

        // Only proceed if there are available or skipped slots
        if (this.availableSlots.length === 0 && this.existingSlots.length === 0) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Nothing to Add',
                detail: 'No available or unconfirmed slots to force add.',
                life: 3000
            });
            return;
        }

        // force = true: backend will insert available + overwrite unconfirmed (skipped)
        this.createSchedule(this.forceRequest, true);
    }

    // Optional: add ONLY unconfirmed (skipped) slots — if you want that third button
    forceAddSkippedOnly() {
        this.showForceDialog = false;
        if (!this.forceRequest || this.existingSlots.length === 0) return;

        const skippedDates = [...new Set(this.existingSlots.map((s: any) => s.dateSlot))];

        const skippedRequest = {
            ...this.forceRequest,
            dateSlots: skippedDates,
        };

        this.logger.printLogs('i', 'Force Add Skipped Only Request:', skippedRequest);

        this.createSchedule(skippedRequest, true);
    }

    openManageStudent(slot: any) {

        this.slot = slot;

        this.logger.printLogs('i', 'Manage Student for Slot:', slot);

        this.assignedStudents.set(0);

        this.sourceStudent.set([]);
        this.targetStudent.set([]);

        this.api.getAppointedStudentsBySlotID(slot.slotID).subscribe({

            next: (appointedStudents: any[]) => {

                const mapped = (appointedStudents || []).map((x: any) => ({

                    userID: x.userID,
                    fullname: x.fullname

                }));

                this.targetStudent.set(mapped);

                this.assignedStudents.set(mapped.length);

                this.logger.printLogs('i', 'Target students (appointed)', mapped);

                this.loadAvailableStudents();

                this.manageStudentDialog = true;

            },

            error: (err: any) => {

                this.targetStudent.set([]);

                this.loadAvailableStudents();

                this.logger.printLogs('e', 'Failed to fetch appointed students', err);

                this.manageStudentDialog = true;

                this.assignedStudents.set(0);

            }

        });

    }

    trackByUserID(index: number, item: any) {
        return item.userID;
    }


    openAttendance(slot: any, studentID: string | null = null) {

        this.slot = slot;

        this.logger.printLogs('i', 'Attendance for Slot:', slot);
        this.slot = slot;

        // this.dayDialog = false;
        // this.displayEventDialog = false;
        // this.manageStudentDialog = false;
        this.manageAttendanceDialog = true;

        if (!slot?.slotID) return;

        this.loadingAttendance = true;   // LOADING

        // 🔥 Load both in parallel
        forkJoin({
            students: this.api.getAppointedStudentsBySlotID(slot.slotID),
            attendance: this.api.getAttendanceBySlot(slot.slotID)
        }).subscribe({
            next: (res) => {

                this.attendanceRecords = res.attendance;

                // 🔥 Merge logic
                this.appointedStudents = res.students.map(student => {

                    const hasAttendance = this.attendanceRecords
                        .some(a => a.userID === student.userID);

                    return {
                        ...student,
                        hasAttendance,
                        // attendanceStatus: hasAttendance?.status ?? null
                    };
                });

                this.logger.printLogs('i', 'Merged Attendance View', this.appointedStudents);
                this.loadingAttendance = false;
            },
            error: (err) => {
                this.logger.printLogs('e', 'Failed loading attendance view', err);
                this.loadingAttendance = false;
            }
        });
    }


    // loadAvailableStudents() {
    //     this.api.getUsers().subscribe({
    //         next: (users) => {
    //             const appointedUserIDs = new Set(
    //                 this.targetStudent.map((x: any) => x.userID)
    //             );

    //             this.sourceStudent = (users || [])
    //                 .filter((u: any) =>
    //                     u.roleID === 'UGR0004' &&   // STUDENT
    //                     u.schoolID === this.slot.schoolID && // Assign School of the slot
    //                     u.status === 'A' &&      // Aprrove users only
    //                     !appointedUserIDs.has(u.userID)
    //                 )
    //                 .map((u: any) => ({
    //                     userID: u.userID,
    //                     fullname: `${u.lastname}, ${u.firstname} ${u.middlename || ''}`.trim()
    //                 }));

    //             if (this.sourceStudent.length === 0) {
    //                 this.messageService.add({
    //                     severity: 'info',
    //                     summary: 'No Available Students',
    //                     detail: 'There are no available students to assign for this slot.',
    //                     life: 4000
    //                 });
    //             }
    //             this.logger.printLogs('i', 'Source students (available)', this.sourceStudent);
    //         },
    //         error: (err: any) => this.logger.printLogs('e', 'Failed to fetch users', err)
    //     });
    // }

    loadAvailableStudents() {

        this.api.getUsers().subscribe({

            next: (users: any[]) => {

                const appointedUserIDs = new Set(
                    this.targetStudent().map((x: any) => x.userID)
                );

                const availableStudents = (users || [])
                    .filter((u: any) =>
                        u.roleID === 'UGR0004' &&                 // STUDENT
                        u.schoolID === this.slot.schoolID &&     // Same school
                        u.status === 'A' &&                      // Approved only
                        !appointedUserIDs.has(u.userID)          // Not already assigned
                    )
                    .map((u: any) => ({
                        userID: u.userID,
                        fullname: `${u.lastname}, ${u.firstname} ${u.middlename || ''}`.trim()
                    }));


                // 🔹 IMPORTANT: clone array to trigger UI refresh
                // this.sourceStudent = [...availableStudents];

                this.sourceStudent.set(availableStudents);


                if (this.sourceStudent.length === 0) {

                    this.messageService.add({
                        severity: 'info',
                        summary: 'No Available Students',
                        detail: 'There are no available students to assign for this slot.',
                        life: 4000
                    });

                }

                this.logger.printLogs('i', 'Source students (available)', this.sourceStudent);

            },

            error: (err: any) =>
                this.logger.printLogs('e', 'Failed to fetch users', err)

        });

    }


    delete(slot: any) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete ${slot.slotID}?`,
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            rejectLabel: 'Cancel',
            acceptLabel: "Yes! I'm Sure",
            rejectIcon: 'pi pi-times',
            acceptIcon: 'pi pi-check',
            acceptButtonStyleClass: 'p-button-outlined p-button-success',
            rejectButtonStyleClass: 'p-button-danger',

            accept: () => {
                this.logger.printLogs('i', `Deleting Slot ${slot.slotID}`, slot);

                this.api.deleteSlot(slot.slotID).subscribe({
                    next: (res: any) => {
                        this.logger.printLogs('i', 'Slot deleted successfully', res);
                        this.loadSlots();
                        this.showErrorAlert('Successful', 'Slot deleted successfully', false, 'success');
                    },
                    error: (err: any) => {
                        this.logger.printLogs('e', 'Failed to delete Slot', err);
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


    // saveAssignStudentStudent() {
    //     if (!this.slot || !this.targetStudent.length) {
    //         return;
    //     }

    //     const payload = {
    //         slotID: this.slot.slotID,
    //         userIDs: this.targetStudent.map((x: any) => x.userID)
    //     };
    //     this.manageStudentDialog = false;

    //     this.logger.printLogs('i', 'Saving student assignments', payload);
    //     this.logger.printLogs('i', 'Saving targetStudent:', JSON.stringify(this.targetStudent));

    //     this.api.bulkReplaceAppointedStudentsBySlot(payload).subscribe({
    //         next: (res: any) => {
    //             // this.logger.printLogs('i', 'Students assigned successfully', res);
    //             this.showErrorAlert('Successful', 'Students assigned successfully', false, 'success',);
    //             this.onCloseManageStudent();
    //         },
    //         error: (err: any) => {
    //             // this.logger.printLogs('e', 'Failed to assign students', err);
    //             this.showErrorAlert('Assigning Students Failed', err.message || 'Failed to assign students to slot.', false, 'error',);
    //             this.onCloseManageStudent();
    //         }
    //     });
    // }

    get hasAssignedStudents(): boolean {
        return this.targetStudent.length > 0;
    }

    onTransfer(event: any) {

        this.assignedStudents = event.items.length;

        this.messageService.add({
            severity: 'info',
            summary: 'Students Assigned',
            detail: `${this.assignedStudents} student(s) moved.`,
            life: 2000
        });

        this.logger.printLogs('i', 'Target Students Updated:', this.assignedStudents);

        // this.targetStudent = [...this.targetStudent];
    }

    onMoveToTarget(event: any) {

        this.targetStudent.set([...this.targetStudent()]);

        this.sourceStudent.set([...this.sourceStudent()]);

        this.assignedStudents.set(this.targetStudent().length);

        this.autoSave();

    }

    onMoveAllToTarget(event: any) {

        const updatedTarget = [
            ...this.targetStudent(),
            ...event.items
        ];

        this.targetStudent.set(updatedTarget);

        this.sourceStudent.set([]);

        this.assignedStudents.set(updatedTarget.length);

        this.autoSave();

    }

    onMoveToSource(event: any) {

        this.targetStudent.set([...this.targetStudent()]);

        this.sourceStudent.set([...this.sourceStudent()]);

        this.assignedStudents.set(this.targetStudent().length);

        this.autoSave();

    }

    onMoveAllToSource(event: any) {

        const updatedSource = [
            ...this.sourceStudent(),
            ...event.items
        ];

        this.sourceStudent.set(updatedSource);

        this.targetStudent.set([]);

        this.assignedStudents.set(0);

        this.autoSave();

    }

    autoSave() {

        if (!this.slot) return;

        const payload = {

            slotID: this.slot.slotID,

            userIDs: this.targetStudent().map(x => x.userID)

        };

        this.api.bulkReplaceAppointedStudentsBySlot(payload).subscribe();

    }

    saveAssignStudentStudent() {

        if (!this.slot) return;

        const selected = [...this.targetStudent()]; // 🔥 read signal value

        if (selected.length <= 0) {

            this.messageService.add({
                severity: 'warn',
                summary: 'No Students Selected',
                detail: 'Please select at least one student.',
                life: 3000
            });

            return;
        }

        const payload = {

            slotID: this.slot.slotID,

            userIDs: selected.map(x => x.userID)

        };

        this.logger.printLogs('i', 'Saving payload:', payload);

        this.api.bulkReplaceAppointedStudentsBySlot(payload).subscribe({

            next: () => {

                this.showErrorAlert(
                    'Successful',
                    'Students assigned successfully',
                    false,
                    'success'
                );

                this.onCloseManageStudent();

            },

            error: (err: any) => {

                this.showErrorAlert(
                    'Assigning Students Failed',
                    err?.error?.message || 'Failed to assign students.',
                    false,
                    'error'
                );

            }

        });

    }


    onCloseDetails() {
        this.slot = null;
        this.displayEventDialog = false;
    }

    onCloseManageStudent() {
        this.sourceStudent.set([]);
        this.targetStudent.set([]);
        this.manageStudentDialog = false;
    }

    onCloseManagAttendance() {
        this.sourceStudent.set([]);
        this.targetStudent.set([]);
        this.attendanceRecords = [];
        this.appointedStudents = [];
        this.manageAttendanceDialog = false;
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
                this.itemDialog, this.displayEventDialog, this.showForceDialog, this.showForceDialog,
                    this.dayDialog, this.manageStudentDialog, this.printDialogVisible = dialogOpen;
            }
        });
    }

    openPrintDialog() {
        this.loadSlots
        this.printDateRange = [];

        if (this.isIntern()) {
            this.selectedStatus = 1;
            this.selectedSchoolID = this.user.schoolID;
            this.selectedHospitalID = null;
        } else if (this.isSchoolCoordinator()) {
            // this.slotStatusOptions = [
            //     { label: 'PENDING', value: 0 },
            //     { label: 'CONFIRMED', value: 1 },
            //     { label: 'DECLINED', value: 2 },
            //     { label: 'CANCEL REQUEST', value: 3 },
            //     { label: 'CANCELED', value: 4 }
            // ];
            this.selectedSchoolID = this.user.schoolID;
        } else if (this.isSupervisor()) {
            this.selectedHospitalID = this.user.hospitalID;
        } else {
            this.selectedStatus = null;
            this.selectedSchoolID = null
            this.selectedHospitalID = null;
            this.loadHospitals();
            this.loadSchools();
        }
        this.printDialogVisible = true;
    }

    getSelectedSchoolName(): string | null {
        return this.schools?.find(s => s.schoolID === this.selectedSchoolID)?.schoolName || null;
    }

    getSelectedHospitalName(): string | null {
        return this.hospitals?.find(h => h.hospitalID === this.selectedHospitalID)?.hospitalName || null;
    }

    getSelectedStatusLabel(): string | null {
        return this.slotStatusOptions
            .find(s => s.value === this.selectedStatus)?.label || null;
    }

    clearPrintFilters() {
        this.selectedSchoolID = null;
        this.selectedHospitalID = null;
        this.selectedStatus = null;
    }

    closePrintDialog() {
        this.printDialogVisible = false;
    }

    // confirmPrintSchedule() {
    //     const start = this.printDateRange[0];
    //     const end = this.printDateRange[1];

    //     const dateFrom = start.toISOString().split('T')[0];
    //     const dateTo = end.toISOString().split('T')[0];


    //     const filteredSlots: any = this.slots().filter((s: any) => {
    //         return s.dateSlot >= dateFrom && s.dateSlot <= dateTo;
    //     });

    //     this.logger.printLogs('i', `Slot from ${dateFrom} to ${dateTo}`, filteredSlots)

    //     this.pdfService.generateScheduleReport(
    //         `LIST OF SCHEDULE
    //         (${this.dateFormat(dateFrom)} - ${this.dateFormat(dateTo)})`,
    //         filteredSlots,
    //         start.toString(),
    //         end.toString()
    //     );

    //     this.printDialogVisible = false;
    // }   

    confirmPrintSchedule() {
        const [start, end] = this.printDateRange;

        const dateFrom = start.toISOString().split('T')[0];
        const dateTo = end.toISOString().split('T')[0];

        const filteredSlots = this.slots().filter((s: any) => {

            // DATE FILTER (required)
            const isWithinDate =
                s.dateSlot >= dateFrom && s.dateSlot <= dateTo;

            // OPTIONAL FILTERS
            const schoolMatch =
                !this.selectedSchoolID || s.schoolID === this.selectedSchoolID;

            const hospitalMatch =
                !this.selectedHospitalID || s.hospitalID === this.selectedHospitalID;

            const statusMatch =
                this.selectedStatus === null || s.slotStatus === this.selectedStatus;

            return isWithinDate && schoolMatch && hospitalMatch && statusMatch;
        });

        this.logger.printLogs(
            'i',
            `Filtered slots`,
            filteredSlots
        );

        // NO DATA FOUND
        if (!filteredSlots.length) {
            this.showErrorAlert(
                'No Schedule Found',
                'There are no schedules matching your selected filters.',
                true,
                'info'
            );
            this.printDialogVisible = false;

            Swal.fire({
                title: 'No Schedule Found',
                text: 'There are no schedules matching your selected filters.',
                icon: 'info',
                showCancelButton: false,
                confirmButtonText: 'OK',
            }).then((result) => {
                if (result.isConfirmed) {
                    this.printDialogVisible = true;
                }
            });
            return;
        }

        this.pdfService.generateScheduleReport(
            `LIST OF SCHEDULE (${this.dateFormat(dateFrom)} - ${this.dateFormat(dateTo)})`,
            filteredSlots,
            start.toString(),
            end.toString()
        );

        // this.printDialogVisible = false;
    }
}
