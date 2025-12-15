import { inject, Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { catchError, Observable, throwError } from 'rxjs';
import { NgToastService } from 'ng-angular-popup';
import { Router } from '@angular/router';
import { LogsService } from '../../services/logs.service';
import Swal from 'sweetalert2';
// import { HttpErrorHandler } from '../handler/http-error-handler';


export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toast = inject(NgToastService);
  const logger = inject(LogsService);

  // const errorHandler = inject(HttpErrorHandler);

  const myToken = authService.getToken();



  if (myToken) {
    // this.logger.printLogs('i', "Token: ", myToken);
    req = req.clone({
      setHeaders: {
        // Authorization: `Charrot ${myToken}`
        Authorization: `Bearer ${myToken}`
      }
    });
  }

  return next(req).pipe(

    // catchError((err) => errorHandler.handle(err)),
    
    catchError((err: any) => {

      let messages: any | null = null;

      // logger.printLogs('i', 'Pipe Error', `Status: " ${err.status}`);
      if (err instanceof HttpErrorResponse) {
        // logger.printLogs('i', 'Pipe Error', err);
        // logger.printLogs('i', 'Pipe Error', `Status: " ${err.status}`);
        if (err.status == 0) {
          messages = "Failed to establish connection!";
          toast.warning(`${err.error.message} due to connectivity issue. Please contact the System Administrator.`, "Connectivity Error!", 0);

        } else if (err.status == 400) {// Check if the error response has a message property
          if (err.error && err.error.message) {
            // Display the custom message from the API
            messages = err.error.message;
            toast.warning(err.error.message, "Error!", 5000);
          } else {
            // Handle validation errors
            const validationErrors = err.error?.errors;

            if (validationErrors) {
              for (const key in validationErrors) {
                if (validationErrors.hasOwnProperty(key)) {
                  const messages = validationErrors[key];
                  if (Array.isArray(messages)) {
                    messages.forEach((message: string) => {
                      toast.warning(message, "Validation Error!", 5000);
                    });
                  } else {
                    // If messages is not an array, display a custom message
                    toast.warning(messages, "Validation Error!", 5000); // Assuming messages is a string
                  }
                }
              }
            } else {
              // Handle generic bad request error
              toast.warning("An unknown error occurred.", "Error!", 5000);
            }
          }
        } else if (err.status === 401) {

          messages = err.error?.message || "Token is Expired!, Please login again!"; // Get the message from the error response
          // toast.warning("Token is Expired!, Please login again! " + err.status, "Warning!", 5000);
          toast.warning(messages, "Warning!", 5000);
          // authService.exit();

        } else if (err.status === 404) {
          messages = err.error?.message;
          // toast.warning(err.error.message, "Not Found!", 5000);
        } else if (err.status === 409) {
          logger.printLogs('i', 'Conflict Error', err);
          messages = err.error?.message;
          // toast.warning(err.error.message, "Conflict Error!", 5000);
        } else if (err.status === 500) {
          messages = err.error.message;
          // toast.error("Internal Server Error! Please contact the system administrator.", "Server Error!", 0);
        }
      }

      return throwError(() => messages );
      // return throwError(() => new Error(`${messages! || err?.message || err.error?.message}`));
    })
    
  );
};
