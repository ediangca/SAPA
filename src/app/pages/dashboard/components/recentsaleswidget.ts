import { Component, Input, OnInit } from '@angular/core';
import { RippleModule } from 'primeng/ripple';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { Product, ProductService } from '../../service/product.service';
import { StoreService } from '@/services/store.service';
import { ApiService } from '@/services/api.service';
import { take } from 'rxjs';
import { TagModule } from 'primeng/tag';

@Component({
    standalone: true,
    selector: 'app-recent-sales-widget',
    imports: [CommonModule, TableModule, ButtonModule, RippleModule, TagModule,],
    template: `
    <!-- <div class="card mb-8!">
        <div class="font-semibold text-xl mb-4">Recent Schedule</div>
        <p-table [value]="products" [paginator]="true" [rows]="5" responsiveLayout="scroll">
            <ng-template #header>
                <tr>
                    <th>Image</th>
                    <th pSortableColumn="name">Name <p-sortIcon field="name"></p-sortIcon></th>
                    <th pSortableColumn="price">Price <p-sortIcon field="price"></p-sortIcon></th>
                    <th>View</th>
                </tr>
            </ng-template>
            <ng-template #body let-product>
                <tr>
                    <td style="width: 15%; min-width: 5rem;">
                        <img src="https://primefaces.org/cdn/primevue/images/product/{{ product.image }}" class="shadow-lg" alt="{{ product.name }}" width="50" />
                    </td>
                    <td style="width: 35%; min-width: 7rem;">{{ product.name }}</td>
                    <td style="width: 35%; min-width: 8rem;">{{ product.price | currency: 'USD' }}</td>
                    <td style="width: 15%;">
                        <button pButton pRipple type="button" icon="pi pi-search" class="p-button p-component p-button-text p-button-icon-only"></button>
                    </td>
                </tr>
            </ng-template>
        </p-table>
    </div> -->
    
    
    <!-- <div class="card mb-8!">
        <div class="font-semibold text-xl mb-4">Recent Schedule</div>

        <p-table 
            [value]="slots"
            [paginator]="false"
            [rows]="10"
            responsiveLayout="scroll"
            *ngIf="slots?.length">

            <ng-template #header>
                <tr>
                    <th>Date</th>
                    <th>Shift</th>
                    <th>Status</th>
                    <th>View</th>
                </tr>
            </ng-template>

            <ng-template #body let-slot>
                <tr>
                    <td>{{ slot.dateSlot | date:'mediumDate' }}</td>
                    <td>{{ slot.shiftID }}</td>
                    <td>
                        <span 
                            class="px-2 py-1 rounded text-white text-sm"
                            [ngClass]="getStatus(slot.status)">
                            {{ getStatus(slot.status) }}
                        </span>
                    </td>
                    <td>
                        <button 
                            pButton 
                            pRipple 
                            type="button" 
                            icon="pi pi-search"
                            class="p-button-text">
                        </button>
                    </td>
                </tr>
            </ng-template>

        </p-table>

        <div *ngIf="!slots?.length" class="text-center p-4 text-muted-color">
            No recent schedules found.
        </div>
    </div> -->


    <div class="card h-[750px] mb-8!">
        <div class="font-bold text-primary text-xl mb-6">
            Recent Schedule
        </div>

        <p-table 
            [value]="slots"
            [rows]="10"
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
    </div>
    
    `,
    providers: [ProductService]
})
export class RecentSalesWidget implements OnInit {

    products!: Product[];
    @Input() slots: any[] = [];

    constructor(private productService: ProductService,
        private api: ApiService,
        private store: StoreService) {

    }

    ngOnInit() {
        // this.productService.getProductsSmall().then((data) => (this.products = data));

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
