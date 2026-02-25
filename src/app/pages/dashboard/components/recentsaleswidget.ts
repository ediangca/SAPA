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

@Component({
    standalone: true,
    selector: 'app-recent-sales-widget',
    imports: [CommonModule, TableModule, ButtonModule, RippleModule, TagModule, ChartModule],
    template: `

    <div class="card" 
    [style.height]="tokenPayload?.role === 'UGR0001' || tokenPayload?.role === 'UGR0002' ? '740px' : '870px'"
    
    >
    
    <!-- [style.height]="tokenPayload?.role === 'UGR0001' || tokenPayload?.role === 'UGR0002' ? '740px' : '670px'" -->
    
        <div class="col-span-12 xl:col-span-6"
        
        >
        <div class="font-bold text-primary text-xl">
            Recent Schedule
        </div>

            <div class="card mb-0" *ngIf="slots?.length !== 0">
                <div class="font-semibold text-xl">{{currentYear}}</div>
                <p-chart type="bar" [data]="barData" [options]="barOptions"></p-chart>
            </div>
        </div>

        <p-table 
            *ngIf="recentSchedules?.length"
            [value]="recentSchedules"
            [showGridlines]="true"
            [rows]="10"
            [paginator]="false"
            paginatorDropdownAppendTo="body" 
            [scrollable]="true" scrollHeight="33vh"
            hei
            responsiveLayout="scroll">

            <ng-template #header>
                <tr>
                    <th>Date</th>
                    <th>School</th>
                    <th>Location</th>
                    <th>Status</th>
                </tr>
            </ng-template>

            <ng-template #body let-slot>
                <tr>
                    <td>{{ slot.dateSlot | date:'mediumDate' }}</td>
                    <td>{{ slot.schoolName }}</td>
                    <td>{{ slot.hospitalName}}({{slot.sectionName}}) - {{slot.shiftName}}</td>
                    <td>
                        <p-tag [value]="getStatus(slot.slotStatus,'value')"
                        [severity]="getStatus(slot.slotStatus,'severirty')" />
                    </td>
                </tr>
            </ng-template>

        </p-table>
        
        <div *ngIf="!recentSchedules?.length" class="text-center p-4 text-muted-color">
            No recent schedules found.
        </div>
    </div>
    
    `,
    providers: [ProductService]
})
export class RecentSalesWidget implements OnInit, OnChanges {

    products!: Product[];
    @Input() slots: any[] = [];
    @Input() recentSchedules: any[] = [];
    @Input() tokenPayload!: any;
    barData: any;
    barOptions: any;
    currentYear: number = 0;


    constructor(private productService: ProductService,
        private api: ApiService,
        private store: StoreService) {

    }

    ngOnInit() {
        // this.productService.getProductsSmall().then((data) => (this.products = data));
        
        this.currentYear =new Date().getFullYear()
        this.initChart();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['slots'] && this.slots) {
            this.buildChartFromSlots();
        }
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
}
