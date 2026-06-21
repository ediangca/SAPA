import { Component, OnInit } from '@angular/core';
import { FloatingUsers } from "./app.floatingusers.onlinestatus";
import { StoreService } from '@/services/store.service';
import { CommonModule } from '@angular/common';
import { LogsService } from '@/services/logs.service';

@Component({
    standalone: true,
    imports: [
        CommonModule,
        FloatingUsers
    ],
    selector: 'app-footer',
    template: `
    <div class="layout-footer border-t border-gray-200 dark:border-gray-800 p-4 w-full">

    <div
        class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 text-sm">

        <!-- INFO -->
        <div class="text-gray-500 text-center lg:text-left">
            © 2024 School Affiliation Program.
            All rights reserved.
        </div>

        <!-- NOTE -->
        <div
            class="text-center lg:text-left text-red-500 font-medium max-w-3xl leading-relaxed">

            If you encounter issues displaying data, please reload the page by pressing

            <span class="text-primary font-bold whitespace-nowrap">
                CTRL + Shift + R
            </span>

            or contact

            <a
                href="mailto:peedo.admin@davaodelnorte.gov.ph"
                class="text-primary font-semibold hover:underline">
                SAPA Support
            </a>

            for further assistance.

        </div>

        <!-- DEVELOPER -->
        <div
            class="text-gray-500 text-center lg:text-right whitespace-normal lg:whitespace-nowrap">

            SAP Application Developed by

            <a
                href="https://www.linkedin.com/in/ediangca22/"
                target="_blank"
                rel="noopener noreferrer"
                class="text-primary font-bold hover:underline">
                Edbiraanhgicma
            </a>

        </div>

    </div>

</div>

<!-- @if(isAdmin()){
    <app-floating-users />
} -->


`,
})
export class AppFooter implements OnInit {


    private user: any = null;

    constructor(private store: StoreService, private logger: LogsService) {


    }

    ngOnInit() {
        // this.user = this.store.getCurrentUser();
        this.logger.printLogs('i', 'Footer current user', this.user);
    }

    // isAdmin() {
    //     return this.user?.roleID === 'UGR0001' || this.user?.roleID === 'UGR0002';
    // }



}
