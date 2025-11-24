import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, delay, finalize, map, Observable, throwError } from 'rxjs';
import { Environment } from '../environment';
import { LogsService } from './logs.service';
import { NgToastService } from 'ng-angular-popup';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { LoadingService } from './loading.service';


@Injectable({
  providedIn: 'root'
})


export class ApiService {


  private apiUrl: string = Environment.apiUrl;

  constructor(private http: HttpClient, private router: Router,
    private logger: LogsService, private toast: NgToastService,
    private loading: LoadingService) { }


  showToast(msg: string, title: string, type: 'success' | 'warning' | 'error' | 'info' = 'info') {
    const options = {
      enableHtml: true,
      progressBar: true,
      timeOut: 3000,
      closeButton: true,
    };

    // this.toastr[type](msg, title, options);
    // this.toast[type](msg, title, { timeOut: 3000 }); // Correct way to pass options
    if (type === 'error') {
      this.toast.danger(msg, title, 3000); // Use `danger()` for error to match the service
    } else {
      this.toast[type](msg, title, 3000); // Dynamic method call for success, info, and warning
    }


  }

  private handleRequest<T>(
    method: 'get' | 'post' | 'put' | 'delete',
    endpoint: string,
    options?: { id?: any; body?: any; logAction?: string; minDuration?: number }
  ): Observable<T> {
    this.loading.setLoadingVisible(true);

    const { id, body, logAction, minDuration = 500 } = options || {};
    const url = id ? `${this.apiUrl}${endpoint}/${id}` : `${this.apiUrl}${endpoint}/`;

    this.logger.printLogs('i', logAction || `${method.toUpperCase()} request`, body || id || '');

    let request$: Observable<any>;
    switch (method) {
      case 'get':
        request$ = this.http.get<any>(url);
        break;
      case 'post':
        request$ = this.http.post<any>(url, body);
        break;
      case 'put':
        request$ = this.http.put<any>(url, body);
        break;
      case 'delete':
        request$ = this.http.delete<any>(url);
        break;
    }

    const startTime = Date.now();

    return request$.pipe(
      map((res: any) => {
        // normalize array-like responses
        if (Array.isArray(res)) return res;
        if (res && Array.isArray(res.items)) return res.items;
        return res;
      }),
      catchError(this.handleError),
      finalize(() => {
        const elapsed = Date.now() - startTime;
        const remaining = minDuration - elapsed;

        if (remaining > 0) {
          // wait until minimum duration is reached
          setTimeout(() => {
            this.loading.setLoadingVisible(false);
            this.logger.printLogs('i', `Finished ${logAction || method}`, endpoint);
          }, remaining);
        } else {
          this.loading.setLoadingVisible(false);
          this.logger.printLogs('i', `Finished ${logAction || method}`, endpoint);
        }
      })
    );
  }


  private handleStringRequest<T>(
    method: 'post' | 'put', // only makes sense for methods with a body
    endpoint: string,
    body: string,
    logAction?: string,
    minDuration: number = 500
  ): Observable<T> {
    this.loading.setLoadingVisible(true);

    const url = `${this.apiUrl}${endpoint}/`;
    this.logger.printLogs('i', logAction || `${method.toUpperCase()} request`, body);

    let request$: Observable<any>;
    switch (method) {
      case 'post':
        request$ = this.http.post<any>(url, `"${body}"`, {
          headers: { 'Content-Type': 'application/json' }
        });
        break;
      case 'put':
        request$ = this.http.put<any>(url, `"${body}"`, {
          headers: { 'Content-Type': 'application/json' }
        });
        break;
      default:
        throw new Error('handleStringRequest only supports POST and PUT');
    }

    const startTime = Date.now();

    return request$.pipe(
      map((res: any) => {
        if (Array.isArray(res)) return res;
        if (res && Array.isArray(res.items)) return res.items;
        return res;
      }),
      catchError(this.handleError),
      finalize(() => {
        const elapsed = Date.now() - startTime;
        const remaining = minDuration - elapsed;

        if (remaining > 0) {
          setTimeout(() => {
            this.loading.setLoadingVisible(false);
            this.logger.printLogs('i', `Finished ${logAction || method}`, endpoint);
          }, remaining);
        } else {
          this.loading.setLoadingVisible(false);
          this.logger.printLogs('i', `Finished ${logAction || method}`, endpoint);
        }
      })
    );
  }

