import { Component, Input, OnInit } from '@angular/core';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProductService } from '../service/product.service';
import { AppMenuitem } from '@/layout/component/app.menuitem';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { PdfService } from '@/services/pdf.service';


@Component({
    selector: 'set-users-sidebar',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        DialogModule,
        AppMenuitem,
        ReactiveFormsModule,
        FormsModule,
    ],
    templateUrl: './set.user.sidebar.component.html',
    providers: [MessageService, ProductService, ConfirmationService]
})
export class UsersProperties implements OnInit {

    subcomponent: MenuItem[] = [];
    properties: MenuItem[] = [];
    submitted: boolean = false;
    assignDialog: boolean = false;

    @Input() users: any[] = [];

    constructor(private pdfService: PdfService) {

    }

    ngOnInit(): void {
        this.subcomponent = [
            {
                items: [
                    { label: 'Roles', icon: 'fas fa-table-columns', routerLink: ['/dashboard/masterlist/sections'] },
                    { label: 'Print All', icon: 'fas fa-print', command: () => this.printAll() },
                ]
            }
        ];
        this.properties = [
            {
                items: [
                    // { label: 'Assign Section', icon: 'fas fa-table-columns', routerLink: ['/dashboard/masterlist/sections'] },
                    // { label: 'Set Allocation', icon: 'fas fa-table-columns', routerLink: ['/dashboard/masterlist/sections'] },
                ]
            }
        ];
    }


    hideDialog() {
        this.assignDialog = false;
        this.submitted = false;
    }
    openAssignDialog() {
        this.assignDialog = true;
    }

    save() {
        this.submitted = true;
        this.assignDialog = false;
    }


    printAll() {
        if (!this.users || this.users.length === 0) {
            console.warn('No users found to print');
            return;
        }

        this.pdfService.generateUserReport(this.users, 'LIST OF USERS');
    }

}