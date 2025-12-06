import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { LayoutService } from '../service/layout.service';
import { MenubarModule } from 'primeng/menubar';
import { AppFloatingConfigurator } from './app.floatingconfigurator';
import { TooltipModule } from 'primeng/tooltip';
import { MenuModule } from 'primeng/menu';
import { BadgeModule } from 'primeng/badge';
import { AuthService } from '@/services/auth.service';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ButtonModule } from 'primeng/button';
import { combineLatest, filter, take } from 'rxjs';
import { StoreService } from '@/services/store.service';
import { LogsService } from '@/services/logs.service';
import { SkeletonModule } from 'primeng/skeleton';
@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [RouterModule,
        ButtonModule,
        CommonModule,
        StyleClassModule,
        MenubarModule,
        AppFloatingConfigurator,
        TooltipModule,
        BadgeModule,
        ProgressSpinnerModule,
        MenuModule,
        SkeletonModule
    ],
    templateUrl: './topbar.component.html',
    styleUrl: './css/topbar.component.css'
})
export class AppTopbar implements OnInit {

    nestedMenuItems: any[] = [];

    user: any | null = null


    constructor(public layoutService: LayoutService,
        public router: Router, private authService: AuthService,
        private store: StoreService, private logger: LogsService) {
        this.buildMenuItems();
    }
    ngOnInit() {

        this.store.getUser()
            .pipe(
                filter(user => !!user),
                take(1)
            )
            .subscribe(user => {
                if (!!user) {
                    this.user = user;
                    this.logger.printLogs('i', 'Get User from storessss :', user);
                }
            });
    }

    toggleDarkMode() {
        this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
        this.buildMenuItems(); // refresh menu icons
    }

    buildMenuItems() {
        this.nestedMenuItems = [
            {
                label: 'Schedule',
                icon: 'pi pi-fw pi-calendar'
                // routerLink: ['']
            },
            {
                label: 'Inbox',
                icon: 'pi pi-fw pi-inbox'
                // routerLink: ['']
            },
            {
                label: 'Account',
                icon: 'pi pi-fw pi-user',
                items: [
                    {
                        label: 'Account',
                        icon: 'pi pi-fw pi-user',
                        routerLink: '/dashboard/settings/account'
                    },
                    {
                        label: 'Settings',
                        icon: 'pi pi-fw pi-cog',
                        routerLink: '/dashboard/settings'
                    },
                    // {
                    //     label: 'Mode',
                    //     icon: this.layoutService.isDarkTheme() ? 'pi pi-moon' : 'pi pi-sun',
                    //     command: () => this.toggleDarkMode(),
                    // },
                    {
                        label: 'SignOut',
                        icon: 'pi pi-fw pi-sign-out',
                        command: () => this.authService.logout()

                    },
                ]
            }
        ];
    }
}
