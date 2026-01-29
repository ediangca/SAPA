import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { RippleModule } from 'primeng/ripple';

@Component({
    selector: 'team-widget',
    imports: [DividerModule, ButtonModule, RippleModule],
    template: `
    
    <section id="hospitals" class="py-24 bg-white dark:bg-slate-900" >
      <div class="container mx-auto px-6 text-center">
        <h2
        data-aos="fade-up"
        class="font-display text-3xl font-bold text-slate-900 dark:text-white mb-4">
        Our Team &amp; Partners
        </h2>

        <p
        data-aos="fade-up"
        data-aos-delay="150"
        class="text-slate-500 dark:text-slate-400">
        Creating a connected healthcare system where public hospitals share knowledge and resources.
        </p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-12 place-items-center my-10">
            <div
                data-aos="zoom-in"
                data-aos-delay="200"
                class="space-y-4 text-center max-w-sm">
                <div
                class="h-40 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center overflow-hidden mx-auto">
                <img
                    src="assets/images/ddn.png"
                    alt="carmen-zone-Logo"
                    class="w-24 h-24 sm:w-28 sm:h-28 object-contain"
                />
                </div>

                <h5 class="text-xl font-bold text-slate-800 dark:text-white">
                Province of Davao del Norte
                </h5>

                <p class="text-sm text-slate-500 dark:text-slate-400 px-6">
                Serving the central district as a primary training ground for medical
                students.
                </p>
            </div>

            <div
                data-aos="zoom-in"
                data-aos-delay="350"
                class="space-y-4 text-center max-w-sm">
                <div
                class="h-40 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center overflow-hidden mx-auto">
                <img
                    src="assets/images/peedo.png"
                    alt="carmen-zone-Logo"
                    class="w-24 h-24 sm:w-28 sm:h-28 object-contain"
                />
                </div>

                <h5 class="text-xl font-bold text-slate-800 dark:text-white">
                PEEDO
                </h5>

                <p class="text-sm text-slate-500 dark:text-slate-400 px-6">
                Serving the central district as a primary training ground for medical
                students.
                </p>
            </div>

        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div data-aos="fade-right" data-aos-delay="100" class="space-y-4">
                <div
                class="h-40 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center overflow-hidden">
                <img src="assets/images/ddn-cz.png" alt="carmen-zone-Logo" class="h-30 w-30 " />
                </div>
                <h5 class="text-xl font-bold text-slate-800 dark:text-white">Carmen
                Zone Hospital</h5>
                <p class="text-sm text-slate-500 dark:text-slate-400 px-6">Serving
                the central district as a primary training ground for medical
                students.</p>
            </div>
            <div data-aos="fade-up" data-aos-delay="200" class="space-y-4">
                <div
                class="h-40 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center overflow-hidden">
                <img src="assets/images/ddn-kz.png" alt="kapalong-zone-Logo" class="h-30 w-30 " />
                </div>
                <h5
                class="text-xl font-bold text-slate-800 dark:text-white">Kapalong
                Zone Hospital</h5>
                <p
                class="text-sm text-slate-500 dark:text-slate-400 px-6">Specialized
                clinical areas offering diverse experience for nursing and allied
                health.</p>
            </div>
            <div data-aos="fade-left" data-aos-delay="300" class="space-y-4">
                <div
                class="h-40 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center overflow-hidden">
                <img src="assets/images/ddn-cz.png" alt="samal-zone-Logo" class="h-30 w-30 " />
                </div>
                <h5 class="text-xl font-bold text-slate-800 dark:text-white">IGACOS
                Zone Hospital</h5>
                <p class="text-sm text-slate-500 dark:text-slate-400 px-6">Island
                Garden City facility providing essential healthcare services and
                student exposure.</p>
            </div>
        </div>
        
        <div id="schools" 
          class="mt-24 pt-16 border-t border-slate-100 dark:border-slate-800">
          <h6 data-aos="fade-up"
            class="text-sm font-semibold text-slate-400 uppercase tracking-widest">Our
            Trusted Academic Partners</h6>
          <div
            class="flex flex-wrap justify-center items-center gap-12 mt-10">
            <div
              class="flex items-center space-x-2 text-slate-400 font-bold text-xl">
              <img data-aos="fade-up" data-aos-delay="100" src="assets/images/arriesgado.png" alt="arriesgado-Logo" class="h-30 w-30 " />
            </div>
            <div
              class="flex items-center space-x-2 text-slate-400 font-bold text-xl">
              <img data-aos="fade-up" data-aos-delay="100" src="assets/images/tagum-doctors.png" alt="tagum-doctors-Logo" class="h-30 w-30 " />
            </div>
            <div
              class="flex items-center space-x-2 text-slate-400 font-bold text-xl">
              <img data-aos="fade-up" data-aos-delay="100" src="assets/images/kcast.png" alt="KCast-Logo" class="h-30 w-30 " />
            </div>
            <div
              class="flex items-center space-x-2 text-slate-400 font-bold text-xl">
              <img data-aos="fade-up" data-aos-delay="100" src="assets/images/uic.png" alt="uic-Logo" class="h-30 w-30 " />
            </div>
            <div
              class="flex items-center space-x-2 text-slate-400 font-bold text-xl">
              <img data-aos="fade-up" data-aos-delay="100" src="assets/images/st-marys.png" alt="st-marys-Logo" class="h-30 w-30 " />
            </div>
          </div>
        </div>
      </div>
    </section>
    `
})
export class TeamWidget {}
