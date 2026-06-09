import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subscription, interval } from 'rxjs';

import { Environment } from '@/environment';

@Injectable({
  providedIn: 'root'
})
export class HeartbeatService {

  private heartbeatSubscription?: Subscription;
  private readonly HEARTBEAT_INTERVAL = 60000; // 1 minute

  constructor(
    private http: HttpClient
  ) { }

  // start(): void {

  //   // Prevent multiple intervals
  //   if (this.heartbeatSubscription) {
  //     return;
  //   }

  //   console.log('Heartbeat started');

  //   this.heartbeatSubscription = interval(this.HEARTBEAT_INTERVAL)
  //     .subscribe(() => {

  //       this.http.post(
  //         `${Environment.apiUrl}Auth/heartbeat`,
  //         {}
  //       ).subscribe({
  //         next: () => {
  //           console.log('Heartbeat sent');
  //         },
  //         error: (err) => {
  //           console.error('Heartbeat failed', err);
  //         }
  //       });

  //     });
  // }

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
      error: (err) => {
        console.error('Heartbeat failed', err);
      }
    });

  }

  stop(): void {

    if (this.heartbeatSubscription) {

      this.heartbeatSubscription.unsubscribe();
      this.heartbeatSubscription = undefined;

      console.log('Heartbeat stopped');
    }
  }

  isRunning(): boolean {
    return !!this.heartbeatSubscription;
  }

}