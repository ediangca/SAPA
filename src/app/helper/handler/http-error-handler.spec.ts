import { TestBed } from '@angular/core/testing';
import { HttpErrorHandler } from './http-error-handler';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '@/services/auth.service';
import { NgToastService } from 'ng-angular-popup';
import { LogsService } from '@/services/logs.service';

describe('HttpErrorHandler', () => {
  let service: HttpErrorHandler;
  let toast: jasmine.SpyObj<NgToastService>;
  let logger: jasmine.SpyObj<LogsService>;
  let auth: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    const toastSpy = jasmine.createSpyObj('NgToastService', ['warning', 'success', 'info', 'error']);
    const loggerSpy = jasmine.createSpyObj('LogsService', ['printLogs']);
    const authSpy = jasmine.createSpyObj('AuthService', ['exit']);

    TestBed.configureTestingModule({
      providers: [
        HttpErrorHandler,
        { provide: NgToastService, useValue: toastSpy },
        { provide: LogsService, useValue: loggerSpy },
        { provide: AuthService, useValue: authSpy }
      ]
    });

    toast = TestBed.inject(NgToastService) as jasmine.SpyObj<NgToastService>;
    logger = TestBed.inject(LogsService) as jasmine.SpyObj<LogsService>;
    auth = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;

    service = new HttpErrorHandler(toast, logger, auth);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should handle client-side error', (done) => {
    const err = new HttpErrorResponse({
      error: new ErrorEvent('NetworkError', { message: 'Client failed' })
    });

    service.handle(err).subscribe({
      error: msg => {
        expect(msg).toContain('Client failed');
        done();
      }
    });
  });

  it('should handle 400 with message', (done) => {
    const err = new HttpErrorResponse({
      status: 400,
      error: { message: 'Bad Request' }
    });

    service.handle(err).subscribe({
      error: msg => {
        expect(msg).toBe('Bad Request');
        expect(toast.warning).toHaveBeenCalled();
        done();
      }
    });
  });

  it('should handle 401 unauthorized', (done) => {
    const err = new HttpErrorResponse({
      status: 401,
      error: { message: 'Token expired' }
    });

    service.handle(err).subscribe({
      error: msg => {
        expect(msg).toBe('Token expired');
        expect(auth.exit).toHaveBeenCalled();
        expect(toast.warning).toHaveBeenCalled();
        done();
      }
    });
  });

  it('should handle connection failure (0)', (done) => {
    const err = new HttpErrorResponse({
      status: 0,
      error: { message: 'Network down' }
    });

    service.handle(err).subscribe({
      error: msg => {
        expect(msg).toBe('Failed to establish connection!');
        expect(toast.warning).toHaveBeenCalled();
        done();
      }
    });
  });

});
