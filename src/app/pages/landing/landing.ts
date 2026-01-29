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

@Component({
    selector: 'app-landing',
    standalone: true,
    imports: [RouterModule, NavbarWidget, BannerWidget, AboutUsWidget ,StakeholdersWidget, TeamWidget,  ContactUsWidget, FooterWidget, RippleModule, StyleClassModule, ButtonModule, DividerModule, TopbarWidget],
    template: `
        <div class="bg-surface-0 dark:bg-surface-900">
            <div id="home" class="landing-wrapper overflow-hidden">
                <topbar-widget class="bg-primary py-6 px-6 mx-0 lg:px-40 flex items-center justify-between relative lg:static" />
                <navbar-widget class="py-6 px-6 mx-0 md:mx-12 lg:mx-20 lg:px-20 flex items-center justify-between relative lg:static" />
                <banner-widget />
                <aboutus-widget/>
                <stakeholders-widget />
                <team-widget />
                <contactus-widget />
                <footer-widget />
            </div>
        </div>
    `
})
export class Landing {}
