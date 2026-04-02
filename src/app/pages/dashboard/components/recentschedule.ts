import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { RippleModule } from 'primeng/ripple';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { Product, ProductService } from '../../service/product.service';
import { StoreService } from '@/services/store.service';
import { ApiService } from '@/services/api.service';
import { take } from 'rxjs';
import { TagModule } from 'primeng/tag';
import { ChartModule } from 'primeng/chart';
import { Popover, PopoverModule } from 'primeng/popover';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { LogsService } from '@/services/logs.service';
import { DialogModule } from 'primeng/dialog';
import { abbreviateName } from '@/pages/post/post.schedule.utils';
import { SkeletonModule } from 'primeng/skeleton';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';

@Component({
    standalone: true,
    selector: 'app-recent-analytics-widget',
    imports: [CommonModule, FormsModule, TableModule, ButtonModule, SelectModule, RippleModule, TagModule, ChartModule, PopoverModule, ToastModule, DialogModule, SkeletonModule],
    templateUrl: './recentschedule.component.html',
    styleUrl: './css/dashboard.css',
    providers: [MessageService]
})
export class RecentSchedule implements OnInit, OnChanges {

    @Input() slots: any[] = [];
    @Input() recentSchedules: any[] = [];
    @Input() tokenPayload!: any;


    public loading: boolean = true;

    @Output() yearChange = new EventEmitter<number>(); // 🔥 IMPORTANT
    years: { label: string; value: number }[] = [];
    currentYear: number = 0;

    barData: any;
    barOptions: any;



    barHospitalStackData: any;
    barHospitalStackOptions: any;

    barSectionData: any;
    barSectionOptions: any;

    barSchoolStackData: any;
    barSchoolStackOptions: any;


    linearHospitalData: any;
    linearHospitalOption: any;


    linearSchoolData: any;
    linearSchoolOptions: any;

    displayEventDialog = false;


    pieSchoolData: any;
    pieSchoolOptions: any;

    pieHospitalData: any;
    pieHospitalOptions: any;


    selectedEvent!: any;


    constructor(
        private api: ApiService,
        private store: StoreService,
        private messageService: MessageService,
        private logger: LogsService
    ) {

    }

