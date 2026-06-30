import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService } from '@/services/store.service';
import { filter, switchMap, take, tap } from 'rxjs';
import { LogsService } from '@/services/logs.service';

@Component({
    standalone: true,
    selector: 'app-stats-widget',
    imports: [CommonModule],
    templateUrl: './statswidget.component.html',
})
export class StatsWidget implements OnInit {


    @Input() data!: any;
    @Input() tokenPayload!: any;
    // @Input() user!: any;

    constructor(private store: StoreService,
        private logger: LogsService
    ) {

    }
    ngOnInit(): void {
        // this.store.getUserPayload()
        //     .pipe(
        //         filter(Boolean),
        //         tap(p => this.tokenPayload = p),
        //         switchMap(() => this.store.getPrivilegesLoaded()),
        //         switchMap(() => this.store.getUser().pipe(take(1)))
        //     )
        //     .subscribe((user) => {
        //         this.user = user;
        //         this.logger.printLogs('i', ' User', this.user);
        //     });
    }


    isSysAdmin(): boolean {
        return this.tokenPayload.role === 'UGR0001';
    }

    isAdmin(): boolean {
        return this.tokenPayload.role === 'UGR0001' || this.tokenPayload.role === 'UGR0002';
    }

    isSchoolCoordinator(): boolean {
        return this.tokenPayload.role === 'UGR0003';
    }

    isClinicalInstructor(): boolean {
        return this.tokenPayload.role === 'UGR0006';
    }

    isIntern(): boolean {
        return this.tokenPayload.role === 'UGR0004';
    }

    isSupervisor(): boolean {
        return this.tokenPayload.role === 'UGR0005';
    }
}
