import { Component, ElementRef } from '@angular/core';
import { AppMenu } from './app.menu';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [AppMenu],
    template: ` <div class="layout-sidebar rounded-3xl
                border border-white/30 dark:border-white/10
                bg-white/40 dark:bg-white/5
                backdrop-blur-2xl backdrop-saturate-150
                shadow-[0_8px_32px_rgba(0,0,0,0.10)]
                dark:shadow-[0_8px_32px_rgba(0,0,0,0.45)]
                transition-all duration-500
                hover:shadow-[0_8px_40px_rgba(59,130,246,0.20)]
                dark:hover:shadow-[0_8px_40px_rgba(59,130,246,0.15)]">
        <app-menu></app-menu>
    </div>`
})
export class AppSidebar {

    constructor(public el: ElementRef) { }
}
