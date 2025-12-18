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
import { StepperModule } from 'primeng/stepper';
import { BadgeModule } from 'primeng/badge';
import { DatePickerModule } from 'primeng/datepicker';
import { MultiSelectModule } from 'primeng/multiselect';
import { ChipModule } from 'primeng/chip';
import { FullCalendarModule } from '@fullcalendar/angular';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import { SkeletonModule } from 'primeng/skeleton';
import { CheckboxModule } from 'primeng/checkbox';
import { SafeUrlPipe } from '@/helper/handler/safe-url-pipe';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';


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
    selector: 'ml-appointment',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        FormsModule,
        RouterModule,
        CommonModule,
        MenuModule,
        TieredMenuModule,
        TableModule,
        FormsModule,
        ButtonModule,
        // AppMenuitem,
        PanelMenuModule,
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
        StepperModule,
        BadgeModule,
        DatePickerModule,
        MultiSelectModule,
        ChipModule,
        BadgeModule,
        FullCalendarModule,
        SkeletonModule,
        CheckboxModule,
        ProgressSpinnerModule,
        SafeUrlPipe,
        TooltipModule,
    ],
    templateUrl: './ml.appointment.component.html',
    styleUrl: './css/masterlist.scss',
    providers: [MessageService, ProductService, ConfirmationService]
})
export class Appointment implements OnInit {

    subcomponent: MenuItem[] = [];
    properties: MenuItem[] = [];

    itemDialog: boolean = false;
    displayDialog: boolean = false;

    appointments = signal<any[]>([]);
    appointment!: any;
    selectAppointments!: any[] | [];
    selectedAppointment!: any;

    form!: FormGroup;

    submitted: boolean = false;

    @ViewChild('dt') dt!: Table;

    exportColumns!: ExportColumn[];

    cols!: Column[];
    filter: string = '';
    coordinators: any[] = [];

    tokenPayload: any | null;

    currentStep = 1;

    allocations: any[] = [];
    hospitals: any[] = [];
    schools: any[] = [];

    calendarOptions: any;

    selectedDate: any;
    enabledDates: string[] = [];
    allowedDates: Date[] = [];

    slots: any[] = [];
    public slot: any;
    slotConfirmed: { [slotId: string]: boolean } = {};

    calendarPlugins = [dayGridPlugin, interactionPlugin];
    availableDates: any[] = [];
    events: any[] = [];

    selectedDateSlots: any[] = [];
    distinctSections: any[] = [];
    filteredSlots: any[] = [];

    filteredAppointments: any[] = [];


    // Example: only enable dates with active slots
    validRange = {
        start: new Date().toISOString().split('T')[0]
    };

    slotsModalVisible: boolean = false;

    shiftOptions: any[] = [];

    isLoading: boolean = true;

    printDialogVisible: boolean = false;
    dialogSchool: string | null = null;
    dialogHospital: string | null = null;
    dialogSections: string[] = [];
    dialogShift: string | null = null;

    dialogDateRange: any[] = [];

    // Lists (populate from API)
    schoolList: any[] = [];
    hospitalList: any[] = [];
    sectionList: any[] = [];
    shiftList: any[] = [];

    pdfPreviewSrc: string | null = null;

    constructor(private fb: FormBuilder,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private store: StoreService,
        private api: ApiService,
        private logger: LogsService,
        private vf: ValidateForm,
        public pdfService: PdfService

    ) {
        this.initForm()
    }


    ngOnInit() {
        this.initCalendar();
        this.initData();
    }

    initForm() {
        this.form = this.fb.group({
            appointmentID: [null],
            schoolID: ['', Validators.required],
            hospitalID: ['', Validators.required],
            allocationIDs: ['', Validators.required],
            sectionID: ['', Validators.required],
            slotID: ['', Validators.required],
            dateSlot: ['', Validators.required],
            shiftID: ['', Validators.required],
            userID: ['', Validators.required],
            agree: [false, Validators.required]
        });

    }

