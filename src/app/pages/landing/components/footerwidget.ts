import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'footer-widget',
    imports: [RouterModule, ButtonModule],
    template: `
<div class="container mx-auto py-28 px-6">
    <!-- TOP GRID -->
    <div class="grid grid-cols-1 gap-12 mb-16 md:grid-cols-2 lg:grid-cols-8">

        <!-- BRAND -->
        <div class="lg:col-span-3 space-y-6">
            <div class="flex items-center gap-3">
                <div class="pb-5">
                    <img src="assets/images/sapa-logo.gif" alt="SAP Logo"
                        class="
                    mx-0 my-0
                    w-32 h-32
                    object-contain
                    " />
                </div>
                <div class="p-0">
                    <p
                        class="font-display text-xl text-slate-900 dark:text-white">
                        <span class="text-primary font-bold block border-b border-slate-100 dark:border-slate-800 pb-2">
                            School Affiliation Program (SAP)
                        </span>
                        <span
                            class="text-sm leading-relaxed text-slate-500 dark:text-slate-400 mt-2 block">
                            Dedicated to improving healthcare education through
                            digital innovation
                            and institutional cooperation in Davao del Norte.
                        </span>
                    </p>
                    <div class="flex items-center gap-4 pt-2">
                        <a pButton icon="pi pi-facebook" rounded
                            severity="secondary" size="small"
                            href="https://facebook.com"
                            target="_blank" pTooltip="Follow Us"
                            tooltipPosition="bottom"></a>
                        <a pButton icon="pi pi-twitter" rounded
                            severity="secondary" size="small"
                            href="https://twitter.com"
                            target="_blank" pTooltip="Follow Us"
                            tooltipPosition="bottom"></a>
                        <a pButton icon="pi pi-instagram" rounded
                            severity="secondary" size="small"
                            href="https://instagram.com"
                            target="_blank" pTooltip="Follow Us"
                            tooltipPosition="bottom"></a>
                        <a pButton icon="pi pi-linkedin" rounded
                            severity="secondary" size="small"
                            href="https://linkedin.com"
                            target="_blank" pTooltip="Follow Us"
                            tooltipPosition="bottom"></a>
                    </div>
                </div>
            </div>

        </div>

        <!-- LOCATION -->
        <div class="lg:col-span-5 space-y-6">
            <h5 class="font-semibold text-primary text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                Quick Links
            </h5>

            <div
                class="items-center bg-surface-0 dark:bg-surface-900 grow justify-between hidden lg:flex absolute lg:static w-full left-0 top-full px-12 lg:px-0 z-20 rounded-border">
                <ul
                    class="list-none p-0 m-0 flex lg:items-center select-none flex-col lg:flex-row cursor-pointer gap-8">
                    <li>
                        <a
                            (click)="router.navigate([''], { fragment: 'aboutus' })"
                            pRipple
                            class="px-0 py-4 text-surface-900 dark:text-surface-0 font-medium text-xl">
                            <span>About SAP</span>
                        </a>
                    </li>
                    <li>
                        <a
                            (click)="router.navigate([''], { fragment: 'stakeholders' })"
                            pRipple
                            class="px-0 py-4 text-surface-900 dark:text-surface-0 font-medium text-xl">
                            <span>Stakeholder</span>
                        </a>
                    </li>
                    <li>
                        <a
                            (click)="router.navigate([''], { fragment: 'hospitals' })"
                            pRipple
                            class="block px-4 py-2 text-surface-900 dark:text-surface-0 font-medium text-xl">
                            Hospital Partners
                        </a>
                    </li>
                    <li>
                        <a
                            (click)="router.navigate([''], { fragment: 'schools' })"
                            pRipple
                            class="block px-4 py-2 text-surface-900 dark:text-surface-0 font-medium text-xl">
                            Schools
                        </a>
                    </li>

                    <li>
                        <a
                            (click)="router.navigate([''], { fragment: 'contactus' })"
                            pRipple
                            class="px-0 py-4 text-surface-900 dark:text-surface-0 font-medium text-xl">
                            <span>Contact Us</span>
                        </a>
                    </li>
                </ul>
            </div>

            <!-- <div class="hidden md:block space-y-3 text-sm text-slate-500 dark:text-slate-400">
                <div class="flex items-center gap-3">
                    <span class="material-symbols-outlined text-primary">
                        <i class="fa-solid fa-envelope"></i>
                    </span>
                    <a class="hover:text-primary transition"
                    href="mailto:peedo.davnor.officialw@gmail.com">
                        peedo.davnor.officialw@gmail.com
                    </a>
                </div>

                <div class="flex items-center gap-3">
                    <span class="material-symbols-outlined text-primary">
                        <i class="fa-solid fa-phone"></i>
                    </span>
                    <a class="hover:text-primary transition"
                    href="tel:+639209745780">
                        +63 920 974 5780
                    </a>
                </div>
            </div> -->

        </div>

    </div>

    <!-- FOOTER BOTTOM -->
    <div
        class="flex flex-col gap-4 border-t border-slate-100 dark:border-slate-900 pt-8 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
        <p>© 2024 School Affiliation Program. All rights reserved.</p>

        <div class="flex items-center gap-2">
            <span class="material-icons-outlined text-sm">public</span>
            <span>English (Philippines)</span>
        </div>
    </div>
</div>

    `
})
export class FooterWidget {
    constructor(public router: Router) { }
}
