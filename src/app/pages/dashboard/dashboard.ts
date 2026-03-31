import { Component, OnDestroy, OnInit } from '@angular/core';
import { NotificationsWidget } from './components/notificationswidget';
import { StatsWidget } from './components/statswidget';
import { RecentSchedule } from './components/recentschedule';
import { AnnouncementWidget } from './components/announcemenswidget';
import { RevenueStreamWidget } from './components/revenuestreamwidget';
import { ApiService } from '@/services/api.service';
import { AuthService } from '@/services/auth.service';
import { StoreService } from '@/services/store.service';
import { LogsService } from '@/services/logs.service';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, filter, interval, Subject, switchMap, take, takeUntil, tap } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-dashboard',
    imports: [CommonModule, StatsWidget, RecentSchedule, AnnouncementWidget, RevenueStreamWidget, NotificationsWidget],
    template: `
        <div class="grid grid-cols-12">
            <div class="col-span-12 xl:col-span-12">
                
                <div *ngIf="dashboardData">
                    <app-stats-widget class="contents" [data]="dashboardData" [tokenPayload]="tokenPayload"
                    />
                </div>
                <!-- <app-announcements-widget [tokenPayload]="tokenPayload" /> -->
                
            </div>
            <div class="col-span-12 xl:col-span-12 gap-2">
                
                
                <!-- <div *ngIf="dashboardData">
                    <app-stats-widget class="contents" [data]="dashboardData" [tokenPayload]="tokenPayload"
                    />
                </div> -->
                <!-- <app-revenue-stream-widget 
                *ngIf="dashboardData"
                    [actual]="dashboardData.actualRevenue"
                    [potential]="dashboardData.potentialRevenue">
                </app-revenue-stream-widget> -->
                <app-recent-analytics-widget [slots]="slots" [recentSchedules]="recentSchedules" [tokenPayload]="tokenPayload"/>
                <!-- <app-notifications-widget /> -->
            </div>
        </div>
    `
})

export class Dashboard implements OnInit, OnDestroy {


    user: any = null;
    privileges: any[] = [];

    tokenPayload: any | null;

    recentSchedules: any[] = [];
    slots: any[] = [];

    dashboardData!: any;
    private destroy$ = new Subject<void>();


    currentYear: number = 0;

    constructor(
        public store: StoreService,
        private api: ApiService,
        private logger: LogsService
    ) { }

    ngOnInit() {
        // Load privileges only once when user becomes available
        // this.store.getUser()
        //     .pipe(take(1))
        //     .subscribe(user => {
        //         if (user) {
        //             this.store.loadPrivileges();  // USE YOUR EXISTING FUNCTION
        //         }
        //     });

        // combineLatest([
        //     this.store.getUser(),
        //     this.store.getPrivileges()
        // ])
        //     .pipe(
        //         filter(([user, priv]) => !!user && priv.length > 0), // both ready
        //         take(1)
        //     )
        //     .subscribe(([user, priv]) => {
        //         this.logger.printLogs('i', 'User + Privileges FULLY LOADED ✔', { user, priv });
        //     });


        // Get logged user payload
        // this.store.getUserPayload()
        //     .pipe(
        //         filter(Boolean),
        //         takeUntil(this.destroy$)
        //     )
        //     .subscribe(payload => {
        //         this.tokenPayload = payload;
        //         this.loadRecentSchedules();
        //     });

        this.currentYear = new Date().getFullYear()


        this.store.getUserPayload()
            .pipe(
                filter(Boolean),
                tap(p => this.tokenPayload = p),
                switchMap(() => this.store.getPrivilegesLoaded()),
                switchMap(() => this.store.getUser().pipe(take(1)))
            )
            .subscribe((user) => {
                this.user = user;
                this.logger.printLogs('i', ' Tokenpayload ', this.tokenPayload);
                this.logger.printLogs('i', ' User ', this.user);
                // interval(60000).subscribe(() => {
                this.loadDashboard();
                this.loadRecentSchedules();
                // });
            });
    }



