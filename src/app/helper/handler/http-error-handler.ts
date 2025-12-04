import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { LogsService } from '@/services/logs.service';
import { AuthService } from '@/services/auth.service';
import { NgToastService } from 'ng-angular-popup';

@Injectable({
  providedIn: 'root',
})
export class HttpErrorHandler {

  constructor(
    private toast: NgToastService,        // Replace with your toast service type
    private logger: LogsService,       // Replace with your logger type
    private authService: AuthService,  // Replace with your auth service
  ) {}

  public handle(error: HttpErrorResponse) {
    let message = 'Unknown error!';

    // CLIENT-SIDE ERROR
    if (error.error instanceof ErrorEvent) {
      message = error.error.message;
      return throwError(() => message);
    }

    // SERVER-SIDE ERROR
    if (error.error) {
      if (typeof error.error === 'string') {
        message = error.error + '-error.error.string';
      } 
      else if (error.error.message) {
        message = error.error.message + '-error.error.message';
      } 
      else if (error.error.errors) {
        message = this.extractValidationErrors(error.error.errors);
      } 
      else if (error.error.title) {
        message = error.error.title + '-error.error.title';
      }
    }

    // HANDLE HTTP STATUS CODES
    this.logger.printLogs('i', 'Pipe Error', error);
    this.logger.printLogs('i', 'Pipe Error', `Status: ${error.status}`);

    switch (error.status) {
      case 0:
        message = 'Failed to establish connection!';
        this.toast.warning(
          `${error.error?.message} due to connectivity issue. Please contact the system administrator.`,
          'Connectivity Error!',
          0
        );
        break;

      case 400:
        message = this.handleBadRequest(error);
        break;

      case 401:
        message = error.error?.message || 'Token is Expired!, Please login again!';
        this.toast.warning(message, 'Warning!', 5000);
        this.authService.exit();
        break;

      case 404:
        message = error.error?.message || 'Resource not found.';
        break;

      case 409:
        this.logger.printLogs('i', 'Conflict Error', error);
        message = error.error?.message;
        break;

      case 500:
        message = error.error?.message || 'Internal Server Error.';
        break;

      default:
        this.logger.printLogs('i', 'Server Error', error);
        message = `Server Error: ${error.status}`;
    }

    return throwError(() => message);
  }

  // Extract validation errors from { field: ["msg", "msg2"] }
  private extractValidationErrors(errors: any): string {
    const messages: string[] = [];
    for (const field in errors) {
      if (errors.hasOwnProperty(field)) {
        messages.push(`${field}: ${errors[field].join(', ')} <br>`);
      }
    }
    return messages.join(' | ');
  }

  // Handle HTTP 400 requests with optional validation errors
  private handleBadRequest(error: HttpErrorResponse): string {
    if (error.error && error.error.message) {
      this.toast.warning(error.error.message, "Error!", 5000);
      return error.error.message;
    }

    const validationErrors = error.error?.errors;
    if (validationErrors) {
      for (const key in validationErrors) {
        if (validationErrors.hasOwnProperty(key)) {
          const messages = validationErrors[key];
          if (Array.isArray(messages)) {
            messages.forEach((m: string) => {
              this.toast.warning(m, "Validation Error!", 5000);
            });
          } else {
            this.toast.warning(messages, "Validation Error!", 5000);
          }
        }
      }
      return 'Validation error occurred.';
    }

    this.toast.warning('An unknown error occurred.', 'Error!', 5000);
    return 'An unknown error occurred.';
  }
}
