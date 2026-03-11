import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { Router, RouterModule } from '@angular/router';
import { RippleModule } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';
import { AppFloatingConfigurator } from "@/layout/component/app.floatingconfigurator";
import { AuthService } from '@/services/auth.service';
import { LayoutService } from '@/layout/service/layout.service';
import { TooltipModule } from 'primeng/tooltip';
import { BadgeModule } from 'primeng/badge';
import { OverlayBadgeModule } from 'primeng/overlaybadge';

@Component({
    selector: 'navbar-widget',
    imports: [CommonModule, RouterModule, StyleClassModule, ButtonModule, RippleModule, AppFloatingConfigurator, TooltipModule, BadgeModule, OverlayBadgeModule],
    templateUrl: './navbar.component.html',
    styleUrl: './css/navbarwidget.component.css'
})
export class NavbarWidget {

    accountMenuOpen = false;
    nestedMenuItems: any[] = [];

    constructor(public layoutService: LayoutService, public router: Router, private authService: AuthService) {
        this.buildMenuItems();
    }

    get isLoggedIn(): boolean {
        return this.authService.isAuthenticated();
    }

    toggleAccountMenu() {
        this.accountMenuOpen = !this.accountMenuOpen;
    }

    closeAccountMenu() {
        this.accountMenuOpen = false;
    }

    toggleDarkMode() {
        this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
        this.buildMenuItems(); // refresh menu icons
    }

    buildMenuItems() {
        this.nestedMenuItems = [
            {
                label: 'Schedule',
                icon: 'pi pi-fw pi-calendar',
                routerLink: '/dashboard/post/schedules'
            },
            // {
            //     label: 'Inbox',
            //     icon: 'pi pi-fw pi-inbox'
            //     // routerLink: ['']
            // },
            {
                label: 'Account',
                icon: 'pi pi-fw pi-user',
                items: [
                    {
                        label: 'Dashboard',
                        icon: 'pi pi-fw pi-microsoft',
                        routerLink: '/dashboard'
                    },
                    {
                        label: 'Account',
                        icon: 'pi pi-fw pi-user',
                        routerLink: '/dashboard/settings/account'
                    },
                    {
                        label: 'Mode',
                        icon: this.layoutService.isDarkTheme() ? 'pi pi-moon' : 'pi pi-sun',
                        command: () => this.toggleDarkMode(),
                    },
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
