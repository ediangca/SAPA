import { Component, inject, input, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { StyleClassModule } from 'primeng/styleclass';
import { ApiService } from '@/services/api.service';
import { LogsService } from '@/services/logs.service';

interface User {
    userID: string;
    fullname: string;
    rolename: string;
    onlineStatus: number; // 0 = Offline, 1 = Online, 2 = Away
    lastActivity: string | null; // add this
}

@Component({
    selector: 'app-floating-users',
    standalone: true,
    imports: [CommonModule, ButtonModule, StyleClassModule],
    template: `
        <div class="fixed bottom-20 right-4 z-50 flex flex-column align-items-end gap-2"
    [ngClass]="{ 'fixed': float() }">

    <!-- User List Panel -->
    <div
        *ngIf="open()"
        class="absolute bottom-16 right-0 w-80 bg-white dark:bg-surface-900
               rounded-xl shadow-2xl border border-surface-200
               dark:border-surface-700 overflow-hidden">

        <!-- Header -->
        <div
            class="flex items-center justify-between px-4 py-3
                   border-b border-surface-200 dark:border-surface-700">
            <div>
                <h4 class="font-semibold text-sm">
                    Active Users
                </h4>

                <p class="text-xs text-surface-500">
                    <!-- {{ users().length }} Total Users -->
                      <b class="text-primary"> {{ onlineBadge() }} Online  </b>
                      | {{ users().length }} Total
                </p>
            </div>

            <p-button
                icon="pi pi-times"
                [text]="true"
                severity="primary"
                (onClick)="togglePanel()" />
        </div>

        <!-- Search -->
        <div class="p-3 border-b border-surface-200 dark:border-surface-700">
            <span class="relative block">
                <i
                    class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-surface-400">
                </i>

                <input
                    type="text"
                    class="w-full pl-10 pr-3 py-2 text-sm border rounded-lg
                        border-surface-300 dark:border-surface-600
                        bg-white dark:bg-surface-900"
                    placeholder="Search user..."
                    [value]="searchTerm()"
                    (input)="searchTerm.set($any($event.target).value)"
                />
            </span>
        </div>
        

        <!-- User List -->
        <div class="max-h-[500px] overflow-y-auto">

            <div
                *ngFor="let user of filteredUsers()"
                class="flex items-center justify-between px-4 py-3
                       hover:bg-surface-100 dark:hover:bg-surface-800
                       border-b border-surface-100 dark:border-surface-800">

                <div *ngIf="filteredUsers().length > 0" class="flex items-center gap-3">

                    <!-- Status Dot -->
                    <div
                        class="w-3 h-3 rounded-full"
                        [ngClass]="{
                            'bg-green-500': user.onlineStatus === 1,
                            'bg-yellow-500': user.onlineStatus === 2,
                            'bg-gray-400': user.onlineStatus === 0
                        }">
                        </div>

                    <div>
                        <div class="font-medium text-sm">
                            {{ user.fullname }}
                        </div>

                        <div class="text-xs text-surface-500">
                            {{ user.rolename }}
                            <span *ngIf="user.onlineStatus === 1" class="text-green-600 ml-1">
                                - active {{ getAwayDuration(user.lastActivity) }}
                            </span>
                            <span *ngIf="user.onlineStatus === 2" class="text-yellow-600 ml-1">
                                - away {{ getAwayDuration(user.lastActivity) }}
                            </span>
                            <span *ngIf="user.onlineStatus === 0 && user.lastActivity" class="text-gray-400 ml-1">
                                - last seen {{ getAwayDuration(user.lastActivity) }} ago
                            </span>
                        </div>
                    </div>

                </div>

                <!-- <span
                    class="text-xs font-medium"
                    [ngClass]="{
                        'text-green-600': user.isOnline,
                        'text-gray-500': !user.isOnline
                    }">
                    {{ user.isOnline ? 'Online' : 'Offline' }}
                </span> -->

                <div  *ngIf="filteredUsers().length === 0"
                    class="p-6 text-center text-surface-500"
                >
                    <i class="pi pi-users text-2xl mb-2 block"></i>

                    <div class="font-medium">
                        No users found
                    </div>

                    <small>
                        Try another search keyword
                    </small>
                </div>

            </div>

        </div>

    </div>

    <!-- Floating Button -->
    <p-button
        icon="pi pi-users"
        severity="primary"
        [rounded]="true"
        (onClick)="togglePanel()"
        label="Online Users"
        [badge]="onlineBadge()"
        badgeClass="p-badge-success" />

</div>
    `
})

export class FloatingUsers implements OnInit, OnDestroy {

    private api = inject(ApiService);
    private logger = inject(LogsService);

    float = input<boolean>(true);
    open = signal(false);
    users = signal<User[]>([]);
    searchTerm = signal('');

    private pollingHandle?: ReturnType<typeof setInterval>;

    ngOnInit() {
        this.loadUsers();
        this.pollingHandle = setInterval(() => this.loadUsers(), 10000);
    }

    ngOnDestroy() {
        if (this.pollingHandle) {
            clearInterval(this.pollingHandle);                // ✅ clear it
            this.pollingHandle = undefined;
        }
    }

    togglePanel() {
        this.open.update(v => !v);
    }

    loadUsers() {
        this.api.getUsers(false).subscribe(users => {
            // Sort: Online first, then Away, then Offline
            const approvedUsers = users.filter(u => u.status === 'A');

            // approvedUsers.sort((a, b) => b.lastActivity - a.lastActivity);
            approvedUsers.sort((a, b) => {
                if (b.onlineStatus !== a.onlineStatus) return b.onlineStatus - a.onlineStatus;
                return new Date(a.lastActivity).getTime() - new Date(b.lastActivity).getTime();
            });

            this.logger.printLogs('i', 'User Status List', approvedUsers);
            this.users.set(approvedUsers);
        });
    }

    getStatusColor(status: number): string {
        switch (status) {
            case 1: return 'bg-green-500';   // Online
            case 2: return 'bg-yellow-400';  // Away
            default: return 'bg-gray-400';   // Offline
        }
    }

    getStatusLabel(status: number): string {
        switch (status) {
            case 1: return 'Online';
            case 2: return 'Away';
            default: return 'Offline';
        }
    }

    onlineBadge = computed(() => {
        const count = this.users().filter(x => x.onlineStatus === 1).length;
        return count > 99 ? '99+' : count.toString();
    });

    filteredUsers = computed(() => {
        const search = this.searchTerm().toLowerCase().trim();
        if (!search) return this.users();
        return this.users().filter(user =>
            user.fullname?.toLowerCase().includes(search) ||
            user.rolename?.toLowerCase().includes(search)
        );
    });

    getAwayDuration(lastActivity: string | null): string {
        if (!lastActivity) return '';

        const diffMs = Date.now() - new Date(lastActivity).getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins}m`;

        const hours = Math.floor(diffMins / 60);
        const mins = diffMins % 60;
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
}