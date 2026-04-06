import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';
import { StoreService } from '@/services/store.service';
import { LogsService } from '@/services/logs.service';
import { combineLatest, filter, take } from 'rxjs';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu">
        <ng-container *ngFor="let item of modules; let i = index">
            <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
            <li *ngIf="item.separator" class="menu-separator"></li>
        </ng-container>
    </ul> `
})
export class AppMenu implements OnInit {

    modules: MenuItem[] = [];

    user: any = null;



    constructor(private store: StoreService,
        private logger: LogsService
    ) {
    }
    ngOnInit() {
        this.modules = [
            {
                label: 'Home',
                items: [{ id: "MOD0001", label: 'Dashboard', icon: 'fa-brands fa-windows', routerLink: ['/dashboard'] }]
            },
            {
                label: 'Master List',
                items: [
                    { id: "MOD0002", label: 'Hospitals', icon: 'fas fa-hospital', routerLink: ['/dashboard/masterlist/hospitals'] },
                    { id: "MOD0005", label: 'Schools', icon: 'fas fa-school', routerLink: ['/dashboard/masterlist/schools'] },
                    { id: "MOD0006", label: 'Students', icon: 'fas fa-users-line', class: 'rotated-icon', routerLink: ['/dashboard/masterlist/students'] },
                    { id: "MOD0017", label: 'Clinical Instructors', icon: 'fas fa-users', class: 'rotated-icon', routerLink: ['/dashboard/masterlist/clinical-instructors'] },
                    { id: "MOD0007", label: 'Appointments', icon: 'fas fa-calendar-check', class: 'rotated-icon', routerLink: ['/dashboard/masterlist/appointments'] },
                    ]
            },
            {
                label: 'Post',
                items: [
                    // { id: "MOD0008", label: 'Slot', icon: 'fas fa-calendar-days', routerLink: ['/dashboard/post/slots'] },
                    { id: "MOD0008", label: 'Schedule', icon: 'fas fa-calendar-days', routerLink: ['/dashboard/post/schedules'] },
                    { id: "MOD0009", label: 'Orientation', icon: 'fas fa-bullhorn', routerLink: ['/dashboard/post/orientations'] },
                    { id: "MOD0010", label: 'News & Updates', icon: 'fas fa-newspaper', routerLink: ['/dashboard/post/newsupdates'] },
                ]
            },
            {
                label: 'Settings',
                items: [
                    { id: "MOD0013", label: 'Users', icon: 'fas fa-users-gear', routerLink: ['/dashboard/settings/users'] },
                    { id: "MOD0015", label: 'Reports', icon: 'fas fa-chart-simple', routerLink: ['/dashboard/settings/reports'] },
                ]
            },

        ];



        this.store.getPrivileges()
            .pipe(
                filter(priv => priv.length > 0),
                take(1)
            )
            .subscribe(priv => {
                if (priv.length > 0) {
                    this.logger.printLogs('i', 'Privileges Loaded:', priv);
                    this.validateModule();
                }
            });

    }

    // validateModule() {
    //     this.modules = this.modules.map((module: any) => ({
    //         ...module,
    //         items: module.items.filter((item: any) => {
    //             // this.logger.printLogs('i', `Itemsssss:`, item);
    //             return this.store.isModuleActive(item.id);
    //         })
    //     }));
    // }

    validateModule() {
    this.modules = this.modules
        .map((module: any) => {
            // If module has no items (edge case), return as-is
            if (!module.items || module.items.length === 0) {
                return module;
            }

            const activeItems = module.items.filter((item: any) =>
                this.store.isModuleActive(item.id)
            );

            return {
                ...module,
                items: activeItems
            };
        })
        // 🔥 Remove group menu if no active items remain
        .filter((module: any) => module.items && module.items.length > 0);
}

}
