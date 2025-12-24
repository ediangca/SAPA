import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'confirm-slot',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './confirmslots.component.html',
})
export class ConfirmSlots implements OnInit {

  title = '';
  statusMessage = '';
  iconClass = '';
  iconBgClass = '';
  titleClass = '';
  messageClass = '';
  showButton = false;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const status = params['status'];

      switch (status) {

        // ✅ SUCCESS
        case '201':
          this.title = 'Schedule Confirmed';
          this.statusMessage = 'Your schedule has been confirmed successfully.';
          this.iconClass = 'pi pi-check text-green-600';
          this.iconBgClass = 'bg-green-100';
          this.titleClass = 'text-green-800';
          this.messageClass = 'text-green-700';
          this.showButton = true;
          break;

        // ❌ INVALID TOKEN
        case '404':
          this.title = 'Invalid Confirmation Link';
          this.statusMessage = 'This confirmation link is invalid or does not exist.';
          this.iconClass = 'pi pi-times text-red-600';
          this.iconBgClass = 'bg-red-100';
          this.titleClass = 'text-red-800';
          this.messageClass = 'text-red-700';
          break;

        // ⏰ EXPIRED / USED
        case '409':
        case '410':
          this.title = 'Link Expired';
          this.statusMessage =
            'This confirmation link has already been used or has expired.';
          this.iconClass = 'pi pi-clock text-orange-600';
          this.iconBgClass = 'bg-orange-100';
          this.titleClass = 'text-orange-800';
          this.messageClass = 'text-orange-700';
          break;

        // 🚫 FALLBACK
        default:
          this.title = 'Invalid Request';
          this.statusMessage = 'Unable to validate confirmation request.';
          this.iconClass = 'pi pi-exclamation-triangle text-gray-600';
          this.iconBgClass = 'bg-gray-100';
          this.titleClass = 'text-gray-800';
          this.messageClass = 'text-gray-700';
          break;
      }
    });
  }
}
