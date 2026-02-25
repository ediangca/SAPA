import { Component } from '@angular/core';

@Component({
    standalone: true,
    selector: 'app-footer',
    template: `
    <div class="layout-footer bg-gray-50 border-t border-gray-200 p-4 w-full">
        <div class="flex flex-row justify-between items-start w-full text-sm">

            <!-- Note Section -->
            <div class="Note w-full md:w-auto">
            <span>If encounter any data showing issue, please try reloading the page by pressing
                <span class="text-primary font-bold"> (CTRL + Shift + R) </span>
                or contact
                <a href="mailto:peedo.admin@davaodelnorte.gov.ph" class="text-primary hover:underline">SAPA Support</a>
            </span>
            </div>

            <!-- Info Section -->
            <div class="Info w-full md:w-auto text-gray-600">
            © 2024 School Affiliation Program. All rights reserved.
            </div>

            <!-- By Section -->
            <div class="By w-full md:w-auto">
            SAP Application Developed by
            <a href="https://www.linkedin.com/in/ediangca22/" target="_blank" rel="noopener noreferrer"
                class="text-primary font-bold hover:underline">Edbiraanhgicma</a>
            </div>

        </div>
    </div>`
})
export class AppFooter { }
