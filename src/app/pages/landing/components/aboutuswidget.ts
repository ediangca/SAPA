import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'aboutus-widget',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- ABOUT US -->
    <<section id="aboutus" class="py-24 bg-background-light dark:bg-background-dark">
  <div class="container mx-auto px-6">
    <div class="max-w-4xl mx-auto text-center" data-aos="fade-up">
      <h2 class="font-display text-4xl font-bold text-slate-900 dark:text-white">
        About SAP
      <span data-aos="fade-up" class="block text-sm font-semibold text-slate-400 uppercase tracking-widest mt-2">
      School Affiliation Program</span>
      </h2>
      <div
        class="glass-card p-10 rounded-3xl shadow-xl text-center"
        data-aos="zoom-in"
        data-aos-delay="150"
      >
      <img src="assets/images/sapa-logo.gif" alt="SAP Logo"
      class="
          mx-auto my-6
          w-24 h-24
          sm:w-28 sm:h-28
          md:w-32 md:h-32
          lg:w-56 lg:h-56
          object-contain
        "/>
     
        <p class="italic text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
          “The School Affiliation Program strengthens collaboration
          between Davao del Norte hospitals and partner schools through a secure,
          transparent, and efficient digital platform.”
        </p>
      </div>
    </div>
  </div>
</section>

    `
})
export class AboutUsWidget { }
