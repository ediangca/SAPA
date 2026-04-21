import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RippleModule } from 'primeng/ripple';
import { StyleClassModule } from 'primeng/styleclass';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { TopbarWidget } from './components/topbarwidget.component';
import { TeamWidget } from './components/teamwidget';
import { FooterWidget } from './components/footerwidget';
import { NavbarWidget } from './components/navbarwidget.component';
import { BannerWidget } from './components/bannerwidget';
import { StakeholdersWidget } from './components/stakeholderswidget';
import { AboutUsWidget } from './components/aboutuswidget';
import { ContactUsWidget } from './components/contactuswidget';
import { ScrollToTopComponent } from './scroll-to-top.component';

@Component({
    selector: 'app-landing',
    standalone: true,
    imports: [RouterModule, NavbarWidget, BannerWidget, AboutUsWidget, StakeholdersWidget, TeamWidget, ContactUsWidget, FooterWidget, ScrollToTopComponent, RippleModule, StyleClassModule, ButtonModule, DividerModule, TopbarWidget],
    template: `
        <div class="bg-surface-0 dark:bg-surface-900">
            <!-- <div id="home" class="landing-wrapper overflow-hidden"> -->
            <div id="home" class="landing-wrapper">
                <topbar-widget class="bg-primary py-6 px-6 mx-0 lg:px-40 flex items-center justify-between relative lg:static" />
                <div class="sticky top-0 z-50 bg-surface-0 dark:bg-surface-900 shadow-sm">
                    <navbar-widget class="py-6 px-6 mx-0 md:mx-12 lg:mx-20 lg:px-20 flex items-center justify-between" />
                </div>

                <div class="overflow-hidden">
                    <banner-widget />
                </div>>
                <aboutus-widget/>
                <stakeholders-widget />
                <team-widget />
                <contactus-widget />
                <footer-widget />
                <!-- <scroll-to-top /> -->
            </div>
        </div>
    `
})
export class Landing { }
