import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { RouterModule } from "@angular/router";
import { ButtonModule } from "primeng/button";

@Component({
  standalone: true,
  selector: 'reset-expired',
  imports: [CommonModule, ButtonModule, RouterModule],
  template: `
    <div class="flex items-center justify-center min-h-screen">
      <div class="text-center max-w-md p-6 shadow-lg rounded-xl">
        <h2 class="text-xl font-semibold mb-3">Link Expired</h2>
        <p class="mb-4 text-gray-600">
          Your password reset link is invalid or has expired.
        </p>
        <button pButton
          label="Request New Link"
          routerLink="/login">
        </button>
      </div>
    </div>
  `
})
export class ResetExpired {}
