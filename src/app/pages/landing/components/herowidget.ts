import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';

@Component({
    selector: 'hero-widget',
    imports: [ButtonModule, RippleModule],
    template: `
        <div
            id="hero"
            class="flex flex-col pt-6 px-6 lg:px-20 overflow-hidden"
            style="background: linear-gradient(0deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.2)), radial-gradient(77.36% 256.97% at 77.36% 57.52%, rgb(238, 239, 175) 0%, rgb(195, 227, 250) 100%); clip-path: ellipse(150% 87% at 93% 13%)"
        >
            <div class="mx-6 md:mx-20 mt-20">
                <h1 class="text-9x1 font-light text-gray-900 leading-tight dark:!text-gray-700" data-aos="fade-right" data-aos-easing="linear"
      data-aos-duration="500">
                    SAP
                    <span class="block text-7xl">School Affiliation Program</span>
                </h1>
                <p class="font-normal text-3xl leading-normal mt-10 md:pr-150"  data-aos="fade-up" data-aos-easing="linear"
      data-aos-duration="500">“Creating a connected healthcare system where public hospitals share knowledge, resources, and commitment to serve every community“</p>
                <button pButton pRipple [rounded]="true" type="button" label="Get Started" class="text-xl! mt-8 px-4!"  data-aos="fade-up" data-aos-easing="linear"
      data-aos-duration="500"></button>
            </div>
            <div class="flex justify-center md:justify-end"  data-aos="fade-left" data-aos-easing="linear"
      data-aos-duration="500">
                <img src="https://shs-components.infopark.io/siemens-healthcare/countries/us/services/cs-workforce-honeycomb/assets/workforce-people-illustration.png" alt="Hero Image" class="w-9/12 md:w-auto" />
            </div>
        </div>
    `
})
export class HeroWidget { }
