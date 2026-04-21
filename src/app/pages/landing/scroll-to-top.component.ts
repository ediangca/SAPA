import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'scroll-to-top',
    standalone: true,
    imports: [CommonModule],
    template: `
        <button
            *ngIf="isVisible"
            (click)="scrollToTop()"
            class="fixed bottom-8 right-8 z-50 w-12 h-12 rounded-full bg-primary text-white shadow-lg flex items-center justify-center
                   hover:bg-primary/80 active:scale-95 transition-all duration-300"
            aria-label="Scroll to top"
            [class.opacity-100]="isVisible"
            [class.opacity-0]="!isVisible"
        >
            <i class="pi pi-arrow-up text-lg"></i>
        </button>
    `,
    styles: [`
        button {
            animation: fadeIn 0.3s ease;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to   { opacity: 1; transform: translateY(0); }
        }
    `]
})
export class ScrollToTopComponent {
    isVisible = false;

    @HostListener('window:scroll', [])
    onWindowScroll() {
        this.isVisible = window.scrollY > 400;
    }

    scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}