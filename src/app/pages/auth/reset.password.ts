import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { AuthService } from '@/services/auth.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { PasswordModule } from 'primeng/password';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'reset-password',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    ConfirmDialogModule,
    FormsModule,
    RippleModule,
    DialogModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './reset.password.component.html',
  styles: [
    `
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .animate-fadeIn {
        animation: fadeIn 0.6s ease-out;
      }
    `,
  ],
})
export class ResetPassword implements OnInit {

  userId!: string;
  token!: string;
  password = '';
  confirmPassword = '';
  loading = false;
  issubmitted = false;

  constructor(private route: ActivatedRoute,
    private auth: AuthService,
    private router: Router,
    private message: MessageService,
    private confirmationService: ConfirmationService
  ) {
  }
  ngOnInit(): void {
    // this.userId = this.route.snapshot.queryParamMap.get('userID')!;
    // this.token = this.route.snapshot.queryParamMap.get('token')!;

    this.route.queryParams.subscribe(params => {
      this.userId = params['userId'];
      this.token = params['token'];
    });

  }


  submit() {
    this.issubmitted = true;
    if (!this.userId || !this.token) {
      this.message.add({
        severity: 'error',
        summary: 'Invalid Link',
        detail: 'Reset link is invalid or expired.'
      });
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.message.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Passwords do not match.'
      });
      return;
    }

    if (this.password.length < 8) {
      this.message.add({
        severity: 'warn',
        summary: 'Weak Password',
        detail: 'Password must be at least 8 characters long.'
      });
      return;
    }

    this.loading = true;
    this.auth.resetPassword({
      userId: this.userId,
      token: this.token,
      newPassword: this.password
    }).subscribe({
      next: () => {
        this.message.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Password updated successfully.'

        });

        this.confirmationService.confirm({
          header: 'Password Updated',
          message: 'Your password has been updated successfully. You may now log in.',
          icon: 'pi pi-key',
          acceptLabel: 'Go to Login',
          rejectVisible: false,
          acceptButtonStyleClass: 'p-button-success',
          accept: () => {
            this.router.navigate(['/login']);
          }
        });

      },
      error: () => this.loading = false
    });
  }

}
