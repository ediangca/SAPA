import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { RippleModule } from 'primeng/ripple';

@Component({
  selector: 'team-widget',
  imports: [DividerModule, ButtonModule, RippleModule],
  templateUrl: './team.component.html',
})
export class TeamWidget { }
