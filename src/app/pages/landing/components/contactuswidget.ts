import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { RippleModule } from 'primeng/ripple';

@Component({
  selector: 'contactus-widget',
  imports: [DividerModule, ButtonModule, RippleModule],
  template: `
   <section
  id="contact"
  class="py-28 bg-primary-50 dark:bg-slate-900">
  <div class="container mx-auto px-6">

    <!-- HEADER -->
    <div class="max-w-3xl mx-auto text-center mb-16">
      <h2
        data-aos="fade-up"
        class="font-display text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
        Reach Out to Us
      </h2>
      <p
        data-aos="fade-up"
        data-aos-delay="150"
        class="text-lg text-slate-600 dark:text-slate-400">
        Get in touch with the Provincial Economic Enterprise and Development
        Office
        for inquiries, partnerships, and support.
      </p>
    </div>

    <!-- CONTENT GRID -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

      <!-- MAP -->
      <div
        data-aos="fade-right"
        class="w-full h-[420px] rounded-3xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800">
        <iframe
          class="w-full h-full"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3397.037116125767!2d125.78021963316964!3d7.457329830626846!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x32f953006e90245b%3A0x4428f1e373c77a4c!2sPEEDO!5e0!3m2!1sen!2sph!4v1769697775112!5m2!1sen!2sph"
          allowfullscreen
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"></iframe>
      </div>

      <!-- CONTACT INFO -->
      <div
        data-aos="fade-left"
        class="space-y-8">
        <div class="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-lg">
          <h3
            class="text-2xl font-semibold text-slate-900 dark:text-white mb-6">
            Contact Information
          </h3>

          <div class="space-y-6">
            <!-- EMAIL -->
            <div class="flex items-center gap-4">
              <div
                class="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <span class="material-symbols-outlined text-2xl">
                  <i class="fa-solid fa-envelope"></i>
                </span>
              </div>
              <div>
                <a
                  href="mailto:peedo.davnor.officialw@gmail.com"
                  class="text-lg font-medium text-slate-900 dark:text-white hover:text-primary transition">
                  peedo.davnor.officialw@gmail.com
                </a>
              </div>
            </div>

            <!-- PHONE -->
            <div class="flex items-center gap-4">
              <div
                class="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <span class="material-symbols-outlined text-2xl">
                  <i class="fa-solid fa-phone"></i>
                </span>
              </div>
              <div>
                <a
                  href="tel:+639209745780"
                  class="text-lg font-medium text-slate-900 dark:text-white hover:text-primary transition">
                  +63 920 974 5780
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  </div>
</section>

    `
})
export class ContactUsWidget { }
