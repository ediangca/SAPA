import { AuthService } from '@/services/auth.service';
import { Component, HostListener, ElementRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';

@Component({
    selector: 'banner-widget',
    imports: [RouterModule, ButtonModule, RippleModule],
    template: `
       <section
          class="flex flex-col px-6 lg:px-20 overflow-hidden relative min-h-screen justify-center"
          style="background: linear-gradient(0deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.2)), radial-gradient(77.36% 256.97% at 77.36% 57.52%, rgb(238, 239, 175) 0%, rgb(195, 227, 250) 100%); clip-path: ellipse(150% 87% at 93% 13%)"
       >
         <!-- Parallax background layer -->
         <div
           class="absolute inset-0 pointer-events-none"
           [style.transform]="'translateY(' + parallaxOffset + 'px)'"
           style="will-change: transform;"
         ></div>

         <div
           class="container mx-auto px-6 flex flex-col lg:flex-row items-center relative z-10 min-h-screen py-20"
           [style.transform]="'translateY(' + textParallaxOffset + 'px)'"
           style="will-change: transform; transition: transform 0.05s linear;"
         >
           <!-- Text -->
           <div class="lg:w-1/2 text-center lg:text-left mb-12 lg:mb-0" data-aos="fade-right">
             <span
               class="inline-block px-4 py-1.5 mb-6 text-sm font-bold tracking-wider text-primary uppercase bg-white/60 dark:bg-slate-800/60 rounded-full border border-primary/20"
               data-aos="zoom-in" data-aos-delay="150"
             >
               Unified Healthcare System
             </span>

             <h1
               class="font-display text-4xl lg:text-6xl font-extrabold text-slate-900 leading-tight mb-6"
               data-aos="fade-up" data-aos-delay="250"
             >
               School Affiliation Program
               <span class="block text-secondary-blue dark:text-primary">
                 Connecting Learning & Healthcare
               </span>
             </h1>

             <p
               class="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-2xl"
               data-aos="fade-up" data-aos-delay="350"
             >
               A centralized online platform that streamlines the School Affiliation
               Program between Davao del Norte hospitals and partner academic institutions.
             </p>

             <div
               class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
               data-aos="fade-up" data-aos-delay="450"
             >
               @if (!isLoggedIn) {
                 <button pButton pRipple routerLink="login"
                   class="bg-primary hover:bg-secondary-blue text-white px-8 py-4 rounded-xl font-bold shadow-xl transition"
                 >
                   Get Started →
                 </button>
               }
               <button (click)="router.navigate([''], { fragment: 'aboutus' })"
                 class="bg-white dark:bg-slate-800 px-8 py-4 rounded-xl font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
               >
                 Learn More
               </button>
             </div>
           </div>

           <!-- Image -->
           <div
             class="lg:w-1/2 relative flex items-center justify-center"
             data-aos="fade-left"
             [style.transform]="'translateY(' + imageParallaxOffset + 'px)'"
             style="will-change: transform; transition: transform 0.05s linear;"
           >
             <img
               src="assets/images/health-care-personel.png"
               alt="Healthcare team"
               class="w-full max-w-lg object-contain drop-shadow-2xl"
             />
           </div>
         </div>
       </section>
    `
})
export class BannerWidget {

    parallaxOffset = 0;
    textParallaxOffset = 0;
    imageParallaxOffset = 0;

    constructor(public router: Router, private authService: AuthService, private el: ElementRef) {}

    get isLoggedIn(): boolean {
        return this.authService.isAuthenticated();
    }

    @HostListener('window:scroll', [])
    onWindowScroll() {
        const section = this.el.nativeElement.querySelector('section');
        if (!section) return;

        const rect = section.getBoundingClientRect();
        const sectionTop = rect.top + window.scrollY;
        const scrolled = window.scrollY - sectionTop;

        if (scrolled > 0) {
            this.textParallaxOffset = -(scrolled * 0.15);
            this.imageParallaxOffset = -(scrolled * 0.50);
        } else {
            this.textParallaxOffset = 0;
            this.imageParallaxOffset = 0;
        }
    }
}