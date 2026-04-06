import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, delay, finalize, map, Observable, throwError } from 'rxjs';
import { Environment } from '../environment';
import { LogsService } from './logs.service';
import { NgToastService } from 'ng-angular-popup';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { LoadingService } from './loading.service';
import { AuthService } from './auth.service';
// import { HttpErrorHandler } from '@/helper/handler/http-error-handler';


@Injectable({
  providedIn: 'root'
})


export class ApiService {


  private apiUrl: string = Environment.apiUrl;

  constructor(private http: HttpClient, private router: Router,
    private logger: LogsService, private toast: NgToastService,
    private loading: LoadingService
    // private errorHandler: HttpErrorHandler
  ) { }


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

  // private handleRequest<T>(
  //   method: 'get' | 'post' | 'put' | 'delete',
  //   endpoint: string,
  //   options?: { id?: any; body?: any; logAction?: string; minDuration?: number }
  // ): Observable<T> {
  //   this.loading.setLoadingVisible(true);

  //   const { id, body, logAction, minDuration = 500 } = options || {};
  //   const url = id ? `${this.apiUrl}${endpoint}/${id}` : `${this.apiUrl}${endpoint}/`;

  //   this.logger.printLogs('i', logAction || `${method.toUpperCase()} request`, body || id || '');

  //   let request$: Observable<any>;
  //   switch (method) {
  //     case 'get':
  //       request$ = this.http.get<any>(url);
  //       break;
  //     case 'post':
  //       request$ = this.http.post<any>(url, body);
  //       break;
  //     case 'put':
  //       request$ = this.http.put<any>(url, body);
  //       break;
  //     case 'delete':
  //       request$ = this.http.delete<any>(url, body ? {
  //         body: body,
  //         headers: { 'Content-Type': 'application/json' }
  //       } : undefined);
  //       break;
  //   }

  //   const startTime = Date.now();

  //   return request$.pipe(
  //     map((res: any) => {
  //       // normalize array-like responses
  //       if (Array.isArray(res)) return res;
  //       if (res && Array.isArray(res.items)) return res.items;
  //       return res;
  //     }),
  //     catchError((err) =>
  //       throwError(() => err)),
  //     // this.handleError(err)),
  //     // this.errorHandler.handle(err)),
  //     finalize(() => {
  //       const elapsed = Date.now() - startTime;
  //       const remaining = minDuration - elapsed;

  //       if (remaining > 0) {
  //         // wait until minimum duration is reached
  //         setTimeout(() => {
  //           this.loading.setLoadingVisible(false);
  //           this.logger.printLogs('i', `Finished ${logAction || method}`, endpoint);
  //         }, remaining);
  //       } else {
  //         this.loading.setLoadingVisible(false);
  //         this.logger.printLogs('i', `Finished ${logAction || method}`, endpoint);
  //       }
  //     })
  //   );
  // }

