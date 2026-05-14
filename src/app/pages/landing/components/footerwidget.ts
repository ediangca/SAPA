import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'footer-widget',
    imports: [RouterModule, ButtonModule],
    template: `
<div class="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-28">

    <!-- TOP GRID -->
    <div class="grid grid-cols-1 lg:grid-cols-8 gap-12">

        <!-- BRAND SECTION -->
        <div class="lg:col-span-3">

            <div class="flex flex-col sm:flex-row items-center sm:items-start gap-6">

                <!-- LOGO -->
                <div class="shrink-0">
                    <img
                        src="assets/images/sapa-logo.gif"
                        alt="SAP Logo"
                        class="w-28 h-28 sm:w-32 sm:h-32 object-contain"
                    />
                </div>

                <!-- TEXT -->
                <div class="text-center sm:text-left">

                    <h3
                        class="text-lg sm:text-xl font-bold text-primary border-b border-slate-200 dark:border-slate-800 pb-2">
                        School Affiliation Program (SAP)
                    </h3>

                    <p
                        class="text-sm leading-relaxed text-slate-500 dark:text-slate-400 mt-3">
                        Dedicated to improving healthcare education through
                        digital innovation and institutional cooperation
                        in Davao del Norte.
                    </p>

                    <!-- SOCIALS -->
                    <div
                        class="flex flex-wrap justify-center sm:justify-start gap-3 mt-5">

                        <a pButton icon="pi pi-phone" severity="contrast" rounded [size]="'small'" href="tel:+639209745780"
                            pTooltip="Call Us" tooltipPosition="bottom">
                        </a>

                        <a pButton icon="pi pi-envelope" severity="success" rounded [size]="'small'" pTooltip="Email Us"
                            tooltipPosition="bottom" href="mailto:peedo.davnor.officialw@gmail.com">
                        </a>

                        <a pButton icon="pi pi-map-marker" severity="warn" rounded [size]="'small'"
                            href="https://maps.app.goo.gl/Di8EN3nmujoEbXNk6" target="_blank" pTooltip="Visit Us"
                            tooltipPosition="bottom">
                        </a>

                        <!-- Socials -->
                        <a pButton icon="pi pi-facebook" rounded severity="info" [size]="'small'" href="https://www.facebook.com/peedodavnorofficial"
                            target="_blank" pTooltip="Follow Us" tooltipPosition="bottom"></a>

                    </div>

                </div>

            </div>

        </div>

        <!-- QUICK LINKS -->
        <div class="lg:col-span-5">

            <h5
                class="font-semibold text-primary text-lg border-b border-slate-200 dark:border-slate-800 pb-3 mb-6">
                Quick Links
            </h5>

            <!-- LINKS -->
            <ul
                class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">

                <li>
                    <a
                        (click)="router.navigate([''], { fragment: 'aboutus' })"
                        pRipple
                        class="block rounded-lg px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-700 dark:text-slate-200 font-medium">
                        About SAP
                    </a>
                </li>

                <li>
                    <a
                        (click)="router.navigate([''], { fragment: 'stakeholders' })"
                        pRipple
                        class="block rounded-lg px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-700 dark:text-slate-200 font-medium">
                        Stakeholders
                    </a>
                </li>

                <li>
                    <a
                        (click)="router.navigate([''], { fragment: 'hospitals' })"
                        pRipple
                        class="block rounded-lg px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-700 dark:text-slate-200 font-medium">
                        Hospital Partners
                    </a>
                </li>

                <li>
                    <a
                        (click)="router.navigate([''], { fragment: 'schools' })"
                        pRipple
                        class="block rounded-lg px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-700 dark:text-slate-200 font-medium">
                        Schools
                    </a>
                </li>

                <li>
                    <a
                        (click)="router.navigate([''], { fragment: 'contactus' })"
                        pRipple
                        class="block rounded-lg px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-700 dark:text-slate-200 font-medium">
                        Contact Us
                    </a>
                </li>

            </ul>

        </div>

    </div>

    <!-- FOOTER BOTTOM -->
    <div
        class="mt-16 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-400">

        <p class="text-center md:text-left">
            © 2024 School Affiliation Program. All rights reserved.
        </p>

        
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

    `
})
export class FooterWidget {
    constructor(public router: Router) { }
}
