import { Component, OnDestroy, OnInit } from '@angular/core';
import { NotificationsWidget } from './components/notificationswidget';
import { StatsWidget } from './components/statswidget';
import { RecentSalesWidget } from './components/recentsaleswidget';
import { AnnouncementWidget } from './components/announcemenswidget';
import { RevenueStreamWidget } from './components/revenuestreamwidget';
import { ApiService } from '@/services/api.service';
import { AuthService } from '@/services/auth.service';
import { StoreService } from '@/services/store.service';
import { LogsService } from '@/services/logs.service';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, filter, Subject, switchMap, take, takeUntil, tap } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-dashboard',
    imports: [CommonModule, StatsWidget, RecentSalesWidget, AnnouncementWidget, RevenueStreamWidget, NotificationsWidget],
    template: `
        <div class="grid grid-cols-12 gap-8">
            <app-stats-widget class="contents" 
                    
            *ngIf="dashboardData"
            [data]="dashboardData"
            />
            <div class="col-span-12 xl:col-span-6">
                <app-announcements-widget />
            </div>
            <div class="col-span-12 xl:col-span-6">
                <!-- <app-revenue-stream-widget 
                *ngIf="dashboardData"
                    [actual]="dashboardData.actualRevenue"
                    [potential]="dashboardData.potentialRevenue">
                </app-revenue-stream-widget> -->
                <app-recent-sales-widget [slots]="recentSchedules"/>
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

    dashboardData!: any;
    private destroy$ = new Subject<void>();

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
        //             this.store.loadPrivileges();  // ⬅️ USE YOUR EXISTING FUNCTION
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


        this.loadDashboard();


        // 2️⃣ Get logged user payload
        this.store.getUserPayload()
            .pipe(
                filter(Boolean),
                takeUntil(this.destroy$)
            )
            .subscribe(payload => {
                this.tokenPayload = payload;
                this.loadRecentSchedules();
            });
    }

    loadDashboard() {
        this.api.getDashboardSummary()
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
        const userID = this.tokenPayload.unique_name;

        if (role === 'UGR0001' || role === 'UGR0002' || role === 'UGR0003' ) {
            this.api.getSlots()
                .pipe(takeUntil(this.destroy$))
                .subscribe(res => this.processSlots(res));
        }else if (role === 'UGR0003') {
            this.api.getSlotsByUserID(userID)
                .pipe(takeUntil(this.destroy$))
                .subscribe(res => this.processSlots(res));
        }else{

        }
    }

    processSlots(data: any[]) {

        if (!data) return;

        this.recentSchedules = data
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
