import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpParams } from '@angular/common/http';

import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ApiService } from '@/services/api.service';
import { LogsService } from '@/services/logs.service';
import { Tooltip } from "primeng/tooltip";
import { MessageService } from 'primeng/api';
import { PdfService } from '@/services/pdf.service';

@Component({
    selector: 'app-billing',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        HttpClientModule,
        ButtonModule,
        SelectModule,
        DatePickerModule,
        TagModule,
        ProgressSpinnerModule,
        Tooltip
    ],
    templateUrl: './billing.component.html'
})
export class Billing implements OnInit {

    @Input() roleID!: string;
    @Input() userID!: string;
    @Input() hospitalID?: string;
    @Input() schoolID?: string;

    @Output() manageStudents = new EventEmitter<any>();

    @Output() attendance = new EventEmitter<any>();

    selectedHospital: any = null;
    selectedSchool: any = null;

    hospitals: any[] = [];
    schools: any[] = [];

    loading = false;

    billingItems: any[] = [];

    dateRange: Date[] = [
        new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        new Date()
    ];

    billingSummary = {
        totalSlots: 0,
        totalAmount: 0,
        totalHospitals: 0
    };

    displayDateRange = '';

    constructor(
        private messageService: MessageService,
        private api: ApiService,
        private logger: LogsService,
        private pdfService: PdfService,) {
        this.loadHospitals();
        this.loadSchools();
        this.loadBilling();
    }

    ngOnInit(): void {
        this.loadHospitals();
        this.loadSchools();
        this.loadBilling();
    }

    isAdmin(): boolean {
        return this.roleID === 'UGR0001' || this.roleID === 'UGR0002';
    }

    isSupervisor(): boolean {
        return this.roleID === 'UGR0005';
    }

    isSchoolScoped(): boolean {
        return this.roleID === 'UGR0003' || this.roleID === 'UGR0006';
    }

    loadHospitals() {
        this.api.getHospitals().subscribe({
            next: (hospitals) => {
                this.hospitals = hospitals || [];
                if (this.isSupervisor()) {
                    this.hospitals = this.hospitals.filter((h: any) => h.hospitalID === this.hospitalID);
                    this.selectedHospital = this.hospitals.length > 0 ? this.hospitals[0].hospitalID : null;
                } else {
                    //Add All option for admin
                    this.hospitals.unshift({
                        hospitalID: null,
                        hospitalName: 'All Hospitals'
                    });
                }
            },
            error: (err) => this.logger.printLogs('e', 'Failed to fetch hospitals', err)
        });
    }

    loadSchools() {
        this.api.getSchools().subscribe({
            next: (schools) => {
                this.schools = schools || [];
                if (this.isSchoolScoped()) {
                    this.schools = this.schools.filter((s: any) => s.schoolID === this.schoolID);
                    this.selectedSchool = this.schools.length > 0 ? this.schools[0].schoolID : null;
                }

                this.logger.printLogs('i', 'Schools loaded', this.schools)
            },
            error: (err) => this.logger.printLogs('e', 'Failed to fetch schools', err)
        });
    }

    abbreviateName(fullName: string): string {
        if (!fullName) return 'Unknown';

        // Remove common suffixes/words that don't add to abbreviation
        const skipWords = ['the', 'of', 'and', 'a', 'an', 'for', 'Inc', 'Inc.', 'Corp', 'Foundation'];

        // Split by spaces, commas, dashes, and dots
        const parts = fullName.split(/[\s,\-\.]+/);

        const abbreviated = parts
            .filter(p => p.length > 0 && !skipWords.includes(p))
            .map(p => p[0].toUpperCase())
            .join('');

        return abbreviated;
    }

    loadBilling() {

        const [start, end] = this.dateRange;

        if (!start || !end) return;

        this.loading = true;

        const startDate = this.formatDate(start);
        const endDate = this.formatDate(end);

        this.api.getSlotsByRange(
            startDate,
            endDate,
            this.roleID,
            this.userID,
            this.selectedHospital,
            this.selectedSchool
        ).subscribe({
            next: (res) => {

                // this.billingItems = res.map(x => ({
                //     ...x,

                //     // SAMPLE COMPUTATION
                //     amount: this.computeAmount(x)
                // }));
                this.billingItems = res
                    .map(x => ({
                        ...x,

                        // SAMPLE COMPUTATION
                        amount: this.computeAmount(x)
                    }))
                    .sort((a, b) => {

                        // SORT BY DATE
                        const dateDiff =
                            new Date(b.dateSlot).getTime() -
                            new Date(a.dateSlot).getTime();

                        if (dateDiff !== 0) {
                            return dateDiff;
                        }

                        // OPTIONAL:
                        // SORT BY START TIME IF SAME DATE

                        return (a.startTime || '')
                            .localeCompare(b.startTime || '');
                    });

                this.computeSummary();

                this.displayDateRange =
                    `${this.formatDisplay(start)} - ${this.formatDisplay(end)}`;

                this.loading = false;
            },

            error: (err) => {
                console.error(err);
                this.loading = false;
            }
        });
    }

    computeAmount(item: any): number {

        // SAMPLE BILLING COMPUTATION
        const students = item.totalStudents || 1;

        return students * 150;
    }

    computeSummary() {

        this.billingSummary.totalSlots =
            this.billingItems.length;

        this.billingSummary.totalAmount =
            this.billingItems.reduce(
                (total, item) => total + this.computeBillingAmount(item),
                0
            );

        this.billingSummary.totalHospitals =
            [...new Set(this.billingItems.map(x => x.hospitalID))].length;
    }

    computeBillingAmount(item: any): number {

        const attendedStudents =
            item.attendedStudentCount &&
                item.attendedStudentCount > 0
                ? item.attendedStudentCount
                : 10;

        return attendedStudents * 100;
    }

    downloadBillingReport() {

        this.pdfService.generateBillingReport(
            'SAPA Billing Report',
            this.billingItems,
            'download'
        );
    }
    printBillingReport() {

        this.pdfService.generateBillingReport(
            'SAPA Billing Report',
            this.billingItems,
            'print'
        );
    }
    previewBillingReport() {

        this.pdfService.generateBillingReport(
            'SAPA Billing Report',
            this.billingItems,
            'open'
        );
    }

    formatDate(date: Date): string {

        const year = date.getFullYear();

        const month = String(date.getMonth() + 1)
            .padStart(2, '0');

        const day = String(date.getDate())
            .padStart(2, '0');

        return `${year}-${month}-${day}`;
    }

    formatDisplay(date: Date): string {

        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    viewAppointedStudents(item: any) {

        this.manageStudents.emit(item);
    }

    viewAttendance(item: any) {

        this.attendance.emit(item);
    }
}