    // loadDashboard() {
    //     this.api.getDashboardSummary()
    //         .pipe(takeUntil(this.destroy$))
    //         .subscribe({
    //             next: (res) => {
    //                 this.dashboardData = res;
    //                 this.logger.printLogs('i', 'Dashboard Loaded', res);
    //             },
    //             error: (err) => {
    //                 this.logger.printLogs('e', 'Dashboard Error', err);
    //             }
    //         });
    // }

    loadDashboard() {

        if (!this.tokenPayload) return;

        const roleId = this.tokenPayload.role;
        const userId = this.tokenPayload.nameid;

        const params: any = {
            userId: userId,
            roleId: roleId,
            // startDate: this.startDate ?? null,
            // endDate: this.endDate ?? null,
            // allocationId: this.selectedAllocation ?? null,
            // shiftId: this.selectedShift ?? null
        };

        this.api.getDashboardSummary(params)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    this.dashboardData = res;
                    this.logger.printLogs('i', 'Dashboard Loaded', res);
                },
                error: (err) => {
                    this.logger.printLogs('e', 'Dashboard Error', err);
                }
            });
    }

    loadRecentSchedules() {
        if (!this.tokenPayload) return;
        const role = this.tokenPayload.role;
        const userID = this.tokenPayload.nameid;
        const hospitalID = this.user.hospitalID;

        if (role === 'UGR0001' || role === 'UGR0002') {
            this.api.getSlots(this.currentYear)
                .pipe(takeUntil(this.destroy$))
                .subscribe(res => this.processSlots(res));
        } else if (role === 'UGR0003') {
            this.api.getSlotsByUserID(userID, this.currentYear)
                .pipe(takeUntil(this.destroy$))
                .subscribe(res => this.processSlots(res));
        } else if (role === 'UGR0004') {
            this.api.GetSlotsByAppointUserID(userID, this.currentYear)
                .pipe(takeUntil(this.destroy$))
                .subscribe(res => this.processSlots(res));
        } else if (role === 'UGR0005') {
            this.api.getSlotsByHospitalID(hospitalID, this.currentYear)
                .pipe(takeUntil(this.destroy$))
                .subscribe(res => this.processSlots(res));
        }
    }

    processSlots(data: any[]) {

        if (!data) return;


        this.slots = data.filter(slot => slot.slotStatus === 1);

        this.logger.printLogs('i', 'All Slots', data);

        this.recentSchedules = data.filter(slot => slot.slotStatus === 1)
            .sort((a, b) =>
                new Date(b.date_created).getTime() -
                new Date(a.date_created).getTime()
            )
            .slice(0, 10);

        this.logger.printLogs('i', 'Recent Schedules', this.recentSchedules);
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    // getUserProfile() {

    //     this.store.getUserPayload()
    //         .subscribe(res => {
    //             this.logger.printLogs('i', 'User Payload', res);
    //             if (!res) {
    //                 this.auth.exit()
    //             }
    //             this.userID = res.unique_name;
    //             this.username = res.unique_name;
    //             this.role = res.role;
    //         });

    //     this.logger.printLogs('i', 'Retrieve UserID', this.userID);
    //     this.logger.printLogs('i', 'Retrieve Username', this.username);
    //     this.logger.printLogs('i', 'Retrieve Role', this.role);
    //     if (this.username)
    //         //Populate all Users
    //         this.api.GetUserbyUsername(this.username)
    //             .subscribe({
    //                 next: (res: any) => {
    //                     this.user = res;
    //                     this.logger.printLogs('i', 'User', this.user);
    //                     this.store.setUser(this.user);
    //                     this.userID = this.user.userID;
    //                     this.fullname = this.user.fullName || this.username;

    //                 },
    //                 error: (err: any) => {
    //                     this.logger.printLogs('w', 'Erron on fetching User by Username', err);
    //                 }
    //             });
    // }


}
