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

    <div class="card h-[740px]">
        <div class="font-bold text-primary text-xl mb-6">
            Recent Schedule
        </div>

        <p-table 
            *ngIf="slots?.length"
            [value]="slots"
            [rows]="10"
            [paginator]="false"
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
        
        <div *ngIf="!slots?.length" class="text-center p-4 text-muted-color">
            No recent schedules found.
        </div>
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
