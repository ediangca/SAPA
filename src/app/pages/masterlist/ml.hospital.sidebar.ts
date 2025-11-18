import { Component, Input, OnInit } from '@angular/core';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProductService } from '../service/product.service';
import { AppMenuitem } from '@/layout/component/app.menuitem';
import { OrderListModule } from 'primeng/orderlist';
import { PickListModule } from 'primeng/picklist';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TableModule } from "primeng/table";
import { ApiService } from '@/services/api.service';
import { LogsService } from '@/services/logs.service';
import { PdfService } from '@/services/pdf.service';


@Component({
    selector: 'ml-hospital-properties',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        DialogModule,
        AppMenuitem,
        ReactiveFormsModule,
        FormsModule,
        OrderListModule,
        PickListModule,
        TableModule
    ],
    templateUrl: './ml.hospital.sidebar.component.html',
    providers: [MessageService, ProductService, ConfirmationService]
})
export class HospitalProperties implements OnInit {


    subcomponent: MenuItem[] = [];
    properties: MenuItem[] = [];

    submitted: boolean = false;
    assignDialog: boolean = false;

    sourceSections: any[] = [];
    assignSections: any[] = [];

    selectedHospital: any[] = [];

    @Input() hospitals: any[] = [];

    constructor(private api: ApiService, private logger: LogsService, 
            private pdfService: PdfService) {

    }

    ngOnInit(): void {
        this.subcomponent = [
            {
                items: [
                    { label: 'Sections', icon: 'fas fa-table-columns', routerLink: ['/dashboard/masterlist/sections'] },
                    { label: 'Print All', icon: 'fas fa-table-columns', command: () => this.printAll() },

                ]
            }
        ];
        this.properties = [
            {
                items: [
                    // { label: 'Assign Section', icon: 'fas fa-table-columns', command: () => this.openAssignDialog() },
                    // { label: 'Allocation', icon: 'fas fa-table-columns', routerLink: ['/dashboard/masterlist/sections'] },
                ]
            }
        ];

        // this.loadSections();
        // this.loadHospitals();
    }

    hideDialog() {
        this.assignDialog = false;
        this.submitted = false;
    }

    loadHospitals() {
        this.api.getHospitals().subscribe({
            next: (hospitals) => { this.hospitals = hospitals || []; this.logger.printLogs('i', 'Hospitals loaded', this.hospitals); },
            error: (err) => this.logger.printLogs('e', 'Failed to fetch hospitals', err)
        });
    }
    loadSections() {
        this.api.getSections().subscribe({
            next: (sections) => { this.sourceSections = sections || []; this.logger.printLogs('i', 'Sections loaded', this.sourceSections); },
            error: (err) => this.logger.printLogs('e', 'Failed to fetch sections', err)
        });
    }

    save() {
        this.submitted = true;
        this.assignDialog = false;
    }
    openAssignDialog() {
        this.assignDialog = true;
    }

    printAll() {
        if (!this.hospitals || this.hospitals.length === 0) {
            console.warn('No hospital found to print');
            return;
        }
        
        this.pdfService.generateHopitalsReport(this.hospitals);
    }

}