    initCalendar() {
        this.calendarOptions = {
            plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin, listPlugin],
            headerToolbar: {
                left: 'prev,next',
                center: 'title',
                right: 'dayGridMonth'
            },
            initialView: 'dayGridMonth',
            selectable: true,
            editable: false,
            dayMaxEvents: true,
            events: this.events,
            eventClick: this.onEventClick.bind(this),
            select: this.onEventClick.bind(this),
            selectAllow: (selectInfo: any) => {
                const dateStr = selectInfo.startStr;
                return this.availableDates.includes(dateStr);
            },
            dayCellDidMount: (info: any) => {
                const dateStr = info.date.toISOString().split('T')[0];
                if (!this.availableDates.includes(dateStr)) {
                    info.el.style.backgroundColor = '#f5f5f5';
                    info.el.style.pointerEvents = 'none';
                    info.el.style.opacity = '0.5';
                }
            }
        };
    }
    initData() {
        this.loadData();
        this.loadHospitals();
    }

    loadData() {

        this.store.getUserPayload()
            .subscribe(res => {
                this.tokenPayload = res;
                this.logger.printLogs('i', "Token Payload : ", this.tokenPayload)
                this.buildSubComponent();
                this.loadAppointments();
                this.loadSchools();
            });

        this.cols = [
            { field: 'AppointmentID', header: 'ID', customExportHeader: 'Appointment ID' },
            { field: 'dateSlot', header: 'Date Slot' },
            { field: 'hospitalName', header: 'Hospital' },
            { field: 'sectionName', header: 'Section' },
            { field: 'shiftName', header: 'Shift' },
            { field: 'date_created', header: 'Date Created' },
        ];

        this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));
    }

    buildSubComponent() {
        this.subcomponent = [
            ...(this.tokenPayload.role === 'UGR0001'
                ? [
                    { label: 'Print All', icon: 'fas fa-print', command: () => this.printAll() },
                    {
                        id: 's',
                        label: 'Status',
                        icon: 'fas fa-layer-group',
                        disabled: !this.selectAppointments || this.selectAppointments.length === 0,
                        items: [
                            { label: 'Pending', severity: 'warning', icon: 'fas fa-file-powerpoint', command: () => this.changeStatus(0) },
                            { label: 'Confirm',  severity: 'primary', icon: 'fas fa-clipboard-check', command: () => this.changeStatus(1) },
                            { label: 'Request Cancel', severity: 'warning', icon: 'fas fa-file-arrow-up', command: () => this.changeStatus(3) },
                            { label: 'Confirm Cancelation', severity: 'info', icon: 'fas fa-file-circle-xmark', command: () => this.changeStatus(4) },
                            { label: 'Declined', severity: 'danger', icon: 'fas fa-file-excel', command: () => this.changeStatus(2) }
                        ]
                    }
                ]
                : [
                    { label: 'Print All', icon: 'fas fa-print', command: () => this.printAll() },
                    {
                        label: 'Request Cancel',
                        icon: 'fas fa-file-arrow-up',
                        disabled: !this.selectAppointments || this.selectAppointments.length === 0,
                        command: () => this.changeStatus(3)
                    },
                ]),
        ]

    }

    loadAppointments() {
        this.api.getAppointments().subscribe({
            next: (appointments) => {
                this.logger.printLogs('i', `Loading appointments`, appointments);

                if (this.tokenPayload.role === 'UGR0001') {
                    this.logger.printLogs('i', 'Appointments loaded for AdminSys', appointments);
                    this.appointments.set(appointments || []);
                } else {
                    const filtered = (appointments || []).filter(
                        s => s.userID === this.tokenPayload.nameid
                    );
                    this.logger.printLogs('i', 'Appointments loaded for Others', filtered);
                    this.appointments.set(filtered);
                }
            },
            error: (err) => this.logger.printLogs('e', 'Failed to fetch Appointments', err)
        });
    }

    loadSchools() {
        this.api.getSchools().subscribe({
            next: (schools) => {
                this.logger.printLogs('i', 'View School with Role: ', this.tokenPayload.role)
                if (this.tokenPayload.role === 'UGR0001') {
                    this.logger.printLogs('i', 'Schools loaded for AdminSys', this.schools)
                    this.schools = schools || [];
                } else {
                    this.logger.printLogs('i', 'Schools loaded for Other User', this.schools)
                    this.schools = schools.filter(s => s.userID === this.tokenPayload.nameid) || [];
                }
            },
            error: (err) => this.logger.printLogs('e', 'Failed to fetch schools', err)
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

    onDateClick(info: any) {
        if (!this.enabledDates.includes(info.dateStr)) {
            return; // block user
        }

        this.selectedDate = info.dateStr;
    }

    getAllocationsByHospitalID(hospitalID: any) {
        this.itemDialog = false;
        this.slot = null;
        this.allocations = [];
        this.distinctSections = [];
        this.isLoading = true;
        this.form.get('allocationIDs')?.setValue(null);
        this.form.get('date')?.setValue(null);
        this.form.get('sectionID')?.setValue(null);
        this.form.get('slotID')?.setValue(null);
        this.form.get('shiftID')?.setValue(null);

        this.logger.printLogs('i', 'Selected Hospital ID : ', hospitalID);
        this.api.getAllocationsByHospitalID(hospitalID).subscribe({
            next: (res) => {
                this.allocations = res || [];
                this.logger.printLogs('i', 'Allocations loaded by Hospital ID', this.allocations)
                this.itemDialog = true;
            },
            error: (err) => {
                this.logger.printLogs('e', 'Failed to fetch allocations by Hospital ID', err)
                this.showErrorAlert("Error", 'Failed to fetch allocations by Hospital ID', false, "error")
            }
        });
    }

    getSlotsByAllocationIDs(selectedIDs: string[]) {

        this.slot = null;
        this.distinctSections = [];
        // this.selectedSection = null;
        this.filteredSlots = [];
        this.isLoading = true;

        this.form.get('date')?.setValue(null);
        this.form.get('sectionID')?.setValue(null);
        this.form.get('slotID')?.setValue(null);
        this.form.get('shiftID')?.setValue(null);


        if (!selectedIDs || selectedIDs.length === 0) {
            this.availableDates = [];
            this.events = [];
            this.messageService.add({
                severity: 'warning',
                summary: 'Please select at least 1 section first.',
                detail: 'No Selected Section',
                life: 3000
            });
            return;
        }

        this.itemDialog = false;

        const payload = { AllocationID: selectedIDs };
        this.logger.printLogs('i', 'Selected Allocation IDs', payload);

        this.api.getSlotsByAllocationIDs(payload).subscribe({
            next: (slots) => {
                this.slots = slots;

                this.logger.printLogs('i', 'Slots', slots);
                // Filter slots with slotStatus === 1
                const validSlots = slots.filter(s => s.slotStatus === 1);

                // Group slots by date
                const slotsByDate = validSlots.reduce((acc: any, slot: any) => {
                    if (!acc[slot.dateSlot]) acc[slot.dateSlot] = [];
                    acc[slot.dateSlot].push(slot);
                    return acc;
                }, {});


                this.logger.printLogs('i', 'Slots by Date', slotsByDate);

                // Available dates
                this.availableDates = Object.keys(slotsByDate);

                // Create normal events with slots attached
                this.events = this.availableDates.map(date => ({
                    title: 'Available',        // normal event for clicking
                    start: date,
                    allDay: true,
                    backgroundColor: '#138d42ff',
                    borderColor: '#023a1755',
                    extendedProps: { slots: slotsByDate[date] }
                }));

                this.events = this.availableDates.map(date => ({
                    title: 'Available',        // normal event title, required
                    start: date,
                    allDay: true,
                    backgroundColor: '#138d42ff',
                    borderColor: '#023a1755',
                    extendedProps: { slots: slotsByDate[date] } // attach slots
                }));


                this.logger.printLogs('i', 'Events', this.events);

                // Refresh calendar options to reapply events and date restrictions
                this.initCalendar();

                this.itemDialog = true;
            },
            error: (err) => {
                this.logger.printLogs('e', 'Failed to fetch Slots By Allocation IDs', err);
                this.showErrorAlert("Error", 'Failed to fetch Slots By Allocation IDs', false, "error")
            }
        });
    }

    onEventClick(selectInfo: any) {

        this.slot = null;
        this.isLoading = true;
        this.form.get('sectionID')?.setValue(null);
        this.form.get('slotID')?.setValue(null);
        this.form.get('shiftID')?.setValue(null);

        const selectedDate = selectInfo?.startStr
            ? new Date(selectInfo.startStr)  // Convert string to Date
            : null;

        if (!selectedDate) return;

        const dateStr = selectedDate.toISOString().split('T')[0]; // 'YYYY-MM-DD'

        this.logger.printLogs('i', 'Selected Date', dateStr);
        this.form.get('dateSlot')?.setValue(dateStr);


        // Filter slots for this date
        this.selectedDateSlots = this.slots.filter(slot => slot.dateSlot === dateStr);


        // Populate DISTINCT section names
        this.distinctSections = Object.values(
            this.selectedDateSlots.reduce((acc: any, slot: any) => {
                if (!acc[slot.sectionID]) {
                    acc[slot.sectionID] = {
                        label: slot.sectionName,
                        value: slot.sectionID,
                        sectionName: slot.sectionName
                    };
                }
                return acc;
            }, {})
        );

        this.logger.printLogs('i', 'Distinct Sections: ', this.distinctSections);

        // Reset UI
        // this.selectedSection = null;
        this.filteredSlots = [];
    }

    onSectionChange(section: any) {

        this.slot = null;
        this.isLoading = true;
        this.form.get('slotID')?.setValue(null);
        this.form.get('shiftID')?.setValue(null);

        if (!section) {
            this.filteredSlots = [];
            return;
        }

        this.logger.printLogs('i', `Selected Section`, section.value);
        this.form.get('shiftID')?.setValue(section.value);
        // Filter shifts belonging only to this section
        this.filteredSlots = this.selectedDateSlots
            .filter(s => s.sectionID === section.value);

        this.logger.printLogs('i', `All Slots under Section ${section.value} - filteredSlots: `, this.filteredSlots);
    }


    formatTime(timeString: string): string {
        const date = new Date(`1970-01-01T${timeString}`);
        return new Intl.DateTimeFormat('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }).format(date);
    }

    onShiftSelect(slot: any) {
        this.logger.printLogs('i', 'Selected slot:', slot);

        // this.slot = slot;

        setTimeout(() => {
            this.slot = slot; // Or wherever your slot comes from
            this.form.get('slotID')?.setValue(slot.slotID);
            this.isLoading = false;
        }, 600); // 600ms for smooth feel
    }

    exportCSV() {
        this.dt.exportCSV();
    }


    getStatus(status: any, type: string): any {
        switch (status) {
            case 1:
                return (type == 'value' ? 'Confirm/ed' : 'info')
            case 2:
                return (type == 'value' ? 'Declined' : 'contrast')
            case 3:
                return (type == 'value' ? 'Request to Cancel' : 'warn')
            case 4:
                return (type == 'value' ? 'Cancel/ed' : 'danger')

            default:
                return (type == 'value' ? 'Pending' : 'warn');
        }
    }


    onAppointmentSelectionChange(selected: any[]) {
        this.logger.printLogs('i', "Select appointments : ", selected)
        this.selectAppointments = selected;
        this.buildSubComponent();
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
            appointmentID: null,
            schoolID: '',
            hospitalID: '',
            allocationIDs: '',
            sectionID: '',
            slotID: '',
            dateSlot: '',
            shiftID: '',
            userID: this.tokenPayload.nameid,
            agree: false
        });

        this.appointment = null;
        this.submitted = false;
        this.itemDialog = true;
    }

    openNewDialog() {
        this.form.reset();
        this.itemDialog = true;
    }


    edit(appointment: any) {
        this.appointment = appointment;
        this.logger.printLogs('e', 'Edit appointment', appointment)
        this.form.patchValue(appointment);
        this.itemDialog = true;
    }

    deleteSelected() {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete the selected appointment?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            rejectLabel: 'Cancel',
            acceptLabel: "Yes! I'm Sure",
            rejectIcon: 'pi pi-times',
            acceptIcon: 'pi pi-check',
            acceptButtonStyleClass: 'p-button-outlined p-button-success',
            rejectButtonStyleClass: 'p-button-danger',

            accept: () => {

                this.selectAppointments = [];
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
        this.form.reset({
            appointmentID: null,
            schoolID: '',
            hospitalID: '',
            allocationIDs: '',
            sectionID: '',
            slotID: '',
            dateSlot: '',
            shiftID: '',
            userID: this.tokenPayload.nameid
        });

        this.selectedDate = null;
        this.enabledDates = [];
        this.allowedDates = [];

        this.slots = [];
        this.slot = null;

        this.availableDates = [];
        this.events = [];

        this.selectedDateSlots = [];
        this.distinctSections = [];
        this.filteredSlots = [];

        this.currentStep = 1;

        this.isLoading = true;
        this.itemDialog = false;
        this.submitted = false;

    }

    step1HasError(): boolean {

        let hasError: boolean = false;

        // const selectedIDs: any[] = this.form.value.allocationIDs;

        // if (!this.form.value.allocationIDs || this.form.value.allocationIDs === 0) {

        //     this.allowedDates = [];
        //     this.messageService.add({
        //         severity: 'warning',
        //         summary: 'Please select select at least 1 section first.',
        //         detail: 'No Selected Section',
        //         life: 3000
        //     });
        //     hasError = true;
        // }

        // this.logger.printLogs('i', 'Selected IDs', selectedIDs)

        //  if((this.form.controls['lastname'].invalid &&
        //     this.form.hasError('required', 'lastname') &&
        //     this.form.get('lastname')?.touched ||
        //     (this.form.controls['lastname'].dirty &&
        //         this.form.hasError('required', 'lastname'))) ||
        //     (this.form.controls['firstname'].invalid &&
        //         this.form.hasError('required', 'firstname') &&
        //         this.form.get('firstname')?.touched ||
        //         (this.form.controls['firstname'].dirty &&
        //             this.form.hasError('required', 'firstname'))) ||
        //     (this.form.controls['middlename'].invalid &&
        //         this.form.hasError('required', 'middlename') &&
        //         this.form.get('middlename')?.touched ||
        //         (this.form.controls['middlename'].dirty &&
        //             this.form.hasError('required', 'middlename')))
        // ){
        //     hasError = true;
        // }


        return hasError;
    }

    step2HasError() {
        return false;
    }

    step3HasError() {
        return this.submitted && this.slot === null;
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

    changeStatus(status: number, appointment: any | null = null) {
        this.logger.printLogs('i', `Update appointment to ${this.getStatus(status, 'value')}`, appointment);

        const appointmentIDs = appointment ? [appointment.appointmentID] :
            (this.selectAppointments?.map((appointment: any) => appointment.appointmentID) ?? []);
        const appointments =
            appointment ? [`${appointment.hospitalName}(${appointment.sectionName}) <br> (${this.dateFormat(appointment.dateSlot)} ${this.formatTime(appointment.startTime)} - ${this.formatTime(appointment.endTime)})`] :
                (this.selectAppointments?.map(
                    (appointment: any) =>
                        `- ${appointment.hospitalName}(${appointment.sectionName}) <br> (${this.dateFormat(appointment.dateSlot)} ${this.formatTime(appointment.startTime)} - ${this.formatTime(appointment.endTime)})`
                ) ?? []);

        if (!appointmentIDs.length) {
            this.messageService.add({
                severity: 'warn',
                summary: 'No Selected Appointment(s)',
                detail: 'Please select at least one appointment first!',
                life: 3000
            });
            return;
        }

        const rules: Record<number, { allowed: number[]; message: string }> = {
            3: {
                allowed: [1],
                message: 'Please select only those Confirmed Appointments!'
            },
            0: {
                allowed: [1, 4, 2],
                message: 'Please select only those Confirmed Appointments!'
            },
            1: {
                allowed: [0],
                message: 'Please select only those Pending Appointments!'
            },
            4: {
                allowed: [3],
                message: 'Please select only those requested to Cancel Appointments!'
            },
            2: {
                allowed: [0],
                message: 'Please select only those Pending Appointments!'
            }
        };

        const rule = rules[status];

        if (rule) {
            const hasInvalid = appointment ?
                !rule.allowed.includes(appointment.status)
                :
                this.selectAppointments.some(
                    (a: any) => !rule.allowed.includes(a.status)
                );

            if (hasInvalid) {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Invalid Appointment(s) Selection',
                    detail: rule.message,
                    life: 3000
                });
                return;
            }
        }


        this.confirmationService.confirm({
            message: `Are you sure you want to <b>${this.getStatus(status, 'value')}</b> the selected appointment(s)? <br><br>${appointments.join('<br')}`,
            header: `${this.getStatus(status, 'value')} Confirmation`,
            icon: 'pi pi-exclamation-circle',
            acceptLabel: "Yes! I'm Sure",
            rejectLabel: 'Cancel',
            acceptButtonStyleClass: 'p-button-success',
            rejectButtonStyleClass: 'p-button-outlined  p-button-secondary',

            accept: () => {

                this.displayDialog = false;
                this.api.updateAppoitmentStatus(status, appointmentIDs).subscribe({
                    next: (res: any) => {

                        this.logger.printLogs('i', 'Status updated successfully', res);
                        this.loadAppointments();
                        this.showErrorAlert('Successful', 'Appointment status updated', false, 'success',);
                        this.selectAppointments = [];
                    },
                    error: (err) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: err,
                            detail: 'Failed to update appointment status.',
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

        // this.appointment = this.form.value;
        // this.logger.printLogs('i', 'Processing Appointment... ', this.appointment);

        if (!this.form.valid) {
            this.messageService.add({
                severity: 'warning',
                summary: 'Incomplete Fields',
                detail: 'Please complete all required fields before proceeding!',
                life: 3000
            });

            this.confirmationService.confirm({
                message: `Please complete all required fields before proceeding!`,
                header: 'Incomplete Fields',
                icon: 'pi pi-info',

                rejectVisible: false,
                acceptLabel: "OK",
                acceptIcon: 'pi pi-check',
                acceptButtonStyleClass: 'p-button-primary'
            });

            this.vf.validateFormFields(this.form);
            return;
        }

        this.itemDialog = false;

        this.appointment = this.form.value;
        this.logger.printLogs('i', 'Creating Appointment... ', this.appointment);

        this.api.createAppointment(this.appointment).subscribe({
            next: (res) => {
                this.logger.printLogs('i', 'Appointment created successfully', res);
                this.loadAppointments(); // reload list
                this.hideDialog();
                this.showErrorAlert('Successful', 'Appointment created successfully, Please confirm your booking to your email.', false, 'success');
            },
            error: (err) => {
                this.showErrorAlert('Failed to Book Appointment', err, false, 'warning');
            },
            complete: () => {
                this.submitted = false;
            }
        });
        // }
    }

    delete(appointment: any) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete the selected appointment <br> 
            <b>${appointment.hospitalName} (${appointment.sectionName}) <br> 
            ${this.dateFormat(appointment.dateSlot)} - ${appointment.shiftName} shift </b>?`,
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            rejectLabel: 'Cancel',
            acceptLabel: "Yes! I'm Sure",
            rejectIcon: 'pi pi-times',
            acceptIcon: 'pi pi-check',
            acceptButtonStyleClass: 'p-button-outlined p-button-success',
            rejectButtonStyleClass: 'p-button-danger',

            accept: () => {
                this.logger.printLogs('i', `Deleting Appointment ${appointment.dateSlot}`, appointment);

                this.api.deleteAppointment(appointment.appointmentID).subscribe({
                    next: (res) => {
                        this.logger.printLogs('i', 'Appointment deleted successfully', res);
                        this.loadAppointments();
                        this.showErrorAlert('Successful', 'Appointment deleted successfully', false, 'success');
                    },
                    error: (err) => {
                        this.logger.printLogs('e', 'Failed to delete appointment', err);
                        this.showErrorAlert('Deleting Failed', err, false, 'error');
                    }
                });
            }
        });
    }

    resendVerification(appointment: any) {
        this.confirmationService.confirm({
            message: `Are you sure you really want to resend appointment confirmation to <b>${appointment.coordinator}</b> with the appointment details below: <br>
            <b>${appointment.hospitalName} (${appointment.sectionName}) <br> 
            ${this.dateFormat(appointment.dateSlot)} - ${appointment.shiftName} shift </b>?`,
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            rejectLabel: 'Cancel',
            acceptLabel: "Yes! I'm Sure",
            acceptButtonStyleClass: 'p-button-success',
            rejectButtonStyleClass: 'p-button-outlined p-button-secondary',
            accept: () => {
                this.logger.printLogs('i', `Resending Email verification to ${appointment.coordinatorID}`, appointment);

                this.api.resendVerification(appointment.coordinatorID).subscribe({
                    next: (res) => {
                        this.logger.printLogs('i', 'Verification sent', res);
                        this.loadAppointments();
                        this.showErrorAlert('Confirmation Email Sent', 'Confirmation Successfully sent!', false, 'success');
                    },
                    error: (err) => {
                        this.logger.printLogs('e', 'Failed to resend confirmation', err);
                        this.showErrorAlert('Failed to resend confirmation', err, false, 'error');
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Failed to resend confirmation',
                            life: 3000
                        });
                    }
                });
            }
        });
    }

    show(appointment: any) {
        this.selectedAppointment = appointment;
        this.logger.printLogs('i', 'Show Appointment', appointment);
        this.displayDialog = true;
    }

    showTerms() {
        this.confirmationService.confirm({
            header: 'Terms & Conditions',
            message: `
            <div class="flex flex-col space-y-2 p-4 border rounded-lg bg-gray-50">
                <p class="text-gray-700 font-semibold text-xl">Terms and Conditions</p>
                <p class="text-gray-600 text-lg">By confirming this appointment, you agree that:</p>
                <ul class="list-decimal list-inside text-gray-600 text-lg space-y-2">
                    <li>All information provided is accurate and complete.</li>
                    <li>You are responsible for attending on time. Changes or cancellations must be made at least 24 hours before.</li>
                    <li>You will follow all instructions and school policies during the appointment.</li>
                    <li>Your personal information will only be used for processing this appointment.</li>
                    <li>The school is not liable for any delays or technical issues.</li>
                </ul>
            </div>

        `,
            // icon: 'pi pi-info-circle',
            acceptVisible: false, // Hide the accept button, just display
            rejectVisible: true,  // Optional: allow closing
            closable: true,
            dismissableMask: true,
            rejectLabel: 'Close'
        });
    }

    printAll() {
        this.dialogSchool = null;
        this.dialogDateRange = [];
        this.pdfPreviewSrc = null;
        this.isLoading = false;

        this.printDialogVisible = true;
    }

    confirmPrintSchedule() {
        const start = this.dialogDateRange[0];
        const end = this.dialogDateRange[1];

        if (!start || !end) {
            this.messageService.add({
                severity: 'warn',
                summary: 'No Selected Date Range',
                detail: 'Please select date first!',
                life: 3000
            });
            return;
        }

        const dateFrom = start.toISOString().split('T')[0];
        const dateTo = end.toISOString().split('T')[0];

        this.filteredAppointments = this.appointments().filter((s: any) => {
            return s.dateSlot >= dateFrom && s.dateSlot <= dateTo;
        });

        // Optional school filter
        if (this.dialogSchool) {
            this.filteredAppointments = this.filteredAppointments.filter(a => a.schoolID === this.dialogSchool);
        }

        this.logger.printLogs('i', `Filtered Appointments`, this.filteredAppointments);

        this.pdfService.generateAppointmentReport(
            `LIST OF APPOINTMENTS (${this.dateFormat(dateFrom)} - ${this.dateFormat(dateTo)})`,
            this.filteredAppointments,
            start.toString(),
            end.toString(),
            true
        );

        // this.printDialogVisible = false;
    }

    previewSchedule() {
        const start = this.dialogDateRange[0];
        const end = this.dialogDateRange[1];
        this.isLoading = true;

        setTimeout(() => {

            if (!start || !end) {
                this.isLoading = false;   // stop spinner
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Missing Date Range',
                    detail: 'Please select a start and end date.'
                });
                return;
            }

            const dateFrom = start.toISOString().split('T')[0];
            const dateTo = end.toISOString().split('T')[0];

            this.filteredAppointments = this.appointments().filter(
                (s: any) => s.dateSlot >= dateFrom && s.dateSlot <= dateTo
            );

            if (this.dialogSchool) {
                this.filteredAppointments = this.filteredAppointments.filter(
                    s => s.schoolID === this.dialogSchool
                );
            }

            this.pdfService.generateAppointmentReportPreview(
                `LIST OF APPOINTMENTS (${this.dateFormat(dateFrom)} - ${this.dateFormat(dateTo)})`,
                this.filteredAppointments,
                start.toString(),
                end.toString()
            ).then(dataUrl => {
                this.pdfPreviewSrc = dataUrl; // bind to iframe in dialog
            });

            this.isLoading = false;
        }, 600);
    }

    closeDialog() {
        this.printDialogVisible = false;
        this.displayDialog = false;
        this.selectedAppointment = null;
        this.pdfPreviewSrc = null; // clear preview when closing
    }

    downloadPdf() {
        const start = this.dialogDateRange[0];
        const end = this.dialogDateRange[1];

        const dateFrom = start.toISOString().split('T')[0];
        const dateTo = end.toISOString().split('T')[0];

        this.filteredAppointments = this.appointments().filter(
            (a: any) => a.dateSlot >= dateFrom && a.dateSlot <= dateTo
        );

        if (this.dialogSchool) {
            this.filteredAppointments = this.filteredAppointments.filter(
                a => a.schoolID === this.dialogSchool
            );
        }

        // Use pdfMake directly for download
        this.pdfService.generateAppointmentReportPreview(
            `LIST OF APPOINTMENTS (${this.dateFormat(dateFrom)} - ${this.dateFormat(dateTo)})`,
            this.filteredAppointments,
            start.toString(),
            end.toString()
        ).then(() => {
            // Optionally, you can call pdfMake.createPdf(docDefinition).download() inside the service
            // or add a separate method in your pdfService specifically for downloading
            this.pdfService.downloadAppointmentReport(
                `LIST_OF_APPOINTMENTS_${dateFrom}_to_${dateTo}`,
                this.filteredAppointments,
                start.toString(),
                end.toString()
            );
        });
    }

    print() {
        const start = this.dialogDateRange[0];
        const end = this.dialogDateRange[1];

        const dateFrom = start.toISOString().split('T')[0];
        const dateTo = end.toISOString().split('T')[0];

        this.filteredAppointments = this.appointments().filter(
            (a: any) => a.dateSlot >= dateFrom && a.dateSlot <= dateTo
        );

        if (this.dialogSchool) {
            this.filteredAppointments = this.filteredAppointments.filter(
                a => a.schoolID === this.dialogSchool
            );
        }

        this.pdfService.printAppointmentReport(this.filteredAppointments,
            start.toString(),
            end.toString())
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
                this.displayDialog = dialogOpen;
            }
        });
    }
}