  private handleRequest<T>(
    method: 'get' | 'post' | 'put' | 'delete',
    endpoint: string,
    options?: {
      id?: any;
      body?: any;
      params?: Record<string, any>;   // 🔥 NEW
      logAction?: string;
      minDuration?: number;
    }
  ): Observable<T> {

    this.loading.setLoadingVisible(true);

    const {
      id,
      body,
      params,
      logAction,
      minDuration = 500
    } = options || {};

    const url = id
      ? `${this.apiUrl}${endpoint}/${id}`
      : `${this.apiUrl}${endpoint}`;

    this.logger.printLogs(
      'i',
      logAction || `${method.toUpperCase()} request`,
      body || params || id || ''
    );

    let request$: Observable<any>;

    switch (method) {
      case 'get':
        request$ = this.http.get<any>(url, { params });
        break;

      case 'post':
        request$ = this.http.post<any>(url, body, { params });
        break;

      case 'put':
        request$ = this.http.put<any>(url, body, { params });
        break;

      case 'delete':
        request$ = this.http.delete<any>(url, {
          body,
          params,
          headers: { 'Content-Type': 'application/json' }
        });
        break;
    }

    const startTime = Date.now();

    return request$.pipe(
      map((res: any) => {
        // normalize common API response shapes
        if (Array.isArray(res)) return res;
        if (res?.items && Array.isArray(res.items)) return res.items;
        return res;
      }),

      catchError(err => {
        this.logger.printLogs('e', 'API Error', err);
        return throwError(() => err);
      }),

      finalize(() => {
        const elapsed = Date.now() - startTime;
        const remaining = minDuration - elapsed;

        const finish = () => {
          this.loading.setLoadingVisible(false);
          this.logger.printLogs(
            'i',
            `Finished ${logAction || method.toUpperCase()}`,
            endpoint
          );
        };

        remaining > 0 ? setTimeout(finish, remaining) : finish();
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
      catchError((err) =>
        this.handleError(err)),
      // this.errorHandler.handle(err)),
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

  /*----------------------- DASHBOARD -----------------------*/

  getDashboardSummary(params?: any) {
    return this.handleRequest<any>(
      'get',
      'dashboard/summary',
      {
        params,
        logAction: 'Fetching Dashboard Summary'
      }
    );
  }

  getAdminPosts(page: number, pageSize: number) {
    return this.handleRequest<any[]>(
      'get',
      'Dashboard/AdminPosts',
      {
        params: { page, pageSize },
        logAction: 'Fetch Admin Posts'
      }
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


  /*----------------------- ROLES -----------------------*/
  getRoles() {
    return this.handleRequest<any[]>('get', 'Roles', { logAction: 'Fetching Roles' });
  }

  createRole(role: any) {
    return this.handleRequest('post', 'Roles', { body: role, logAction: 'Creating Role' });
  }

  updateRole(id: string, role: any) {
    return this.handleRequest('put', 'Roles', { id, body: role, logAction: 'Updating Role' });
  }

  deleteRole(id: number) {
    return this.handleRequest('delete', 'Roles', { id, logAction: 'Deleting Role' });
  }

  /*----------------------- MODULES -----------------------*/



  /*----------------------- PRIVILEGES -----------------------*/
  getPrivelegeByRole(roleID: any) {
    return this.handleRequest<any[]>('get', 'Privileges/Role/' + roleID, { logAction: `Fetching Privileges By Role ${roleID}` });
  }

  retrieveModules() {
    return this.handleRequest<any[]>('get', 'Privileges/Modules', { logAction: `Fetching Privileges By Modules` });
  }

  createPrivilege(privileges: any[]) {
    return this.handleRequest('post', 'Privileges', { body: privileges, logAction: 'Creating Privileges' });
  }

  updatePrivilege(privilegeID: string, privileges: any[]): Observable<any> {
    return this.handleRequest('put', 'Privileges', { id: privilegeID, body: privileges, logAction: 'Updating Privileges' });
  }

  /*----------------------- USERS -----------------------*/
  getUsers() {
    return this.handleRequest<any[]>('get', 'Users', { logAction: 'Fetching Users' });
  }

  getUserAccount(id: string) {
    return this.handleRequest<any[]>('get', 'Users', { id: id, logAction: 'Fetching Users' });
  }

  GetUserbyUsername(userame: string): Observable<any> {
    return this.handleRequest<any[]>('get', 'Users/GetUserbyUsername', { id: userame, logAction: `Fetching User By Username ${userame}` });
  }

  GetStudentBySchoolCoordinatorID(coordinatorID: string): Observable<any> {
    return this.handleRequest<any[]>('get', 'Users/GetStudentBySchoolCoordinatorID', { id: coordinatorID, logAction: `Fetching Students By School Coordinator ID ${coordinatorID}` });
  }

  GetClinicalInstructorBySchoolCoordinatorID(coordinatorID: string): Observable<any> {
    return this.handleRequest<any[]>('get', 'Users/GetClinicalInstructorBySchoolCoordinatorID', { id: coordinatorID, logAction: `Fetching Clinical Instructors By School Coordinator ID ${coordinatorID}` });
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

  updateUserStatus(status: any, userIDs: string[]) {
    return this.handleRequest('put', `Users/status/${status}`, {
      body: userIDs,
      logAction: 'Update User Status'
    });
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

      catchError((err) =>
        this.handleError(err)),
      // this.errorHandler.handle(err)),
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

  /*----------------------- SLOTS -----------------------*/

  getSlots(year?: number) {
    this.logger.printLogs('i', ' On getSlots Selected year', year);
    return this.handleRequest<any[]>('get', 'Slots', year ? { params: { year }, logAction: 'Fetching Slots' } : { logAction: 'Fetching Slots' });
  }

  getSlotsByUserID(userID: string, year?: number) {
    this.logger.printLogs('i', ' On getSlotsByUserID Selected year', year);
    return this.handleRequest<any[]>('get', 'Slots/user', year ? { id: userID, params: { year }, logAction: 'Fetching Slots By User' } : { id: userID, logAction: 'Fetching Slots By User' });
  }
  
  getSlotsByCI(CIID: string, year?: number) {
    this.logger.printLogs('i', ' On getSlotsByCI Selected year', year);
    return this.handleRequest<any[]>('get', 'Slots/ci', year ? { id: CIID, params: { year }, logAction: 'Fetching Slots By CI' } : { id: CIID, logAction: 'Fetching Slots By CI' });
  }

  getSlotsByHospitalID(hospitalID: string, year?: number) {
    this.logger.printLogs('i', ' On getSlotsByHospitalID Selected year', year);
    return this.handleRequest<any[]>('get', 'Slots/hospital', year ? { id: hospitalID, params: { year }, logAction: 'Fetching Slots By Hospital' } : { id: hospitalID, logAction: 'Fetching Slots By Hospital' });
  }

  getSlotsBySchoolID(schoolID: string, year?: number) {
    this.logger.printLogs('i', ' On getSlotsBySchoolID Selected year', year);
    return this.handleRequest<any[]>('get', 'Slots/school', year ? { id: schoolID, params: { year }, logAction: 'Fetching Slots By School' } : { id: schoolID, logAction: 'Fetching Slots By School' });
  }

  GetSlotsByAppointUserID(userID: string, year?: number) {
    this.logger.printLogs('i', ' On GetSlotsByAppointUserID Selected year', year);
    return this.handleRequest<any[]>('get', 'Slots/user/appointed', year ? { id: userID, params: { year }, logAction: 'Fetching Appointed Slots By User' } : { id: userID, logAction: 'Fetching Appointed Slots By User' });
  }

  // getSlotsByRange(start: string, end: string) {
  //   return this.handleRequest<any[]>('get', 'Slots/range', { params: { start, end }, logAction: 'Fetch Slots By Range' });
  // }
  getSlotsByRange(start: string, end: string, roleID?: string, userID?: string, hospitalID?: string) {
    const params: any = { start, end, roleID };

    // ✅ Attach userID only if it exists
    if (userID) {
      params.userID = userID;
    }

    if (hospitalID) {
      params.hospitalID = hospitalID;
    }

    return this.handleRequest<any[]>(
      'get',
      'Slots/range',
      { params, logAction: 'Fetch Slots By Range' }
    );
  }

  getSlotsByAllocationIDs(payload: { AllocationID: string[] }) {
    return this.handleRequest<any[]>('post', 'Slots/byAllocation', { body: payload, logAction: 'Fetching Slots By AllocationIDs' });
  }

  isConfirmSlot(slotID: string) {
    return this.handleRequest<any[]>('get', 'Slots/is-confirmed', { id: slotID, logAction: 'Fetching Slots' });
  }

  validateSlots(slots: any[]) {
    return this.handleRequest('post', 'Slots/bulk/validate', { body: slots, logAction: 'Validating Slots' });
  }

  confirmSlots(request: any, force = false) {
    return this.handleRequest('post', `Slots/bulk/confirm/${force}`, { body: request, logAction: 'Confirming Slots' });
  }

  createBulkSlots(slots: any) {
    return this.handleRequest('post', 'Slots/bulk', { body: slots, logAction: 'Creating Bulk Slots' });
  }

  createBulkSchedules(slots: any, force = false) {
    return this.handleRequest('post', `Slots/bulk/${force}`, { body: slots, logAction: 'Creating Bulk Slots' });
  }

  assignClinicalInstructor(CIID: string, SlotIDs: string[]): Observable<any> {
    return this.handleRequest<any>('put', 'Slots/assignClinicalInstructor', {
      id: CIID,
      body: SlotIDs,
      logAction: 'Assign Clinical Instructor'
    });
  }


  updateSlotStatus(status: number, slotIDs: string[]) {
    return this.handleRequest('put', `Slots/status/${status}`, {
      body: slotIDs,
      logAction: 'Update Slot Status'
    });
  }

  validateBookingToken(bookID: string, token: string) {
    return this.handleRequest<any>(
      'get',
      `Slots/validate-booking/${bookID}?token=${token}`,
      { logAction: 'Validating Booking Token' }
    );
  }


  deleteSlot(id: any) {
    return this.handleRequest('delete', 'Slots', { id, logAction: 'Deleting Slot' });
  }

  deleteSlots(ids: string[]) {
    return this.handleRequest('delete', 'Slots/bulk', { body: ids, logAction: 'Deleting Slots' });
  }
  /*------------------- APPOINTED STUDENTS -------------------*/

  // GET: api/AppointedStudents
  getAppointedStudents() {
    return this.handleRequest<any[]>(
      'get',
      'AppointedStudents',
      { logAction: 'Fetching Appointed Students' }
    );
  }

  // GET: api/AppointedStudents/{id}
  getAppointedStudentById(id: string) {
    return this.handleRequest<any>(
      'get',
      'AppointedStudents',
      { id, logAction: 'Fetching Appointed Student By ID' }
    );
  }

  // GET: api/AppointedStudents/user/{id}
  getAppointedStudentsByUserID(userID: string) {
    return this.handleRequest<any[]>(
      'get',
      'AppointedStudents/user',
      { id: userID, logAction: 'Fetching Appointed Students By User' }
    );
  }

  // GET: api/AppointedStudents/slot/{id}
  getAppointedStudentsBySlotID(slotID: string) {
    return this.handleRequest<any[]>(
      'get',
      'AppointedStudents/slot',
      { id: slotID, logAction: 'Fetching Appointed Students By Slot' }
    );
  }

  // GET: api/AppointedStudents/hospital/{id}
  getAppointedStudentsByHospitalID(hospitalID: string) {
    return this.handleRequest<any[]>(
      'get',
      'AppointedStudents/hospital',
      { id: hospitalID, logAction: 'Fetching Appointed Students By Hospital' }
    );
  }

  // GET: api/AppointedStudents/hospital&section?hid=&sid=
  getAppointedStudentsByHospitalAndSection(hid: string, sid: string) {
    return this.handleRequest<any[]>(
      'get',
      'AppointedStudents/hospital&section',
      {
        params: { hid, sid },
        logAction: 'Fetching Appointed Students By Hospital & Section'
      }
    );
  }

  // GET: api/AppointedStudents/range
  getAppointedStudentsByRange(
    start: string,
    end: string,
    userId?: string
  ) {
    const params: any = { start, end };

    if (userId) {
      params.userId = userId;
    }

    return this.handleRequest<any[]>(
      'get',
      'AppointedStudents/range',
      {
        params,
        logAction: 'Fetching Appointed Students By Date Range'
      }
    );
  }

  // POST: api/AppointedStudents
  createAppointedStudent(payload: any) {
    return this.handleRequest<any>(
      'post',
      'AppointedStudents',
      {
        body: payload,
        logAction: 'Creating Appointed Student'
      }
    );
  }

  // POST: api/AppointedStudents/bulk-by-slot
  bulkReplaceAppointedStudentsBySlot(payload: any) {
    return this.handleRequest<any>(
      'post',
      'AppointedStudents/bulk-by-slot',
      {
        body: payload,
        logAction: 'Bulk Replace Appointed Students By Slot'
      }
    );
  }

  // PUT: api/AppointedStudents/{id}
  updateAppointedStudent(id: string, payload: any) {
    return this.handleRequest<any>(
      'put',
      'AppointedStudents',
      {
        id,
        body: payload,
        logAction: 'Updating Appointed Student'
      }
    );
  }

  // DELETE: api/AppointedStudents/{id}
  deleteAppointedStudent(id: string) {
    return this.handleRequest<any>(
      'delete',
      'AppointedStudents',
      {
        id,
        logAction: 'Deleting Appointed Student'
      }
    );
  }

  // GET: api/AppointedStudents/exists/{slotId}
  isSlotAlreadyAppointed(slotID: string) {
    return this.handleRequest<any>(
      'get',
      'AppointedStudents/exists',
      {
        id: slotID,
        logAction: 'Checking Slot Appointment Existence'
      }
    );
  }

  /*----------------------- APPOINTMENTS -----------------------*/
  getAppointments() {
    return this.handleRequest<any[]>('get', 'Appointments', { logAction: 'Fetching Appointments' });
  }

  createAppointment(appointment: any) {
    return this.handleRequest('post', 'Appointments', { body: appointment, logAction: 'Creating Appointments' });
  }

  updateAppointment(id: number, appointment: any) {
    return this.handleRequest('put', 'Appointments', { id, body: appointment, logAction: 'Updating Appointments' });
  }

  updateAppoitmentStatus(status: number, AppointmentIDs: string[]) {
    return this.handleRequest('put', `Appointments/status/${status}`, {
      body: AppointmentIDs,
      logAction: 'Update Appointment Status'
    });
  }

  deleteAppointment(id: number) {
    return this.handleRequest('delete', 'Appointments', { id, logAction: 'Deleting Appointments' });
  }


  /*----------------------- ATTENDANCES -----------------------*/
  getAttendanceBySlot(slotId: string) {
    return this.handleRequest<any[]>(
      'get',
      'attendance/slot',
      {
        id: slotId,
        logAction: 'Fetching Attendance By Slot'
      }
    );
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



  private handleError(error: any) {
    let errorMessage = 'Unknown error!';

    this.logger.printLogs('i', 'Pipe Errorzzzzz', error);
    this.logger.printLogs('i', 'Pipe Errorzzzzzzzz', `Status: " ${error.status}`);

    if (error.status == 0) {
      errorMessage = "Failed to establish connection!";
      this.toast.warning(`${error.error?.message} due to connectivity issue. Please contact the system administrator.`, "Connectivity Error!", 0);

    } else if (error.status == 400) {// Check if the error response has a message property
      if (error.error && error.error.message) {
        // Display the custom message from the API
        errorMessage = error.error?.message;
        this.toast.warning(error.error?.message, "Error!", 5000);
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

    } else if (error.status === 404) {
      errorMessage = error.error?.message;
      // toast.warning(err.error.message, "Not Found!", 5000);
    } else if (error.status === 409) {
      this.logger.printLogs('i', 'Conflict Errorzzzzzzzzzz', error);
      errorMessage = error.error?.message;
      // toast.warning(err.error.message, "Conflict Error!", 5000);
    } else if (error.status === 500) {
      errorMessage = error.error?.message;
      // toast.error("Internal Server Error! Please contact the system administrator.", "Server Error!", 0);
    }

    return throwError(() => errorMessage);
  }
}
