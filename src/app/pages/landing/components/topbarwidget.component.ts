import { Component } from '@angular/core';
import { StyleClassModule } from 'primeng/styleclass';
import { Router, RouterModule } from '@angular/router';
import { RippleModule } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';
import { AppFloatingConfigurator } from "@/layout/component/app.floatingconfigurator";
import { Tooltip, TooltipModule } from "primeng/tooltip";
import { AuthService } from '@/services/auth.service';

@Component({
    selector: 'topbar-widget',
    imports: [RouterModule, StyleClassModule, ButtonModule, RippleModule, TooltipModule],
    templateUrl: './topbar.component.html'
})
export class TopbarWidget {


}
