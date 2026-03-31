import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService } from '@/services/store.service';
import { filter, switchMap, take, tap } from 'rxjs';
import { LogsService } from '@/services/logs.service';

@Component({
    standalone: true,
    selector: 'app-stats-widget',
    imports: [CommonModule],
    template: `
    
    <div class="grid grid-cols-12 gap-3 mb-4" *ngIf="tokenPayload.role === 'UGR0001' || tokenPayload.role === 'UGR0002'">
        <!-- Pending -->
        <div class="col-span-4 lg:col-span-4 xl:col-span-3">
            <div class="card">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Pending Schedule</span>
                        <div class="text-xl font-medium">
                            {{ data?.pendingSchedule }}
                        </div>
                    <span class="text-primary font-medium">No Confirmation</span>
                    </div>
                    <div class="flex items-center justify-center bg-orange-100 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-calendar-minus text-orange-500 text-xl!"></i>
                    </div>
                </div>
            </div>
        </div>

        <!-- Confirmed -->
        <div class="col-span-4 lg:col-span-4 xl:col-span-3">
            <div class="card">
                <div class="flex justify-between mb-4">
                    <div>
                <span class="block text-muted-color font-medium mb-4">Confirmed Schedule</span>
                        <div class="text-xl font-medium">
                    {{ data?.confirmedSchedule }}
                        </div>
                    <span class="text-primary font-medium">Confirmed</span>
                    </div>
                    <div class="flex items-center justify-center bg-blue-100 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-calendar-plus text-blue-500 text-xl!"></i>
                    </div>
                </div>
            </div>
        </div>

        <!-- Students -->
        <div class="col-span-4 lg:col-span-4 xl:col-span-3">
            <div class="card">
                
                <div class="flex justify-between mb-4">
                    <div>
                <span class="block text-muted-color font-medium mb-4">Total Appointed Students</span>
                        <div class="text-xl font-medium">
                    {{ data?.totalAppointedStudents }}
                        </div>
                    <span class="text-primary font-medium">Student Appointed by Shift</span>
                    </div>
                    <div class="flex items-center justify-center bg-green-100 rounded-border" style="width: 2.5rem; height: 2.5rem">
                    <i class="pi pi-users text-green-500 text-xl!"></i>
                    </div>
                </div>
            </div>
        </div>

        <!-- Revenue -->
        <div class="col-span-4 lg:col-span-4 xl:col-span-3">
            <div class="card">
                <div class="flex justify-between mb-4">
                    <div>
                <span class="block text-muted-color font-medium mb-4">Revenue</span>
                        <div class="text-xl font-medium">
                    ₱ {{ data?.actualRevenue | number }}
                        </div>
                    <span class="text-primary font-medium">Estimated total</span>
                    </div>
                    <div class="flex items-center justify-center bg-purple-100 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-chart-line text-purple-500 text-xl!"></i>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="grid grid-cols-12 gap-3 mb-4" *ngIf="tokenPayload.role === 'UGR0005' || tokenPayload.role === 'UGR0003'">
        <!-- Pending -->
        <div class="col-span-4 lg:col-span-4 xl:col-span-4">
            <div class="card">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Pending Schedule</span>
                        <div class="text-xl font-medium">
                            {{ data?.pendingSchedule }}
                        </div>
                    <span class="text-primary font-medium">No Confirmation</span>
                    </div>
                    <div class="flex items-center justify-center bg-orange-100 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-calendar-minus text-orange-500 text-xl!"></i>
                    </div>
                </div>
            </div>
        </div>

        <!-- Confirmed -->
        <div class="col-span-4 lg:col-span-4 xl:col-span-4">
            <div class="card">
                <div class="flex justify-between mb-4">
                    <div>
                <span class="block text-muted-color font-medium mb-4">Confirmed Schedule</span>
                        <div class="text-xl font-medium">
                    {{ data?.confirmedSchedule }}
                        </div>
                    <span class="text-primary font-medium">Confirmed</span>
                    </div>
                    <div class="flex items-center justify-center bg-blue-100 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-calendar-plus text-blue-500 text-xl!"></i>
                    </div>
                </div>
            </div>
        </div>

        <!-- Students -->
        <div class="col-span-4 lg:col-span-4 xl:col-span-4">
            <div class="card">
                
                <div class="flex justify-between mb-4">
                    <div>
                <span class="block text-muted-color font-medium mb-4">Total Appointed Students</span>
                        <div class="text-xl font-medium">
                    {{ data?.totalAppointedStudents }}
                        </div>
                    <span class="text-primary font-medium">Student Appointed by Shift</span>
                    </div>
                    <div class="flex items-center justify-center bg-green-100 rounded-border" style="width: 2.5rem; height: 2.5rem">
                    <i class="pi pi-users text-green-500 text-xl!"></i>
                    </div>
                </div>
            </div>
        </div> 
       

        <!-- Revenue 
        <div class="col-span-4 lg:col-span-4 xl:col-span-6">
            <div class="card">
                <div class="flex justify-between mb-4">
                    <div>
                <span class="block text-muted-color font-medium mb-4">Revenue</span>
                        <div class="text-xl font-medium">
                    ₱ {{ data?.actualRevenue | number }}
                        </div>
                    <span class="text-primary font-medium">Estimated total</span>
                    </div>
                    <div class="flex items-center justify-center bg-purple-100 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-chart-line text-purple-500 text-xl!"></i>
                    </div>
                </div>
            </div>
        </div>
        -->
    </div>

    <div class="grid grid-cols-12 gap-3 mb-4" *ngIf="tokenPayload.role === 'UGR0004'">

        <!-- Confirmed -->
        <div class="col-span-6 lg:col-span-4 xl:col-span-6">
            <div class="card">
                <div class="flex justify-between mb-4">
                    <div>
                <span class="block text-muted-color font-medium mb-4">Total</span>
                        <div class="text-xl font-medium">
                    {{ data?.confirmedSchedule }}
                        </div>
                    <span class="text-primary font-medium">Schedule</span>
                    </div>
                    <div class="flex items-center justify-center bg-blue-100 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-calendar-plus text-blue-500 text-xl!"></i>
                    </div>
                </div>
            </div>
        </div>

        <!-- Students -->
        <div class="col-span-6 lg:col-span-4 xl:col-span-6">
            <div class="card">
                
                <div class="flex justify-between mb-4">
                    <div>
                <span class="block text-muted-color font-medium mb-4">Total</span>
                        <div class="text-xl font-medium">
                    {{ data?.totalAppointedStudents }}
                        </div>
                    <span class="text-primary font-medium">Attendance</span>
                    </div>
                    <div class="flex items-center justify-center bg-green-100 rounded-border" style="width: 2.5rem; height: 2.5rem">
                    <i class="pi pi-list-check text-green-500 text-xl!"></i>
                    </div>
                </div>
            </div>
        </div> 
    </div>
        `
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
}
