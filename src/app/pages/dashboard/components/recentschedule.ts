import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
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

@Component({
    standalone: true,
    selector: 'app-recent-analytics-widget',
    imports: [CommonModule, TableModule, ButtonModule, RippleModule, TagModule, ChartModule, PopoverModule, ToastModule, DialogModule],
    templateUrl: './recentschedule.component.html',
    styleUrl: './css/dashboard.css',
    providers: [MessageService]
})
export class RecentSchedule implements OnInit, OnChanges {

    @Input() slots: any[] = [];
    @Input() recentSchedules: any[] = [];
    @Input() tokenPayload!: any;
    barData: any;
    barOptions: any;
    pieData: any;
    pieOptions: any;
    currentYear: number = 0;
    displayEventDialog = false;


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

        this.currentYear = new Date().getFullYear()
        this.initChart();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['slots'] && this.slots) {
            this.buildChartFromSlots();
            this.buildPieChartFromSlots();
        }
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


    buildPieChartFromSlots() {

        if (!this.slots?.length) return;

        const mapTrend: Record<string, { name: string; count: number }> = {};

        this.slots.forEach(slot => {

            if (this.isAdmin()  || this.isSupervisor() ) {
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

        this.initPieChart(labels, data);
    }

    initPieChart(labels: string[], data: number[]) {

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

        this.pieData = {
            labels,
            datasets: [
                {
                    data,
                    backgroundColor: colors.slice(0, labels.length),
                    hoverBackgroundColor: hoverColors.slice(0, labels.length)
                }
            ]
        };

        this.pieOptions = {
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
