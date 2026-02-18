import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    standalone: true,
    selector: 'app-stats-widget',
    imports: [CommonModule],
    template: `
<!--     
    <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Pending Schedule</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">152</div>
                    </div>
                    <div class="flex items-center justify-center bg-orange-100 dark:bg-orange-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-calendar-minus text-orange-500 text-xl!"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">24 new </span>
                <span class="text-muted-color">since last visit</span>
            </div>
        </div>
           <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Confirmed Schedule</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">152</div>
                    </div>
                    <div class="flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-calendar-plus text-blue-500 text-xl!"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">24 new </span>
                <span class="text-muted-color">since last visit</span>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Students</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">28441</div>
                    </div>
                    <div class="flex items-center justify-center bg-cyan-100 dark:bg-cyan-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-users text-cyan-500 text-xl!"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">520 </span>
                <span class="text-muted-color">newly registered</span>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Revenue</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">$2.100</div>
                    </div>
                    <div class="flex items-center justify-center bg-orange-100 dark:bg-orange-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-dollar text-orange-500 text-xl!"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">%52+ </span>
                <span class="text-muted-color">since last week</span>
            </div>
        </div> -->

        
    <!-- Pending -->
    <div class="col-span-12 lg:col-span-6 xl:col-span-3">
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
    <div class="col-span-12 lg:col-span-6 xl:col-span-3">
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
    <div class="col-span-12 lg:col-span-6 xl:col-span-3">
        <div class="card">
            
            <div class="flex justify-between mb-4">
                <div>
            <span class="block text-muted-color font-medium mb-4">Appointed Students</span>
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
    <div class="col-span-12 lg:col-span-6 xl:col-span-3">
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
        `
})
export class StatsWidget {


    @Input() data!: any;

}
