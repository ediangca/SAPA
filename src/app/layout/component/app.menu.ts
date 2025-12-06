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
                    { id: "MOD0007", label: 'Appointments', icon: 'fas fa-calendar-check', class: 'rotated-icon', routerLink: ['/dashboard/masterlist/appointments'] },
                    // { label: 'Table', icon: 'pi pi-fw pi-table', routerLink: ['/dashboard/uikit/table'] },
                    // { label: 'List', icon: 'pi pi-fw pi-list', routerLink: ['/dashboard/uikit/list'] },
                    // { label: 'Tree', icon: 'pi pi-fw pi-share-alt', routerLink: ['/dashboard/uikit/tree'] },
                    // { label: 'Panel', icon: 'pi pi-fw pi-tablet', routerLink: ['/dashboard/uikit/panel'] },
                    // { label: 'Overlay', icon: 'pi pi-fw pi-clone', routerLink: ['/dashboard/uikit/overlay'] },
                    // { label: 'Media', icon: 'pi pi-fw pi-image', routerLink: ['/dashboard/uikit/media'] },
                    // { label: 'Menu', icon: 'pi pi-fw pi-bars', routerLink: ['/dashboard/uikit/menu'] },
                    // { label: 'Message', icon: 'pi pi-fw pi-comment', routerLink: ['/dashboard/uikit/message'] },
                    // { label: 'File', icon: 'pi pi-fw pi-file', routerLink: ['/dashboard/uikit/file'] },
                    // { label: 'Chart', icon: 'pi pi-fw pi-chart-bar', routerLink: ['/dashboard/uikit/charts'] },
                    // { label: 'Timeline', icon: 'pi pi-fw pi-calendar', routerLink: ['/dashboard/uikit/timeline'] },
                    // { label: 'Misc', icon: 'pi pi-fw pi-circle', routerLink: ['/dashboard/uikit/misc'] }
                ]
            },
            {
                label: 'Post',
                items: [
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

    validateModule() {
        this.modules = this.modules.map((module: any) => ({
            ...module,
            items: module.items.filter((item: any) => {
                // this.logger.printLogs('i', `Itemsssss:`, item);
                return this.store.isModuleActive(item.id);
            })
        }));

    }
}
