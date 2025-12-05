import { Component, Input, OnInit } from '@angular/core';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProductService } from '../service/product.service';
import { AppMenuitem } from '@/layout/component/app.menuitem';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { PdfService } from '@/services/pdf.service';
import { PanelMenuModule } from 'primeng/panelmenu';
import { LogsService } from '@/services/logs.service';
import { NgToastService } from 'ng-angular-popup';


@Component({
    selector: 'set-users-sidebar',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        DialogModule,
        // AppMenuitem,
        PanelMenuModule,
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
    @Input() roles: any[] = [];

    constructor(private pdfService: PdfService, private logger: LogsService,
        private toast: NgToastService
    ) {

    }

    ngOnInit(): void {
        this.subcomponent = [
            { label: 'Roles', icon: 'fas fa-table-columns', routerLink: ['/dashboard/settings/roles'] },
            { label: 'Print All', icon: 'fas fa-print', command: () => this.printAll() },

        ];
        // this.properties = [
        //     {
        //         items: [
        //             // { label: 'Assign Section', icon: 'fas fa-table-columns', routerLink: ['/dashboard/masterlist/sections'] },
        //             // { label: 'Set Allocation', icon: 'fas fa-table-columns', routerLink: ['/dashboard/masterlist/sections'] },
        //         ]
        //     }
        // ];
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
        if (this.users && this.users.length > 0) {
            this.logger.printLogs('e', 'Generate Report for Users', this.users)
            this.pdfService.generateUserReport(this.users, 'LIST OF USER');
            return;
        }
        if (this.roles && this.roles.length > 0) {
            this.logger.printLogs('e', 'Generate Report for Roles', this.roles)
            this.pdfService.generateRoleReport(this.roles, 'LIST OF ROLE');
            return;
        }
        this.toast.warning("No Record found to print.", 'No Record', 3000);
    }

}