import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Toast } from 'primeng/toast';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { ApiService } from '@/services/api.service';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageService } from 'primeng/api';
import { StoreService } from '@/services/store.service';
import { LogsService } from '@/services/logs.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'system-settings',
    standalone: true,
    imports: [
    CommonModule,
    FormsModule,
    ToggleSwitchModule,
    ButtonModule,
    MultiSelectModule,
    InputNumberModule,
    Toast
],
    providers: [MessageService],
    templateUrl: './set.settings.component.html'
})
export class SystemSettings implements OnInit {

    settings = signal<Record<string, string>>({});

    constructor(
        private messageService: MessageService,
        private store: StoreService,
        private api: ApiService,
        private logger: LogsService,
    ) {
    }

    ngOnInit(): void {
        this.loadSettings();
    }

    loadSettings() {
        this.api.getSettings().subscribe({
            next: (res) => {

                const mapped: Record<string, string> = {};

                res.forEach((item: any) => {
                    mapped[item.name] = item.value;
                });

                this.settings.set(mapped);
            }
        });
    }

    getBool(key: string): boolean {
        return this.settings()[key] === '1';
    }

    setBool(key: string, value: boolean) {

        this.settings.update(current => ({
            ...current,
            [key]: value ? '1' : '0'
        }));
    }

    getNumber(key: string): number {
        return Number(this.settings()[key] ?? 0);
    }

    setNumber(key: string, value: number) {

        this.settings.update(current => ({
            ...current,
            [key]: value.toString()
        }));
    }

    saveSettings() {

        const payload = Object.entries(this.settings()).map(
            ([name, value]) => ({
                name,
                value
            })
        );

        this.api.bulkUpdateSettings(payload)
            .subscribe({
                next: () => {
                    this.loadSettings();
                    this.showErrorAlert('Settings Updated', 'Settings have been successfully updated!', 'success');
                },
                error: () => {
                    this.showErrorAlert('Settings Update Failed', 'Failed to update settings.', 'error');   
                }
            });
    }


    private showErrorAlert(title: string, message: any, severity: 'success' | 'error' | 'warning' | 'info' | 'question' | undefined = 'info') {

        this.logger.printLogs(severity, title, message);

        this.messageService.add({
            severity: severity,
            summary: title,
            detail: message,
            life: 3000
        });

        Swal.fire({
            title: title,
            text: message,
            icon: severity,
        });
    }


}