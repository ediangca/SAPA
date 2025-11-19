import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, delay, finalize, switchMap } from 'rxjs/operators';
import { throwError, Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { JwtHelperService } from '@auth0/angular-jwt'
import { LogsService } from './logs.service';
import { Environment } from '@/environment';
import { AppComponent } from 'src/app.component';
import { LoadingService } from './loading.service';
import { StoreService } from './store.service';


@Injectable({
  providedIn: 'root'
})

export class AuthService {

  private apiUrl: string = Environment.apiUrl;
  private tokenPayload: any;


  private jwtHelper = new JwtHelperService();

  constructor(private http: HttpClient, private router: Router,
    private logger: LogsService, private store: StoreService,
    private loading: LoadingService) {
    this.tokenPayload = this.getTokenPayloadFromToken();
  }


  registerUser(userAccount: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}UserAccount/Create/`, userAccount)
      .pipe(
        catchError(this.handleError)
      );
  }

  login(userAccount: any): Observable<any> {
    this.loading.setLoadingVisible(true);
    this.logger.printLogs('i', 'Logging in...', userAccount);

    return of(userAccount).pipe(
      delay(3000), // ⏳ Simulate a 3-second delay
      switchMap(account =>
        this.http.post<any>(`${this.apiUrl}Auth/`, account).pipe(
          catchError(this.handleError),
          finalize(() => {
            this.loading.setLoadingVisible(false);
            this.logger.printLogs('i', 'Finished login process', userAccount);
          })
        )
      )
    );
  }

  register(userAccount: any): Observable<any> {
    this.loading.setLoadingVisible(true);
    this.logger.printLogs('i', 'Processing Registration...', userAccount);

    return of(userAccount).pipe(
      delay(3000), // ⏳ Simulate a 3-second delay
      switchMap(account =>
        this.http.post<any>(`${this.apiUrl}Auth/register/`, account).pipe(
          catchError(this.handleError),
          finalize(() => {
            this.loading.setLoadingVisible(false);
            this.logger.printLogs('i', 'Finished register process', userAccount);
          })
        )
      )
    );
  }


  /*----------------------- ERROR HANDLING -----------------------*/

  // private handleError(err: HttpErrorResponse) {
  //   let errorMessage = 'Unknown error!';
  //   if (err.error instanceof ErrorEvent) {
  //     // Client-side errors
  //     errorMessage = `Error: ${err.error.message}`;
  //   } else {
  //     // Backend error
  //     if (err.error && err.error.message) {
  //       errorMessage = err.error.message;
  //     } else if (err.message) {
  //       errorMessage = err.message;
  //     }
  //   }
  //   return throwError(errorMessage);
  // }

  logout() {
    Swal.fire({
      title: 'Signout?',
      text: 'Are you sure?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading.setLoadingVisible(true);
        this.logger.printLogs('i', 'Logging out...', "");

        // Simulate delay (e.g., if you'd call an API to revoke token)
        of(null).pipe(
          delay(2000), // show spinner for 2s
          finalize(() => {
            this.loading.setLoadingVisible(false);
            this.logger.printLogs('i', 'Finished logout process', "");
          })
        ).subscribe(() => {
          this.exit();
        });
      }
    });
  }

  exit() {
    localStorage.clear();
    this.store.clearStore();
    this.router.navigate(['']);
  }

  storeLocal(result: any) {
    this.logger.printLogs('i', 'Token', `result:  ${result}`);
    if (result?.token) {
      localStorage.setItem('token', result.token);
    }
    // if (result?.userID) {
    //   localStorage.setItem('userID', result.userID);
    // }
    // if (result?.roleID) {
    //   localStorage.setItem('roleID', result.roleID);
    // }
  }

  getToken(): string | null {
    // return localStorage.getItem('token');
    return localStorage.getItem('token') || this.tokenPayload.token;
  }
  getUserID(): string | null {
    // return localStorage.getItem('userID');
    this.logger.printLogs('i', 'User Payload - UserID', this.tokenPayload.userID);
    return localStorage.getItem('userID') || this.tokenPayload.userID;
  }

  getRoleID(): string | null {
    return localStorage.getItem('roleID') || this.tokenPayload.role;
  }


  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return token !== null && !this.jwtHelper.isTokenExpired(token);
  }


  decodedToken() {
    const token = localStorage.getItem('token');
    if (token && !this.jwtHelper.isTokenExpired(token)) {
      return this.jwtHelper.decodeToken(token);
    }
    return null;
  }

  getTokenPayloadFromToken(): Observable<string | null> {
    const token = localStorage.getItem('token');
    if (token && !this.jwtHelper.isTokenExpired(token)) {
      const decodedToken = this.jwtHelper.decodeToken(token);
      this.tokenPayload = decodedToken;
      this.store.setTokenPayload(this.tokenPayload);
      // this.logger.printLogs('i', "Decoded Token: ", decodedToken);
      return of(decodedToken?.unique_name || null); // Adjust according to your token's structure
    } else {
      return of(null);
    }
  }



  // private handleError(error: HttpErrorResponse) {
  //   let errorMessage = 'Unknown error!';

  //   if (error.error instanceof ErrorEvent) {
  //     // Client-side error
  //     errorMessage = `Error: ${error.error.message}`;
  //   } else {
  //     // Server-side error
  //     if (error.error) {
  //       // Case 1: Custom message from backend
  //       if (error.error.message) {
  //         errorMessage = error.error.message;

  //         // Case 2: ASP.NET Core validation errors
  //       } else if (error.error.errors) {
  //         const validationErrors = error.error.errors;
  //         const messages: string[] = [];

  //         for (const field in validationErrors) {
  //           if (validationErrors.hasOwnProperty(field)) {
  //             messages.push(`${field}: ${validationErrors[field].join(', ')}`);
  //           }
  //         }

  //         errorMessage = messages.join(' | ');

  //         // Case 3: Fallback to "title" if provided
  //       } else if (error.error.title) {
  //         errorMessage = error.error.title;

  //       } else {
  //         errorMessage = `Server returned code ${error.status} - Please contact the system administrator.`;
  //       }
  //     } else if (error.message) {
  //       errorMessage = error.message;
  //     }
  //   }

  //   return throwError(() => `${errorMessage}`);
  // }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Unknown error!';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.error?.errors) {
        const messages: string[] = [];
        for (const field in error.error.errors) {
          if (error.error.errors.hasOwnProperty(field)) {
            messages.push(`${field}: ${error.error.errors[field].join(', ')}`);
          }
        }
        errorMessage = messages.join(' | ');
      } else if (error.error?.title) {
        errorMessage = error.error.title;
      } else {
        errorMessage = `Server returned code ${error.status}`;
      }
    }

    // 🔔 Show toast automatically
    Swal.fire({
      toast: true,
      icon: 'error',
      title: errorMessage,
      position: 'top-end',
      showConfirmButton: false,
      timer: 4000,
      timerProgressBar: true,
    });

    return throwError(() => errorMessage);
  }

}