    ngOnInit() {
        // this.productService.getProductsSmall().then((data) => (this.products = data));
        this.initChart();
        this.initYears();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['slots'] && this.slots) {
            this.analytics()
        }
    }

    initYears() {
        const currentYear = new Date().getFullYear();

        this.years = Array.from({ length: 5 }, (_, i) => {
            const year = currentYear - i;
            return {
                label: year.toString(),
                value: year
            };
        });

        this.currentYear = currentYear; // default selected
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

    analytics() {
        this.buildStackedByHospitalShift();
        this.buildChartFromSlots();
        this.buildBarBySectionShift();
        this.buildLinearBySchoolShift();
        this.buildLinearByHospitalShift();
        this.buildPieBySchool();
        this.buildPieByHospital();
        this.loading = false;
    }

    onYearChange(event: any) {
        
        this.loading = true;
        const year = event.value;
        this.currentYear = year;

        this.logger.printLogs('i', ' Year', year);
        this.logger.printLogs('i', ' Selected Year', this.currentYear);
        this.yearChange.emit(year);
    }
    

    buildChartFromSlots() {

        // Map to store month name => shift counts
        const monthMap: Record<string, { morning: number; afternoon: number; evening: number }> = {};

        this.slots.forEach(slot => {
            if (!slot.dateSlot) return;

            const date = new Date(slot.dateSlot);
            const monthName = date.toLocaleString('default', { month: 'long' }); // "January", "February", etc.

            if (!monthMap[monthName]) {
                monthMap[monthName] = { morning: 0, afternoon: 0, evening: 0 };
            }

            const shift = (slot.shiftName || '').toLowerCase();

            if (shift.includes('morning')) {
                monthMap[monthName].morning++;
            } else if (shift.includes('afternoon')) {
                monthMap[monthName].afternoon++;
            } else if (shift.includes('evening')) {
                monthMap[monthName].evening++;
            }
        });

        // Convert map to arrays for chart
        const labels = Object.keys(monthMap);
        const morningData = labels.map(m => monthMap[m].morning);
        const afternoonData = labels.map(m => monthMap[m].afternoon);
        const eveningData = labels.map(m => monthMap[m].evening);

        this.initChart({ labels, morningData, afternoonData, eveningData });
    }

    initChart(data?: { labels: string[], morningData: number[], afternoonData: number[], eveningData: number[] }) {

        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

        this.barData = {
            labels: data?.labels || [],
            datasets: [
                {
                    label: 'Morning',
                    backgroundColor: '#42A5F5',
                    borderColor: '#1E88E5',
                    data: data?.morningData || [],
                },
                {
                    label: 'Afternoon',
                    backgroundColor: '#9CCC65',
                    borderColor: '#7CB342',
                    data: data?.afternoonData || [],
                },
                {
                    label: 'Evening',
                    backgroundColor: '#f73b7d',
                    borderColor: '#a42853',
                    data: data?.eveningData || [],
                }
            ]
        };

        this.barOptions = {
            maintainAspectRatio: false,
            aspectRatio: 0.8,
            plugins: {
                legend: { labels: { color: textColor } }
            },
            scales: {
                x: {
                    ticks: { color: textColorSecondary, font: { weight: 500 } },
                    grid: { display: false, drawBorder: false }
                },
                y: {
                    beginAtZero: true,
                    ticks: { color: textColorSecondary },
                    grid: { color: surfaceBorder, drawBorder: false }
                }
            }
        };
    }

    buildStackedByHospitalShift() {

        const hospitalMap: Record<string, {
            morning: number,
            afternoon: number,
            evening: number
        }> = {};

        this.slots.forEach(slot => {
            if (!slot.hospitalName) return;

            const hospital = slot.hospitalName;

            if (!hospitalMap[hospital]) {
                hospitalMap[hospital] = {
                    morning: 0,
                    afternoon: 0,
                    evening: 0
                };
            }

            const shift = (slot.shiftName || '').toLowerCase();

            if (shift.includes('morning')) {
                hospitalMap[hospital].morning++;
            } else if (shift.includes('afternoon')) {
                hospitalMap[hospital].afternoon++;
            } else if (shift.includes('evening')) {
                hospitalMap[hospital].evening++;
            }
        });

        const labels = Object.keys(hospitalMap);

        const morningData = labels.map(h => hospitalMap[h].morning);
        const afternoonData = labels.map(h => hospitalMap[h].afternoon);
        const eveningData = labels.map(h => hospitalMap[h].evening);

        this.initStackedChart({ labels, morningData, afternoonData, eveningData });
    }

    initStackedChart(data: {
        labels: string[],
        morningData: number[],
        afternoonData: number[],
        eveningData: number[]
    }) {

        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

        this.barHospitalStackData = {
            labels: data.labels,
            datasets: [
                {
                    label: 'Morning',
                    backgroundColor: '#42A5F5',
                    data: data.morningData,
                    borderRadius: 6
                },
                {
                    label: 'Afternoon',
                    backgroundColor: '#9CCC65',
                    data: data.afternoonData,
                    borderRadius: 6
                },
                {
                    label: 'Evening',
                    backgroundColor: '#f73b7d',
                    data: data.eveningData,
                    borderRadius: 6
                }
            ]
        };

        this.barHospitalStackOptions = {
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: textColor }
                }
            },
            scales: {
                x: {
                    stacked: true, // 🔥 IMPORTANT
                    ticks: { color: textColorSecondary },
                    grid: { display: false }
                },
                y: {
                    stacked: true, // 🔥 IMPORTANT
                    beginAtZero: true,
                    ticks: { color: textColorSecondary },
                    grid: { color: surfaceBorder }
                }
            }
        };
    }

    buildLinearByHospitalShift() {

        // Map: hospital => shift counts
        const hospitalMap: Record<string, {
            hospitalName: string,
            morning: number,
            afternoon: number,
            evening: number
        }> = {};

        this.slots.forEach(slot => {
            if (!slot.hospitalID) return;

            const hospitalID = slot.hospitalID;

            if (!hospitalMap[hospitalID]) {
                hospitalMap[hospitalID] = {
                    hospitalName: slot.hospitalName || hospitalID,
                    morning: 0,
                    afternoon: 0,
                    evening: 0
                };
            }

            const shift = (slot.shiftName || '').toLowerCase();

            if (shift.includes('morning')) {
                hospitalMap[hospitalID].morning++;
            }
            else if (shift.includes('afternoon')) {
                hospitalMap[hospitalID].afternoon++;
            }
            else if (shift.includes('evening')) {
                hospitalMap[hospitalID].evening++;
            }
        });

        // Convert to chart arrays
        const labels = Object.values(hospitalMap).map(h => h.hospitalName);
        const morningData = Object.values(hospitalMap).map(h => h.morning);
        const afternoonData = Object.values(hospitalMap).map(h => h.afternoon);
        const eveningData = Object.values(hospitalMap).map(h => h.evening);

        this.initLinearHospitalChart({ labels, morningData, afternoonData, eveningData });
    }

    initLinearHospitalChart(data?: {
        labels: string[],
        morningData: number[],
        afternoonData: number[],
        eveningData: number[]
    }) {

        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

        this.linearHospitalData = {
            labels: data?.labels || [],
            datasets: [
                {
                    label: 'Morning',
                    data: data?.morningData || [],
                    fill: false,
                    borderColor: '#42A5F5',
                    tension: 0.4
                },
                {
                    label: 'Afternoon',
                    data: data?.afternoonData || [],
                    fill: false,
                    borderColor: '#9CCC65',
                    tension: 0.4
                },
                {
                    label: 'Evening',
                    data: data?.eveningData || [],
                    fill: false,
                    borderColor: '#f73b7d',
                    tension: 0.4
                }
            ]
        };



        this.linearHospitalOption = {
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: textColor } }
            },
            scales: {
                x: {
                    ticks: { color: textColorSecondary },
                    grid: { display: false }
                },
                y: {
                    beginAtZero: true,
                    ticks: { color: textColorSecondary },
                    grid: { color: surfaceBorder }
                }
            }
        };
    }

    buildLinearBySchoolShift() {

        const schoolMap: Record<string, {
            morning: number,
            afternoon: number,
            evening: number
        }> = {};

        this.slots.forEach(slot => {
            if (!slot.schoolName) return;

            const school = abbreviateName(slot.schoolName);

            if (!schoolMap[school]) {
                schoolMap[school] = {
                    morning: 0,
                    afternoon: 0,
                    evening: 0
                };
            }

            const shift = (slot.shiftName || '').toLowerCase();

            if (shift.includes('morning')) {
                schoolMap[school].morning++;
            }
            else if (shift.includes('afternoon')) {
                schoolMap[school].afternoon++;
            }
            else if (shift.includes('evening')) {
                schoolMap[school].evening++;
            }
        });

        const labels = Object.keys(schoolMap);

        const morningData = labels.map(s => schoolMap[s].morning);
        const afternoonData = labels.map(s => schoolMap[s].afternoon);
        const eveningData = labels.map(s => schoolMap[s].evening);

        this.initLinearSchoolChart({ labels, morningData, afternoonData, eveningData });
    }

    initLinearSchoolChart(data: {
        labels: string[],
        morningData: number[],
        afternoonData: number[],
        eveningData: number[]
    }) {

        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');


        this.linearSchoolData = {
            labels: data?.labels || [],
            datasets: [
                {
                    label: 'Morning',
                    data: data?.morningData || [],
                    fill: false,
                    borderColor: '#42A5F5',
                    tension: 0.4
                },
                {
                    label: 'Afternoon',
                    data: data?.afternoonData || [],
                    fill: false,
                    borderColor: '#9CCC65',
                    tension: 0.4
                },
                {
                    label: 'Evening',
                    data: data?.eveningData || [],
                    fill: false,
                    borderColor: '#f73b7d',
                    tension: 0.4
                }
            ]
        };




        this.linearSchoolOptions = {
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: textColor } }
            },
            scales: {
                x: {
                    ticks: { color: textColorSecondary },
                    grid: { display: false }
                },
                y: {
                    beginAtZero: true,
                    ticks: { color: textColorSecondary },
                    grid: { color: surfaceBorder }
                }
            }
        };
    }

    buildBarBySectionShift() {

        const sectionMap: Record<string, {
            morning: number,
            afternoon: number,
            evening: number
        }> = {};

        this.slots.forEach(slot => {
            if (!slot.sectionName) return;

            const section = slot.sectionName;

            if (!sectionMap[section]) {
                sectionMap[section] = {
                    morning: 0,
                    afternoon: 0,
                    evening: 0
                };
            }

            const shift = (slot.shiftName || '').toLowerCase();

            if (shift.includes('morning')) {
                sectionMap[section].morning++;
            }
            else if (shift.includes('afternoon')) {
                sectionMap[section].afternoon++;
            }
            else if (shift.includes('evening')) {
                sectionMap[section].evening++;
            }
        });

        const labels = Object.keys(sectionMap);

        const morningData = labels.map(s => sectionMap[s].morning);
        const afternoonData = labels.map(s => sectionMap[s].afternoon);
        const eveningData = labels.map(s => sectionMap[s].evening);

        this.initSectionChart({ labels, morningData, afternoonData, eveningData });
    }

    initSectionChart(data: {
        labels: string[],
        morningData: number[],
        afternoonData: number[],
        eveningData: number[]
    }) {

        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

        this.barSectionData = {
            labels: data.labels,
            datasets: [
                {
                    label: 'Morning',
                    backgroundColor: '#42A5F5',
                    data: data.morningData
                },
                {
                    label: 'Afternoon',
                    backgroundColor: '#9CCC65',
                    data: data.afternoonData
                },
                {
                    label: 'Evening',
                    backgroundColor: '#f73b7d',
                    data: data.eveningData
                }
            ]
        };

        this.barSectionOptions = {
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: textColor } }
            },
            scales: {
                x: {
                    ticks: { color: textColorSecondary },
                    grid: { display: false }
                },
                y: {
                    beginAtZero: true,
                    ticks: { color: textColorSecondary },
                    grid: { color: surfaceBorder }
                }
            }
        };
    }


    // PIE CHARTS
    buildPieBySchool() {

        const mapTrend: Record<string, { name: string; count: number }> = {};

        this.slots.forEach(slot => {

            if (this.isAdmin() || this.isSupervisor()) {
                if (!slot.schoolID) return;

                if (!mapTrend[slot.schoolID]) {
                    mapTrend[slot.schoolID] = {
                        name: slot.schoolName || 'Unknown School',
                        count: 0
                    };
                }
                mapTrend[slot.schoolID].count++;
            } else {
                if (!slot.hospitalID) return;

                if (!mapTrend[slot.hospitalID]) {
                    mapTrend[slot.hospitalID] = {
                        name: slot.hospitalName || 'Unknown Hospital',
                        count: 0
                    };
                }
                mapTrend[slot.hospitalID].count++;
            }

        });

        const labels = Object.values(mapTrend).map(h => h.name);
        const data = Object.values(mapTrend).map(h => h.count);

        this.initPieSchoolChart(labels, data);
    }

    initPieSchoolChart(labels: string[], data: number[]) {

        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');

        const colors = [
            documentStyle.getPropertyValue('--p-indigo-500'),
            documentStyle.getPropertyValue('--p-purple-500'),
            documentStyle.getPropertyValue('--p-teal-500'),
            documentStyle.getPropertyValue('--p-orange-500'),
            documentStyle.getPropertyValue('--p-cyan-500'),
            documentStyle.getPropertyValue('--p-pink-500'),
            documentStyle.getPropertyValue('--p-green-500')
        ];

        const hoverColors = [
            documentStyle.getPropertyValue('--p-indigo-400'),
            documentStyle.getPropertyValue('--p-purple-400'),
            documentStyle.getPropertyValue('--p-teal-400'),
            documentStyle.getPropertyValue('--p-orange-400'),
            documentStyle.getPropertyValue('--p-cyan-400'),
            documentStyle.getPropertyValue('--p-pink-400'),
            documentStyle.getPropertyValue('--p-green-400')
        ];

        this.pieSchoolData = {
            labels,
            datasets: [
                {
                    data,
                    backgroundColor: colors.slice(0, labels.length),
                    hoverBackgroundColor: hoverColors.slice(0, labels.length)
                }
            ]
        };

        this.pieSchoolOptions = {
            plugins: {
                legend: {
                    labels: {
                        usePointStyle: true,
                        color: textColor
                    }
                }
            }
        };
    }

    buildPieByHospital() {

        const mapTrend: Record<string, { name: string; count: number }> = {};

        this.slots.forEach(slot => {

            if (!slot.sectionID) return;

            if (!mapTrend[slot.sectionID]) {
                mapTrend[slot.sectionID] = {
                    name: slot.sectionName || 'Unknown Section',
                    count: 0
                };
            }
            mapTrend[slot.sectionID].count++;


        });

        const labels = Object.values(mapTrend).map(h => h.name);
        const data = Object.values(mapTrend).map(h => h.count);

        this.initPieHospitalChart(labels, data);
    }

    initPieHospitalChart(labels: string[], data: number[]) {

        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');

        const colors = [
            documentStyle.getPropertyValue('--p-indigo-500'),
            documentStyle.getPropertyValue('--p-purple-500'),
            documentStyle.getPropertyValue('--p-teal-500'),
            documentStyle.getPropertyValue('--p-orange-500'),
            documentStyle.getPropertyValue('--p-cyan-500'),
            documentStyle.getPropertyValue('--p-pink-500'),
            documentStyle.getPropertyValue('--p-green-500')
        ];

        const hoverColors = [
            documentStyle.getPropertyValue('--p-indigo-400'),
            documentStyle.getPropertyValue('--p-purple-400'),
            documentStyle.getPropertyValue('--p-teal-400'),
            documentStyle.getPropertyValue('--p-orange-400'),
            documentStyle.getPropertyValue('--p-cyan-400'),
            documentStyle.getPropertyValue('--p-pink-400'),
            documentStyle.getPropertyValue('--p-green-400')
        ];

        this.pieHospitalData = {
            labels,
            datasets: [
                {
                    data,
                    backgroundColor: colors.slice(0, labels.length),
                    hoverBackgroundColor: hoverColors.slice(0, labels.length)
                }
            ]
        };

        this.pieHospitalOptions = {
            plugins: {
                legend: {
                    labels: {
                        usePointStyle: true,
                        color: textColor
                    }
                }
            }
        };
    }

    get cardHeightClass(): string {
        switch (this.tokenPayload?.role) {
            case 'UGR0001':
                return 'h-[740px]';
            case 'UGR0002':
                return 'h-[680px]';
            case 'UGR0004':
                return 'h-[620px]';
            default:
                return 'h-auto';
        }
    }

    getStatus(status: any, type: string | undefined = 'value'): any {
        // this.logger.printLogs('i', 'Status: ', status)
        switch (status) {
            case 0:
                return (type == 'value' ? 'Unposted' : 'contrast')
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

    formatTime(time: string): Date {
        const today = new Date();
        const [hours, minutes, seconds] = time.split(':').map(Number);

        today.setHours(hours, minutes, seconds || 0);
        return today;
    }

    toggleDataTable(op: Popover, event: any) {
        op.toggle(event);
    }


    onScheduleSelect(op: Popover, event: any) {
        op.hide();
        this.logger.printLogs('i', 'Selected Schedule: ', event.data);
        this.messageService.add({ severity: 'info', summary: 'Schedule Selected', detail: event?.data.slotID, life: 3000 });

        this.displayEventDialog = true;
    }

    onCloseDetails() {
        this.selectedEvent = null;
        this.displayEventDialog = false;
    }
}
