import { Component, OnInit} from '@angular/core';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProductService } from '../service/product.service';
import { AppMenuitem } from '@/layout/component/app.menuitem';


@Component({
    selector: 'set-users-properties',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        AppMenuitem,
        ReactiveFormsModule,
        FormsModule,
    ],
    template: `
        <div class="card h-200">

            <div class="h-1/2">
            <h5 class="m-0">Sub Component</h5>

            <ul class="layout-menu">
                <ng-container *ngFor="let item of subcomponent; let i = index">
                    <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
                    <li *ngIf="item.separator" class="menu-separator"></li>
                </ng-container>
            </ul>
            </div>
            
            <div class="h-1/2">

            <h5 class="m-0">Properties</h5>

            <ul class="layout-menu">
                <ng-container *ngFor="let item of properties; let i = index">
                    <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
                    <li *ngIf="item.separator" class="menu-separator"></li>
                </ng-container>
            </ul>
            </div>


        </div>`,
    providers: [MessageService, ProductService, ConfirmationService]
})
export class UsersProperties implements OnInit {

    subcomponent: MenuItem[] = [];
    properties: MenuItem[] = [];

    constructor() {

    }

    ngOnInit(): void {
        this.subcomponent = [
            {
                items: [
                    { label: 'Sections', icon: 'fas fa-table-columns', routerLink: ['/dashboard/masterlist/sections'] },

                ]
            }
        ];
        this.properties = [
            {
                items: [
                    { label: 'Assign Section', icon: 'fas fa-table-columns', routerLink: ['/dashboard/masterlist/sections'] },
                    { label: 'Set Allocation', icon: 'fas fa-table-columns', routerLink: ['/dashboard/masterlist/sections'] },
                ]
            }
        ];
    }
}