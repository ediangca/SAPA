import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AppFloatingConfigurator } from '../../layout/component/app.floatingconfigurator';

@Component({
    selector: 'app-angular',
    standalone: true,
    imports: [RouterModule, AppFloatingConfigurator, ButtonModule],
    template: `
    <app-floating-configurator />

    <div
        class="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <!-- Logo -->
        <a href="/" class="mb-8">
            <img
                src="assets/images/sapa-logo.gif"
                alt="SAPA Logo"
                class="w-28 sm:w-32 md:w-36 lg:w-40 h-auto transition-transform duration-300 hover:scale-105" />
        </a>

        <!-- Card Wrapper -->
        <div
            class="relative rounded-[56px] p-1 bg-gradient-to-b from-primary/60 to-transparent">
            <div
                class="bg-surface-0 dark:bg-surface-900 rounded-[53px] flex flex-col items-center py-16 px-6 sm:px-16 md:px-20 w-full max-w-3xl shadow-lg">

                <!-- Embedded Presentation -->
                <div
                    class="w-full max-w-xl aspect-[4/3] rounded-lg border-2 border-gray-300 overflow-hidden shadow-md mb-8">
                    <iframe
                        src="https://app.presentations.ai/view/bjEGrV2ZOB"
                        class="w-full h-full"
                        allow="clipboard-write; autoplay"
                        allowfullscreen
                        scrolling="no"></iframe>
                </div>

            <div
                class="bg-surface-0 dark:bg-surface-900 rounded-[53px] flex flex-col items-center py-16 px-6 sm:px-16 md:px-20 w-full max-w-3xl shadow-lg">

                    <iframe loading="lazy"
                        style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; border: none; padding: 0;margin: 0;"
                        src="https://www.canva.com/design/DAHCxwKyPaQ/d83VU1It3a_jaTtGN3Ixww/view?embed"
                        allowfullscreen="allowfullscreen" allow="fullscreen">
                    </iframe>
                </div>

                <!-- Button -->
                <p-button
                    label="Go to Home page"
                    routerLink="/"
                    class="px-6 py-3 bg-primary text-white rounded-full shadow-md hover:bg-primary-dark transition-colors duration-300" />
            </div>
        </div>
    </div>
    `
})
export class Angular { }