  /*----------------------- HOSPITAL -----------------------*/
  getHospitals() {
    return this.handleRequest<any[]>('get', 'Hospitals', { logAction: 'Fetching Hospitals' });
  }

  createHospital(hospital: any) {
    return this.handleRequest('post', 'Hospitals', { body: hospital, logAction: 'Creating Hospital' });
  }

  updateHospital(id: any, hospital: any) {
    return this.handleRequest('put', 'Hospitals', { id, body: hospital, logAction: 'Updating Hospital' });
  }

  deleteHospital(id: any) {
    return this.handleRequest('delete', 'Hospitals', { id, logAction: 'Deleting Hospital' });
  }


  /*----------------------- SECTION -----------------------*/
  getSections() {
    return this.handleRequest<any[]>('get', 'Sections', { logAction: 'Fetching Sections' });
  }

  createSection(section: any) {
    return this.handleRequest('post', 'Sections', { body: section, logAction: 'Creating Section' });
  }

  updateSection(id: any, section: any) {
    return this.handleRequest('put', 'Sections', { id, body: section, logAction: 'Updating Section' });
  }

  deleteSection(id: any) {
    return this.handleRequest('delete', 'Sections', { id, logAction: 'Deleting Section' });
  }


  /*----------------------- ALLOCATIONS -----------------------*/
  getAllocations() {
    return this.handleRequest<any[]>('get', 'Allocations', { logAction: 'Fetching Allocations' });
  }

  getAllocationsByHospitalID(id: string) {
    return this.handleRequest<any>('get', `Allocations/ByHospital`, { id, logAction: `Fetching Allocations of Hospital ID : ${id}` });
  }

  createAllocation(allocation: any) {
    return this.handleRequest('post', 'Allocations', { body: allocation, logAction: 'Creating Allocation' });
  }

  createAllocationsBulk(allocation: any) {
    return this.handleRequest('post', 'Allocations/sections', { body: allocation, logAction: 'Creating Bulk Allocations' });
  }

  updateAllocationsBulk(id: string, allocations: any[]) {
    return this.handleRequest('put', 'Allocations/sections', { id, body: allocations, logAction: 'Updating Allocations' });
  }

  updateAllocation(id: number, allocation: any) {
    return this.handleRequest('put', 'Allocations', { id, body: allocation, logAction: 'Updating Allocation' });
  }

  deleteAllocation(id: number) {
    return this.handleRequest('delete', 'Allocations', { id, logAction: 'Deleting Allocation' });
  }

  
  /*----------------------- SHIFTS -----------------------*/
  getShifts() {
    return this.handleRequest<any[]>('get', 'Shifts', { logAction: 'Fetching Shifts' });
  }

  createShift(shift: any) {
    return this.handleRequest('post', 'Shifts', { body: shift, logAction: 'Creating Shift' });
  }

  updateShift(id: any, shift: any) {
    return this.handleRequest('put', 'Shifts', { id, body: shift, logAction: 'Updating Shift' });
  }

  deleteShift(id: any) {
    return this.handleRequest('delete', 'Shifts', { id, logAction: 'Deleting Shift' });
  }


  /*----------------------- SLOTS -----------------------*/

  getSlots() {
    return this.handleRequest<any[]>('get', 'Slots', { logAction: 'Fetching Slots' });
  }

  createBulkSlots(slots: any) {
    return this.handleRequest('post', 'Slots/bulk', { body: slots, logAction: 'Creating Bulk Slots' });
  }


  /*----------------------- ROLES -----------------------*/
  getRoles() {
    return this.handleRequest<any[]>('get', 'Roles', { logAction: 'Fetching Roles' });
  }

  createRole(role: any) {
    return this.handleRequest('post', 'Roles', { body: role, logAction: 'Creating Role' });
  }


  /*----------------------- USERS -----------------------*/
  getUsers() {
    return this.handleRequest<any[]>('get', 'Users', { logAction: 'Fetching Users' });
  }

