import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subscription, interval } from 'rxjs';
import { Router } from '@angular/router';
import { Environment } from '@/environment';
import { LogsService } from './logs.service';

@Injectable({
  providedIn: 'root'
})
export class HeartbeatService {

  private heartbeatSubscription?: Subscription;
  private readonly HEARTBEAT_INTERVAL = 60000;
  private router = inject(Router);

  constructor(private http: HttpClient, private logger: LogsService) { }

  start(): void {
    if (this.heartbeatSubscription) {
      return;
    }

    this.sendHeartbeat();

    this.heartbeatSubscription = interval(this.HEARTBEAT_INTERVAL)
      .subscribe(() => {
        this.sendHeartbeat();
      });
  }

  private sendHeartbeat(): void {
    this.http.post(
      `${Environment.apiUrl}Auth/heartbeat`,
      {}
    ).subscribe({
      next: () => this.logger.printLogs('i', 'SAPA Heartbeat', 'Active'),
      error: (err) => {
        this.logger.printLogs('w', 'SAPA Heartbeat', 'Failed');


        if (err.status === 401) {
          this.forceLogout();
        }
      }
    });
  }

  private forceLogout(): void {
    this.stop();
    localStorage.removeItem('token');
    // remove any other stored auth data here

    this.router.navigate(['/login']);

    // optional: show a message
    // Swal.fire('Session Expired', 'You have been logged out due to inactivity.', 'info');
  }

  stop(): void {
    if (this.heartbeatSubscription) {
      this.heartbeatSubscription.unsubscribe();
      this.heartbeatSubscription = undefined;
      // console.log('Heartbeat stopped');
      this.logger.printLogs('e', 'SAPA Heartbeat', 'Stopped');
    }
  }

  isRunning(): boolean {
    return !!this.heartbeatSubscription;
  }
}