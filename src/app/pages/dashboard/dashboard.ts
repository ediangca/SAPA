import { Component, OnDestroy, OnInit } from '@angular/core';
import { NotificationsWidget } from './components/notificationswidget';
import { StatsWidget } from './components/statswidget';
import { RecentSalesWidget } from './components/recentsaleswidget';
import { BestSellingWidget } from './components/bestsellingwidget';
import { RevenueStreamWidget } from './components/revenuestreamwidget';
import { ApiService } from '@/services/api.service';
import { AuthService } from '@/services/auth.service';
import { StoreService } from '@/services/store.service';
import { LogsService } from '@/services/logs.service';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, filter, Subject, take, takeUntil } from 'rxjs';

@Component({
    selector: 'app-dashboard',
    imports: [StatsWidget, RecentSalesWidget, BestSellingWidget, RevenueStreamWidget, NotificationsWidget],
    template: `
        <div class="grid grid-cols-12 gap-8">
            <app-stats-widget class="contents" />
            <div class="col-span-12 xl:col-span-6">
                <app-recent-sales-widget />
                <app-best-selling-widget />
            </div>
            <div class="col-span-12 xl:col-span-6">
                <app-revenue-stream-widget />
                <app-notifications-widget />
            </div>
        </div>
    `
})
export class Dashboard implements OnInit {


    user: any = null;
    privileges: any[] = [];
    private destroy$ = new Subject<void>();

    constructor(
        public store: StoreService,
        private auth: AuthService,
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