  createUser(section: any) {
    return this.handleRequest('post', 'Users', { body: section, logAction: 'Creating User' });
  }

  updateUser(id: string, section: any) {
    return this.handleRequest('put', 'Users', { id, body: section, logAction: 'Updating User' });
  }

  deleteUser(id: number) {
    return this.handleRequest('delete', 'Users', { id, logAction: 'Deleting User' });
  }

  sendVerification(email: string) {
    return this.handleStringRequest('post', 'Users/resend-verification', email, 'Resend Verification');
  }

  approve(email: string) {
    return this.handleStringRequest('post', 'Users/approve', email, 'Account Approval');
  }

  changePassword(id: string, newPassword: any) {
    return this.handleStringRequest('put', `Users/${id}/change-password`, newPassword, 'Change Password');
  }

  resendVerification(email: string) {
    this.loading.setLoadingVisible(true); // show before the request starts

    return this.http.post<any>(
      `${this.apiUrl}Users/resend-verification/`,
      `"${email}"`,
      {
        headers: { 'Content-Type': 'application/json' }
      }
    ).pipe(
      catchError(this.handleError.bind(this)),
      finalize(() => this.loading.setLoadingVisible(false)) // always hide after completion (success/error)
    );
  }


  /*----------------------- SCHOOLS -----------------------*/
  getSchools() {
    return this.handleRequest<any[]>('get', 'Schools', { logAction: 'Fetching Schools' });
  }

  checkSchoolCode(code: string) {
    return this.handleStringRequest('post', 'Schools/schoolCode', code, 'Checking School Code');
  }

  createSchool(section: any) {
    return this.handleRequest('post', 'Schools', { body: section, logAction: 'Creating Schools' });
  }

  updateSchool(id: number, section: any) {
    return this.handleRequest('put', 'Schools', { id, body: section, logAction: 'Updating Schools' });
  }
  updateSchoolStatus(status: number, schoolIDs: string[]) {
    return this.handleRequest('put', `Schools/status/${status}`, {
      body: schoolIDs,
      logAction: 'Update School Status'
    });
  }

  assignCoordinator(coordinatorID: string, schoolIDs: string[]): Observable<any> {
    return this.handleRequest<any>('put', 'Schools/assignCoordinator', {
      id: coordinatorID,
      body: schoolIDs,
      logAction: 'Assign Coordinator'
    });
  }

  deleteSchool(id: number) {
    return this.handleRequest('delete', 'Schools', { id, logAction: 'Deleting Schools' });
  }






  /*----------------------- HOSPITAL -----------------------*/

  // SHOW hospital
  /*
  getHospitals(): Observable<any[]> {
    this.loading.setLoadingVisible(true);
    this.logger.printLogs('i', 'Fetching list of', 'Hospitals');

    return this.http.get<any>(`${this.apiUrl}Hospitals/`).pipe(
      delay(3000), // ⏳ Simulate a 3-second delay
      map((res) => {
        // Normalize: support both { items: [...] } and plain array
        if (Array.isArray(res)) {
          return res;
        } else if (res && Array.isArray(res.items)) {
          return res.items;
        }
        return []; // fallback
      }),
      catchError(this.handleError),
      finalize(() => {
        this.loading.setLoadingVisible(false);
        this.logger.printLogs('i', 'Finished fetching', 'Hospitals');
      })
    );
  }
*/
  // CREATE hospital

  /*
  createHospital(hospital: any): Observable<any> {
    this.loading.setLoadingVisible(true);
    this.logger.printLogs('i', 'Creating Hospital', hospital);

    return this.http.post<any>(`${this.apiUrl}Hospitals/`, hospital).pipe(
      catchError(this.handleError),
      finalize(() => {
        this.loading.setLoadingVisible(false);
        this.logger.printLogs('i', 'Finished creating', 'Hospital');
      })
    );
  }
*/
  // UPDATE hospital

  /*
  updateHospital(hospitalID: number, hospital: any): Observable<any> {
    this.loading.setLoadingVisible(true);
    this.logger.printLogs('i', 'Updating Hospital', hospital);

    return this.http.put<any>(`${this.apiUrl}Hospitals/${hospitalID}`, hospital).pipe(
      catchError(this.handleError),
      finalize(() => {
        this.loading.setLoadingVisible(false);
        this.logger.printLogs('i', 'Finished updating', 'Hospital');
      })
    );
  }
    */


