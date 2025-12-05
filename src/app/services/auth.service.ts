import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, delay, finalize, map, switchMap, take, tap } from 'rxjs/operators';
import { throwError, Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { JwtHelperService } from '@auth0/angular-jwt'
import { LogsService } from './logs.service';
import { Environment } from '@/environment';
import { AppComponent } from 'src/app.component';
import { LoadingService } from './loading.service';
import { StoreService } from './store.service';
import { NgToastService } from 'ng-angular-popup';
import { ApiService } from './api.service';
// import { HttpErrorHandler } from '@/helper/handler/http-error-handler';


@Injectable({
  providedIn: 'root'
})

export class AuthService {

  private apiUrl: string = Environment.apiUrl;
  private tokenPayload: any;


  private jwtHelper = new JwtHelperService();

  constructor(private http: HttpClient, private router: Router,
    private logger: LogsService, private store: StoreService,
    private api: ApiService,
    private loading: LoadingService, private toast: NgToastService,
    // private errorHandler: HttpErrorHandler
  ) {
    this.tokenPayload = this.getTokenPayloadFromToken();
  }


  registerUser(userAccount: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}UserAccount/Create/`, userAccount)
      .pipe(
        catchError((err) => this.handleError(err)),
        // catchError((err) => this.errorHandler.handle(err)),
      );
  }

  // login(userAccount: any): Observable<any> {
  //   this.loading.setLoadingVisible(true);
  //   this.logger.printLogs('i', 'Logging in...', userAccount);

  //   return of(userAccount).pipe(
  //     delay(3000),
  //     switchMap(account =>
  //       this.http.post<any>(`${this.apiUrl}Auth/`, account).pipe(
  //         catchError((err) =>
  //           this.handleError(err)),
  //         // this.errorHandler.handle(err)),
  //         finalize(() => {
  //           this.loading.setLoadingVisible(false);
  //           this.logger.printLogs('i', 'Finished login process', userAccount);
  //         })
  //       )
  //     )
  //   );
  // }

  login(credentials: any): Observable<any> {
    this.loading.setLoadingVisible(true);
    this.logger.printLogs('i', 'Logging in...', credentials);

    return this.http.post<any>(`${this.apiUrl}Auth/`, credentials).pipe(
      switchMap(res => {
        // expect res.token or similar
        const token = res?.token;
        if (!token) {
          throw new Error('Token not returned from server.');
        }

        // store token
        localStorage.setItem('token', token);

        // decode payload synchronously
        const payload = this.jwtHelper.decodeToken(token);
        this.store.setTokenPayload(payload);
        this.logger.printLogs('i', 'Decoded token payload', payload);

        // fetch full user by username then privileges (no nested subscriptions)
        return this.api.GetUserbyUsername(payload.unique_name).pipe(
          take(1),
          switchMap((user: any) => {
            this.store.setUser(user);
            // retrieve privileges by roleID
            return this.api.getPrivelegeByRole(user.roleID).pipe(
              tap((privs: any[]) => {
                this.logger.printLogs('i', 'Setting Privilege', privs);
                this.store.setPrivilege(privs || []);
              }),
              // map back to original server response so caller can still use it
              map(() => res)
            );
          })
        );
      }),
      catchError(err => {
        this.logger.printLogs('e', 'Login error', err);
        throw err; // let component handle showing messages or use a global handler
      }),
      finalize(() => {
        this.loading.setLoadingVisible(false);
        this.logger.printLogs('i', 'Finished login process', credentials);
      })
    );
  }

  getTokenPayloadFromToken(): Observable<any | null> {
    const token = localStorage.getItem('token');
    if (!token || this.jwtHelper.isTokenExpired(token)) {
      return of(null);
    }

    const payload = this.jwtHelper.decodeToken(token);
    this.store.setTokenPayload(payload);

    return this.store.getUser().pipe(
      switchMap(user => {
        if (user) {
          return of(payload);
        }

        return this.api.GetUserbyUsername(payload.unique_name).pipe(
          tap(userRes => {
            this.store.setUser(userRes);
            this.store.loadPrivileges();
            // this.logger.printLogs('i', 'User loaded', userRes);
            // this.logger.printLogs('i', 'Privilege loaded', this.store.getPrivileges());
          }),
          map(() => payload),
          catchError(err => {
            this.logger.printLogs('w', 'Error during hydration', err);
            return of(payload);
          })
        );
      })
    );
  }


  register(userAccount: any): Observable<any> {
    this.loading.setLoadingVisible(true);
    this.logger.printLogs('i', 'Processing Registration...', userAccount);

    return of(userAccount).pipe(
      delay(3000), // ⏳ Simulate a 3-second delay
      switchMap(account =>
        this.http.post<any>(`${this.apiUrl}Auth/register/`, account).pipe(
          catchError((err) => this.handleError(err)),
          // catchError((err) => this.errorHandler.handle(err)),
          finalize(() => {
            this.loading.setLoadingVisible(false);
            this.logger.printLogs('i', 'Finished register process', userAccount);
          })
        )
      )
    );
  }

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

  getRoleFromToken() {
    if (this.tokenPayload) {
      return this.tokenPayload.role;
    }
  }

  getUsernameFromToken(): Observable<string | null> {
    const token = localStorage.getItem('token');
    if (token && !this.jwtHelper.isTokenExpired(token)) {
      const decodedToken = this.jwtHelper.decodeToken(token);
      this.tokenPayload = decodedToken;
      return of(decodedToken?.unique_name || null); // Adjust according to your token's structure
    } else {
      return of(null);
    }
  }

  // getTokenPayloadFromToken(): Observable<string | null> {
  //   const token = localStorage.getItem('token');
  //   if (token && !this.jwtHelper.isTokenExpired(token)) {
  //     const decodedToken = this.jwtHelper.decodeToken(token);
  //     this.tokenPayload = decodedToken;
  //     this.store.setTokenPayload(this.tokenPayload);
  //     // this.logger.printLogs('i', "Decoded Token: ", decodedToken);
  //     return of(decodedToken?.unique_name || null); // Adjust according to your token's structure
  //   } else {
  //     return of(null);
  //   }
  // }
  // getTokenPayloadFromToken(): Observable<any | null> {
  //   const token = localStorage.getItem('token');

  //   if (token && !this.jwtHelper.isTokenExpired(token)) {
  //     const payload = this.jwtHelper.decodeToken(token);
  //     this.store.setTokenPayload(payload);
  //     return of(payload);  // return full payload
  //   }

  //   return of(null);
  // }


  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Unknown error!';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else if (error instanceof HttpErrorResponse) {

      this.logger.printLogs('i', 'Pipe Error', error);
      this.logger.printLogs('i', 'Pipe Error', `Status: " ${error.status}`);
      if (error.status == 0) {
        errorMessage = "Failed to establish connection!";
        this.toast.warning(`${error.error.message} due to connectivity issue. Please contact the system administrator.`, "Connectivity Error!", 0);

      } else if (error.status == 400) {// Check if the error response has a message property
        if (error.error && error.error.message) {
          // Display the custom message from the API
          errorMessage = error.error.message;
          this.toast.warning(error.error.message, "Error!", 5000);
        } else {
          // Handle validation errors
          const validationErrors = error.error?.errors;

          if (validationErrors) {
            for (const key in validationErrors) {
              if (validationErrors.hasOwnProperty(key)) {
                const messages = validationErrors[key];
                if (Array.isArray(messages)) {
                  messages.forEach((message: string) => {
                    this.toast.warning(message, "Validation Error!", 5000);
                  });
                } else {
                  // If messages is not an array, display a custom message
                  this.toast.warning(messages, "Validation Error!", 5000); // Assuming messages is a string
                }
              }
            }
          } else {
            // Handle generic bad request error
            this.toast.warning("An unknown error occurred.", "Error!", 5000);
          }
        }
      } else if (error.status === 401) {

        errorMessage = error.error?.message || "Token is Expired!, Please login again!"; // Get the message from the error response
        // toast.warning("Token is Expired!, Please login again! " + err.status, "Warning!", 5000);
        this.toast.warning(errorMessage, "Warning!", 5000);
        this.exit();

      } else if (error.status === 404) {
        errorMessage = error.error?.message;
        // toast.warning(err.error.message, "Not Found!", 5000);
      } else if (error.status === 409) {
        this.logger.printLogs('i', 'Conflict Error', error);
        errorMessage = error.error.message;
        // toast.warning(err.error.message, "Conflict Error!", 5000);
      } else if (error.status === 500) {
        errorMessage = error.error.message;
        // toast.error("Internal Server Error! Please contact the system administrator.", "Server Error!", 0);
      }
    } else {
      errorMessage = `Server Error`;
    }

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
