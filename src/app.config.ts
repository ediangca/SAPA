import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, inject } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withEnabledBlockingInitialNavigation, withInMemoryScrolling } from '@angular/router';
import Aura from '@primeuix/themes/aura';
import { providePrimeNG } from 'primeng/config';
import { appRoutes } from './app.routes';
import { provideToastr } from 'ngx-toastr';
import { ToastrService } from 'ngx-toastr';
import { tokenInterceptor } from '@/helper/interceptor/token.interceptor';

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(appRoutes, withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }), withEnabledBlockingInitialNavigation()),
        provideHttpClient(withFetch()),
        provideAnimationsAsync(),
        providePrimeNG({ theme: { preset: Aura, options: { darkModeSelector: '.app-dark' } } }),
        provideToastr({
            timeOut: 3000,
            positionClass: 'toast-bottom-right',
            preventDuplicates: true,
        }),
        provideHttpClient(withInterceptors([tokenInterceptor]))
    ]
};


setTimeout(() => {
  const toastr = inject(ToastrService);
  // toastr.success('Testing toastr!', 'Success');
}, 3000);