  // DELETE hospital
  /*
  deleteHospital(hospitalID: number): Observable<any> {
    this.loading.setLoadingVisible(true);
    this.logger.printLogs('i', 'Deleting Hospital ID', hospitalID);

    return this.http.delete<any>(`${this.apiUrl}Hospitals/${hospitalID}`).pipe(
      catchError(this.handleError),
      finalize(() => {
        this.loading.setLoadingVisible(false);
        this.logger.printLogs('i', 'Finished deleting', 'Hospital');
      })
    );
  }
*/

  /*----------------------- SECTION -----------------------*/

  // SHOW sections
  /*
  getSections(): Observable<any[]> {
    this.loading.setLoadingVisible(true);
    this.logger.printLogs('i', 'Fetching list of', 'Sections');

    return this.http.get<any>(`${this.apiUrl}Sections/`).pipe(
      delay(3000),
      map((res) => {
        if (Array.isArray(res)) {
          return res;
        } else if (res && Array.isArray(res.items)) {
          return res.items;
        }
        return [];
      }),
      catchError(this.handleError),
      finalize(() => {
        this.loading.setLoadingVisible(false);
        this.logger.printLogs('i', 'Finished fetching', 'Sections');
      })
    );
  }
  */

  // CREATE section
  /*
  createSection(section: any): Observable<any> {
    this.loading.setLoadingVisible(true);
    this.logger.printLogs('i', 'Creating Section', section);

    return this.http.post<any>(`${this.apiUrl}Sections/`, section).pipe(
      catchError(this.handleError),
      finalize(() => {
        this.loading.setLoadingVisible(false);
        this.logger.printLogs('i', 'Finished creating', 'Section');
      })
    );
  }
  */

  // UPDATE section
  /*
  updateSection(sectionID: number, section: any): Observable<any> {
    this.loading.setLoadingVisible(true);
    this.logger.printLogs('i', 'Updating Section', section);

    return this.http.put<any>(`${this.apiUrl}Sections/${sectionID}`, section).pipe(
      catchError(this.handleError),
      finalize(() => {
        this.loading.setLoadingVisible(false);
        this.logger.printLogs('i', 'Finished updating', 'Section');
      })
    );
  }
*/

  // DELETE section
  /*
  deleteSection(sectionID: number): Observable<any> {
    this.loading.setLoadingVisible(true);
    this.logger.printLogs('i', 'Deleting Section ID', sectionID);

    return this.http.delete<any>(`${this.apiUrl}Sections/${sectionID}`).pipe(
      catchError(this.handleError),
      finalize(() => {
        this.loading.setLoadingVisible(false);
        this.logger.printLogs('i', 'Finished deleting', 'Section');
      })
    );
  }
*/

  /*----------------------- ERROR HANDLING -----------------------*/
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Unknown error!';

    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Backend (server-side) error
      if (error.error) {
        if (typeof error.error === 'string') {
          // In case backend accidentally returns plain text
          errorMessage = error.error + "-error.error.String";
        } else if (error.error.message) {
          // Your backend always sends: { message: "..." }
          errorMessage = error.error.message + "-error.error.message";;
        } else if (error.error.errors) {
          // ASP.NET Core validation errors (ModelState)
          const validationErrors = error.error.errors;
          const messages: string[] = [];

          for (const field in validationErrors) {
            if (validationErrors.hasOwnProperty(field)) {
              messages.push(`${field}: ${validationErrors[field].join(', ')} <br>`);
            }
          }

          errorMessage = messages.join(' | ');
        } else if (error.error.title) {
          // Fallback for default problem details object
          errorMessage = error.error.title + "-error.error.title";;;
        } else {
          // errorMessage = `Server returned code ${error.status}<br>Please contact the system administrator.`;
        }
      } else {
        errorMessage = error.message || `Server returned code ${error.status}` + "-else.Server.returned.code";
      }
    }

    return throwError(() => errorMessage);
  }



}
