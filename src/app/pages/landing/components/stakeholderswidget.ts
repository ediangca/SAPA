import { Component } from '@angular/core';

@Component({
    selector: 'stakeholders-widget',
    template: `<section
    id="stakeholders"
    class="relative py-16 px-6 lg:px-24 mx-auto max-w-7xl"
>
    
    <section id="partners" class="py-20 bg-white dark:bg-slate-900">
      <div class="container mx-auto px-6">
        <div class="text-center mb-16">
          <h2
            class="font-display text-3xl font-bold text-slate-900 dark:text-white mb-4">Who
            It's For</h2>
          <p class="text-slate-500 dark:text-slate-400">Connecting key players
            in healthcare education</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div
            class="bg-background-light dark:bg-slate-800 p-8 rounded-2xl border border-slate-100 dark:border-slate-700 text-center hover:shadow-lg transition-shadow group">
            <div
              class="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary transition-colors">
              <span
                class="material-icons-outlined text-primary group-hover:text-white text-3xl transition-colors"><i class="fa-regular fa-hospital"></i></span>
            </div>
            <h4 class="font-bold text-lg mb-2">Government Hospitals</h4>
            <p class="text-sm text-slate-500 dark:text-slate-400">Streamlined
              management of clinical slots and student rotations.</p>
          </div>
          <div
            class="bg-background-light dark:bg-slate-800 p-8 rounded-2xl border border-slate-100 dark:border-slate-700 text-center hover:shadow-lg transition-shadow group">
            <div
              class="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-accent-green transition-colors">
              <span
                class="material-icons-outlined text-accent-green group-hover:text-white text-3xl transition-colors"><i class="fa-solid fa-graduation-cap"></i></span>
            </div>
            <h4 class="font-bold text-lg mb-2">Partner Institutions</h4>
            <p class="text-sm text-slate-500 dark:text-slate-400">Colleges and
              Universities managing student affiliations digitally.</p>
          </div>
          <div
            class="bg-background-light dark:bg-slate-800 p-8 rounded-2xl border border-slate-100 dark:border-slate-700 text-center hover:shadow-lg transition-shadow group">
            <div
              class="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-500 transition-colors">
              <span
                class="material-icons-outlined text-purple-500 group-hover:text-white text-3xl transition-colors"><i class="fa-solid fa-user-tie"></i></span>
            </div>
            <h4 class="font-bold text-lg mb-2">Program Coordinators</h4>
            <p class="text-sm text-slate-500 dark:text-slate-400">Centralized
              control for institutional MOAs and compliance tracking.</p>
          </div>
          <div
            class="bg-background-light dark:bg-slate-800 p-8 rounded-2xl border border-slate-100 dark:border-slate-700 text-center hover:shadow-lg transition-shadow group">
            <div
              class="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-amber-500 transition-colors">
              <span
                class="material-icons-outlined text-amber-500 group-hover:text-white text-3xl transition-colors"><i class="fa-solid fa-user-nurse"></i></span>
            </div>
            <h4 class="font-bold text-lg mb-2">Interns</h4>
            <p class="text-sm text-slate-500 dark:text-slate-400">Real-time
              attendance, area assignments, and performance monitoring.</p>
          </div>
        </div>
      </div>
    </section>

    

    `
})
export class StakeholdersWidget { }
