import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'footer-widget',
    imports: [RouterModule, ButtonModule],
    template: `
        <div class="container mx-auto py-28 px-6">
  <!-- TOP GRID -->
  <div class="grid grid-cols-1 gap-12 mb-16 md:grid-cols-2 lg:grid-cols-6">

    <!-- BRAND -->
    <div class="lg:col-span-3 space-y-6">
      <div class="flex items-center gap-3">
            <div class="pb-5">
                <img src="assets/images/sapa-logo.gif" alt="SAP Logo"
                class="
                    mx-0 my-0
                    w-42 h-42
                    object-contain
                    "/>
            </div>
            <div class="p-0">
                <p class="font-display text-xl text-slate-900 dark:text-white">
                    <span class="text-primary font-bold block">
                        School Affiliation Program (SAP)
                    </span>
                    <span class="text-sm leading-relaxed text-slate-500 dark:text-slate-400 
                    border-t border-slate-100 dark:border-slate-800 pt-2 mt-2 block">
                        Dedicated to improving healthcare education through digital innovation
                        and institutional cooperation in Davao del Norte.
                    </span>
                </p>
                <div class="flex items-center gap-4 pt-2">
                    <a pButton icon="pi pi-facebook" rounded severity="secondary" size="small" href="https://facebook.com"
                        target="_blank" pTooltip="Follow Us" tooltipPosition="bottom"></a>
                    <a pButton icon="pi pi-twitter" rounded severity="secondary" size="small"href="https://twitter.com"
                        target="_blank" pTooltip="Follow Us" tooltipPosition="bottom"></a>
                    <a pButton icon="pi pi-instagram" rounded severity="secondary" size="small" href="https://instagram.com"
                        target="_blank" pTooltip="Follow Us" tooltipPosition="bottom"></a>
                    <a pButton icon="pi pi-linkedin" rounded severity="secondary" size="small" href="https://linkedin.com"
                        target="_blank" pTooltip="Follow Us" tooltipPosition="bottom"></a>
                </div>
            </div>
      </div>
        

    </div>

    <!-- LOCATION -->
    <div class="lg:col-span-3 space-y-6">
      <h5 class="font-semibold text-slate-900 dark:text-white">
        Our Location
      </h5>

      <div
        class="h-32 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 grayscale hover:grayscale-0 transition duration-500">
        <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3397.037116125767!2d125.78021963316964!3d7.457329830626846!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x32f953006e90245b%3A0x4428f1e373c77a4c!2sPEEDO!5e0!3m2!1sen!2sph!4v1769697611625!5m2!1sen!2sph" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
      </div>

      <div class="space-y-3 text-sm text-slate-500 dark:text-slate-400">
        <div class="flex items-center gap-3">
            <span class="material-symbols-outlined text-primary">
                <i class="fa-solid fa-envelope"></i>
            </span>
          <a class="hover:text-primary transition" href="mailto:peedo.davnor.officialw@gmail.com">
            peedo.davnor.officialw@gmail.com
          </a>
        </div>
        <div class="flex items-center gap-3">
            <span class="material-symbols-outlined text-primary">
                <i class="fa-solid fa-phone"></i>
            </span>
          <a class="hover:text-primary transition" href="tel:+639209745780">
            +63 920 974 5780
          </a>
        </div>
      </div>
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
