import { Component, OnInit, OnDestroy, AfterViewInit, OnChanges, signal, ViewChild, NgZone } from '@angular/core';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToolbarModule } from 'primeng/toolbar';
import { RatingModule } from 'primeng/rating';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { PanelMenuModule } from 'primeng/panelmenu';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ChipModule } from 'primeng/chip';
import { ProductService } from '../service/product.service';
import { ApiService } from '@/services/api.service';
import { LogsService } from '@/services/logs.service';
import ValidateForm from '@/helper/validator/validateForm';
import Swal from 'sweetalert2';
import { StoreService } from '@/services/store.service';
import { ToastModule } from 'primeng/toast';
import { HospitalProperties } from "./ml.hospital.sidebar";
import { MultiSelectModule } from 'primeng/multiselect';
import { Tooltip } from "primeng/tooltip";
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import * as L from 'leaflet';
declare const google: any;


interface Column {
    field: string;
    header: string;
    customExportHeader?: string;
}

interface ExportColumn {
    title: string;
    dataKey: string;
}

const iconDefault = L.icon({
    iconUrl: 'assets/marker-icon.png',
    shadowUrl: 'assets/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = iconDefault;


delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: 'assets/marker-icon.png',
    iconRetinaUrl: 'assets/marker-icon-2x.png',
    shadowUrl: 'assets/marker-shadow.png',
});

@Component({
    selector: 'ml-hospital',
    standalone: true,
    imports: [
        CommonModule,
        TableModule,
        FormsModule,
        ButtonModule,
        RippleModule,
        ToastModule,
        ToolbarModule,
        RatingModule,
        InputTextModule,
        TextareaModule,
        ToggleSwitchModule,
        SelectModule,
        RadioButtonModule,
        InputNumberModule,
        DialogModule,
        TagModule,
        InputIconModule,
        IconFieldModule,
        ConfirmDialogModule,
        PanelMenuModule,
        ReactiveFormsModule,
        FormsModule,
        HospitalProperties,
        ChipModule,
        MultiSelectModule,
        Tooltip,
        OverlayBadgeModule
    ],
    templateUrl: './ml.hospital.component.html',
    styleUrl: './css/masterlist.scss',
    providers: [MessageService, ProductService, ConfirmationService]
})
export class Hospital implements OnInit, OnChanges, OnDestroy {

    // "hospitalID",
    // "hospitalName",
    // "address",
    // "userID",
    // "dateCreated",
    // "dateUpdated"

    itemDialog: boolean = false;
    assignDialog: boolean = false;


    hospitals = signal<any[]>([]);
    hospital!: any;
    selectHospitals!: any[] | null;

    allSections: any[] = [];
    selectedSections: any[] = [];


    allocations: any[] = [];
    allocation!: any;
    selectAllocated!: any[] | null;

    form!: FormGroup;
    map: any = null;
    marker: any = null;
    autocompleteEl: any = null;
    mapInitialized = false;
    showMap = false;
    searchQuery = '';
    private searchDebounce: any = null;

    loading: boolean = false;
    submitted: boolean = false;

    @ViewChild('dt') dt!: Table;

    exportColumns!: ExportColumn[];

    cols!: Column[];
    filter: string = '';

    model: MenuItem[] = [];
    tokenPayload: any | null;

    c: boolean = false;
    r: boolean = false;
    u: boolean = false;
    d: boolean = false;
    s: boolean = false;
    p: boolean = false;
    section: boolean = false;

    constructor(private fb: FormBuilder,
        private productService: ProductService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private store: StoreService,
        private api: ApiService,
        private logger: LogsService,
        private vf: ValidateForm, private zone: NgZone

    ) {

        this.form = this.fb.group({
            hospitalID: [null],
            hospitalName: ['', Validators.required],
            address: ['', Validators.required],
            latitude: [null],
            longitude: [null],
            userID: ['', Validators.required],
            sections: [[], Validators.required]   // 👈 add this
        });

        this.loadData();

        this.model = [
            {
                items: [
                    { label: 'Sections', icon: 'fas fa-table-columns', routerLink: ['/dashboard/masterlist/sections'] },

                ]
            }
        ];
    }

    ngOnInit() {
        this.loadData();

        this.model = [
            {
                items: [
                    { label: 'Sections', icon: 'fas fa-table-columns', routerLink: ['/dashboard/masterlist/sections'] },

                ]
            }
        ];
    }

    ngOnChanges() {
        if (this.hospital?.hospitalID) {
            this.form.get('sections')?.disable();
        } else {
            this.form.get('sections')?.enable();
        }
    }

    exportCSV() {

        const hospitals = this.hospitals();

        if (!hospitals || hospitals.length === 0) {
            this.logger.printLogs('i', 'No hospitals to export', null)
            return;
        }

        const exportData = hospitals.map((h: any) => ({
            hospitalID: h.hospitalID,
            hospitalName: h.hospitalName,
            address: h.address,
            sections: h.sections?.map((s: any) => s.sectionName + '(' + s.allocation + ')').join(', ') || 'No sections',
            totalAllocations: h.totalAllocations || 0
        }));

        const csv = [
            ['Hospital ID', 'Name', 'Address', 'Sections', 'Total Allocations'],
            ...exportData.map(d => [d.hospitalID, d.hospitalName, d.address, d.sections, d.totalAllocations || 0])
        ]
            .map(row => row.map(v => `"${v}"`).join(','))
            .join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', `hospitals_export_${new Date().getTime()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);


        // const exportData = this.hospitals().map((h: any) => ({
        //     'Hospital ID': h.hospitalID,
        //     'Hospital Name': h.hospitalName,
        //     'Address': h.address,
        //     'Sections': h.sections?.map((s: any) => s.sectionName).join(', ') || 'No sections'
        // }));

        // import('xlsx').then((xlsx) => {
        //     const worksheet = xlsx.utils.json_to_sheet(exportData);
        //     const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
        //     const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
        //     this.saveAsExcelFile(excelBuffer, 'hospitals');
        // });
    }

    saveAsExcelFile(buffer: any, fileName: string): void {
        import('file-saver').then((FileSaver) => {
            let EXCEL_TYPE =
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
            let EXCEL_EXTENSION = '.xlsx';
            const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
            FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
        });
    }

    loadData() {
        this.store.getUserPayload()
            .subscribe(res => {
                this.tokenPayload = res;
                this.logger.printLogs('i', "Token Payload : ", this.tokenPayload)
                this.initPriveleges();
                this.loadHospitals();
                this.loadSections();
            });
        this.cols = [
            { field: 'hospitalID', header: 'ID', customExportHeader: 'Hospital ID' },
            { field: 'hospitalName', header: 'Name' },
            { field: 'address', header: 'Address' },
            { field: 'sections', header: 'Sections' },
            { field: 'sectionsDisplay', header: 'Sections' }  // ✅ use flattened string
        ];

        this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));

    }

    initPriveleges() {
        const moduleID = 'MOD0002';
        this.c = this.store.isAllowedAction(moduleID, 'create');
        this.r = this.store.isAllowedAction(moduleID, 'retrieve');
        this.u = this.store.isAllowedAction(moduleID, 'update');
        this.d = this.store.isAllowedAction(moduleID, 'delete');
        this.s = this.store.isAllowedAction(moduleID, 'status');
        this.p = this.store.isAllowedAction(moduleID, 'printall');
        this.section = this.store.isModuleActive("MOD0003")
    }

    // MAP & LOCATION SERVICES
    initMap(lat?: number, lng?: number) {
        const container = document.getElementById('hospital-map');
        if (!container || this.mapInitialized) return;

        const google = (window as any).google;
        const hasCoords = lat != null && lng != null;
        const center = hasCoords ? { lat, lng } : { lat: 7.0707, lng: 125.6087 };

        this.map = new google.maps.Map(container, {
            center,
            mapId: 'abcd1234efgh5678',
            zoom: hasCoords ? 17 : 12,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            clickableIcons: false,
        });

        this.marker = new google.maps.marker.AdvancedMarkerElement({
            map: this.map,
            position: center,
            draggable: true,
        });

        this.map.addListener('click', (e: any) => {
            this.marker.position = e.latLng;
            this.reverseGeocode(e.latLng);
        });

        // ✅ Fixed: AdvancedMarkerElement uses .position not .getPosition()
        this.marker.addListener('dragend', () => {
            const pos = this.marker.position;
            if (pos) this.reverseGeocode(pos);
        });

        this.mapInitialized = true;
    }

    onDialogShow() {
        if (this.hospital?.hospitalID) {
            this.form.get('sections')?.disable();
        } else {
            this.form.get('sections')?.enable();
        }

        if (this.showMap) {
            setTimeout(() => {
                const google = (window as any).google;
                google.maps.event.trigger(this.map, 'resize');

                const lat = this.form.value.latitude;
                const lng = this.form.value.longitude;

                if (lat && lng && this.map && this.marker) {
                    const pos = new google.maps.LatLng(lat, lng);
                    this.map.setCenter(pos);
                    this.map.setZoom(17);
                    this.marker.position = pos;
                }
            }, 300);
        }
    }

    onDialogHide() {
        this.destroyMap();
        this.showMap = false;
        this.searchQuery = '';
    }

    toggleMap() {
        if (!(window as any).google?.maps) {
            console.error('Google Maps not loaded yet.');
            return;
        }

        this.showMap = !this.showMap;

        if (this.showMap) {
            const lat = this.form.value.latitude;
            const lng = this.form.value.longitude;
            setTimeout(() => {
                this.initMap(lat ?? undefined, lng ?? undefined);
                this.initSearch();
            }, 400);
        } else {
            this.destroyMap();
        }
    }

    initSearch() {
        const container = document.getElementById('map-search-container');
        if (!container) {
            setTimeout(() => this.initSearch(), 200);
            return;
        }

        const google = (window as any).google;

        if (this.autocompleteEl) {
            this.autocompleteEl.remove();
            this.autocompleteEl = null;
        }

        const autocompleteEl = new google.maps.places.PlaceAutocompleteElement({
            componentRestrictions: { country: 'ph' }
        });

        autocompleteEl.style.width = '100%';
        container.innerHTML = '';
        container.appendChild(autocompleteEl);
        this.autocompleteEl = autocompleteEl;
        
        this.zone.runOutsideAngular(() => {
            // ✅ Correct event name is gmp-select
            autocompleteEl.addEventListener('gmp-select', async (event: any) => {
                console.log('✅ gmp-select fired!', event);
                console.log('Event keys:', Object.keys(event));
                console.log('Event placePrediction:', event.placePrediction);
                console.log('Event place:', event.place);

                // ✅ gmp-select uses placePrediction, not place
                const placePrediction = event.placePrediction;
                console.log('placePrediction:', placePrediction);

                const place = placePrediction.toPlace();
                console.log('place:', place);

                await place.fetchFields({
                    fields: ['displayName', 'formattedAddress', 'location']
                });

                console.log('Location:', place.location?.lat(), place.location?.lng());

                if (!place.location) return;

                const latitude = place.location.lat();
                const longitude = place.location.lng();
                const address = place.formattedAddress || place.displayName || '';
                const latLng = new google.maps.LatLng(latitude, longitude);

                this.zone.run(() => {
                    this.map.setCenter(latLng);
                    this.map.setZoom(17);
                    this.marker.position = latLng;
                    this.form.patchValue({ address, latitude, longitude });
                });
            });
        });
    }

    reverseGeocode(latLng: any) {
        const google = (window as any).google;
        const geocoder = new google.maps.Geocoder();

        geocoder.geocode({ location: latLng }, (results: any[], status: string) => {
            this.zone.run(() => {
                if (status === 'OK' && results?.[0]) {
                    const address = results[0].formatted_address;

                    this.form.patchValue({
                        address: address,
                        latitude: latLng.lat(),
                        longitude: latLng.lng()
                    });

                    const input = document.getElementById('map-search-input') as HTMLInputElement;
                    if (input) input.value = address;
                }
            });
        });
    }

    destroyMap() {
        const google = (window as any).google;

        if (this.marker && google) {
            google.maps.event.clearInstanceListeners(this.marker);
            this.marker.setMap(null);
            this.marker = null;
        }
        if (this.map && google) {
            google.maps.event.clearInstanceListeners(this.map);
            this.map = null;
        }
        // ✅ Fixed: renamed from autocompleteEl cleanup
        if (this.autocompleteEl && google) {
            google.maps.event.clearInstanceListeners(this.autocompleteEl);
            this.autocompleteEl.remove();
            this.autocompleteEl = null;
        }

        this.mapInitialized = false;
    }

    ngOnDestroy() {
        this.destroyMap();
    }

    getSectionsAsString(hospital: any): string {
        return hospital.sections?.map((s: any) => s.sectionName).join(', ') || '';
    }

    onGlobalFilter(table: Table) {
        table.filterGlobal(this.filter, 'contains');
    }

    clear(table: Table,) {
        this.filter = ''
        table.clear();
    }

    dateFormat(date: Date | string | null): string | null {
        if (!date) return null;

        // If the date is a string, convert it to a Date object
        if (typeof date === 'string') {
            date = new Date(date);
        }

        // Ensure it's a valid Date object
        if (date instanceof Date && !isNaN(date.getTime())) {
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            return `${year}-${month}-${day}`;
        } else {
            // Handle invalid date
            this.logger.printLogs('w', 'Invalid Date Format', [date]);
            return null;
        }
    }


    openNew() {


        this.form.reset({
            hospitalName: '',
            address: '',
            userID: this.tokenPayload.nameid,
        });
        this.hospital = {};
        this.submitted = false;
        this.itemDialog = true;
    }

    openNewDialog() {
        this.form.reset();
        this.itemDialog = true;
    }

    // edit(hospital: any) {
    //     this.hospital = hospital;
    //     // Patch base hospital info first
    //     this.form.patchValue({
    //         hospitalID: hospital.hospitalID,
    //         hospitalName: hospital.hospitalName,
    //         address: hospital.address,
    //         latitude: hospital.latitude,
    //         longitude: hospital.longitude,
    //         userID: this.tokenPayload.nameid,
    //     });
    //     // Load allocations for this hospital
    //     this.api.getAllocationsByHospitalID(hospital.hospitalID).subscribe({
    //         next: (allocations) => {

    //             this.form.patchValue({
    //                 sections: allocations.map((a: any) => a.sectionID) || []  // Patch the form with assigned sections
    //             });
    //             this.logger.printLogs('i', `Loaded sections for ${hospital.hospitalID}`, allocations.map((a: any) => a.sectionID));
    //         },
    //         error: (err) =>
    //             this.logger.printLogs('e', `Failed to load sections for ${hospital.hospitalID}`, err),
    //     });

    //     this.itemDialog = true;


    //     // 🔥 auto show map if coordinates exist
    //     if (hospital.latitude && hospital.longitude) {
    //         this.showMap = true;

    //         setTimeout(() => {
    //             this.initMap();
    //             this.initSearch();
    //         }, 400);
    //     }
    // }

    edit(hospital: any) {
        this.hospital = hospital;

        this.form.patchValue({
            hospitalID: hospital.hospitalID,
            hospitalName: hospital.hospitalName,
            address: hospital.address,
            latitude: hospital.latitude,
            longitude: hospital.longitude,
            userID: this.tokenPayload.nameid,
        });



        this.api.getAllocationsByHospitalID(hospital.hospitalID).subscribe({
            next: (allocations) => {
                this.form.patchValue({
                    sections: allocations.map((a: any) => a.sectionID) || []
                });
            },
            error: (err) => this.logger.printLogs('e', 'Failed to load sections', err),
        });

        this.itemDialog = true;

        if (hospital.latitude && hospital.longitude) {
            this.showMap = true;
            setTimeout(() => {
                this.initMap(hospital.latitude, hospital.longitude); // ✅ pass coords
                this.initSearch();
            }, 400);
        }
    }

    deleteSelected() {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete the selected products?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            rejectLabel: 'Cancel',
            acceptLabel: "Yes! I'm Sure",
            rejectIcon: 'pi pi-times',
            acceptIcon: 'pi pi-check',
            acceptButtonStyleClass: 'p-button-outlined p-button-success',
            rejectButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.hospitals.set(this.hospitals().filter((val) => !this.selectHospitals?.includes(val)));
                this.selectHospitals = null;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Products Deleted',
                    life: 3000
                });
            }
        });
    }

    hideDialog() {
        this.itemDialog = false;
        this.assignDialog = false;
        this.submitted = false;
    }

    loadHospitals() {
        this.loading = true;
        this.api.getHospitals().subscribe({
            next: (hospitals) => {

                hospitals.forEach(hospital => {
                    this.api.getAllocationsByHospitalID(hospital.hospitalID).subscribe({
                        next: (sections) => {
                            // ✅ Sort sections alphabetically by section name or numerically by ID/order
                            sections.sort((a: any, b: any) => {
                                // Change 'sectionName' or 'order' to whatever field defines the order
                                return a.sectionName.localeCompare(b.sectionName);
                                // or for numeric order: return a.order - b.order;
                            });
                            hospital.sections = sections; // Assign sections properly
                            this.logger.printLogs('i', `Loaded sections for ${hospital.hospitalID}`, sections);
                            // Sum all allocations across sections
                            hospital.totalAllocations = sections.reduce(
                                (sum: number, s: any) => sum + ((s.status == true ? s.allocation : 0) || 0),
                                0
                            );

                            this.loading = false;
                        },
                        error: (err) => {
                            this.logger.printLogs('e', `Failed to load sections for ${hospital.hospitalID}`, err)
                            this.loading = false;
                        }
                    });
                });

                this.hospitals.set(hospitals || []);

                this.logger.printLogs('i', 'Hospitals loaded', this.hospitals());
            },
            error: (err) => this.logger.printLogs('e', 'Failed to fetch hospitals', err)
        });
    }


    loadSections() {
        this.api.getSections().subscribe({
            next: (sections) => { this.allSections = sections || []; this.logger.printLogs('i', 'Sections loaded', this.allSections); },
            error: (err) => this.logger.printLogs('e', 'Failed to fetch sections', err)
        });
    }
    chipSeverities = ['primary', 'success', 'info', 'warn', 'danger'];

    getChipClass(section: any): any {
        const lower = section.sectionName.toLowerCase();

        if (section.status === false) return 'secondary';

        if (lower.includes('emergency')) return 'danger';
        if (lower.includes('station') || lower.includes('ward') || lower.includes('opd') || lower.includes('ipd')) return 'primary';
        if (lower.includes('icu') || lower.includes('or')) return 'warn';
        if (lower.includes('pediatrics')) return 'info';
        if (lower.includes('radiology')) return 'warning';

        return 'secondary'; // default  
    }

    // getAllocationsByHospitalID(id: string): any { // get sections by hospitalID
    //     this.api.getAllocationsByHospitalID(id).subscribe({
    //         next: (sections) => { this.allSections = sections; return this.allSections.filter((sec) => sec.hospitalID === id).length; },
    //         error: (err) => { this.allSections = []; this.logger.printLogs('e', 'Failed to fetch allocations', err) }
    //     });
    // }

    onSectionsChange() {
        const selectedSections = this.form.value.sections;
        this.logger.printLogs('i', 'Selected sections:', selectedSections);
    }

    save() {
        this.submitted = true;

        if (!this.form.valid) {
            this.messageService.add({
                severity: 'warning',
                summary: 'Incomplete Fields',
                detail: 'Please complete all required fields before proceeding!',
                life: 3000
            });
            this.vf.validateFormFields(this.form);
            return;
        }

        this.itemDialog = false;

        this.hospital = {
            ...this.form.value,
            latitude: Number(this.form.value.latitude),
            longitude: Number(this.form.value.longitude)
        };


        if (this.hospital?.hospitalID) {

            let hospitalID = this.hospital.hospitalID;

            this.logger.printLogs('i', 'Updating Hospital details', this.hospital);

            this.api.updateHospital(hospitalID, this.hospital).subscribe({
                next: (res) => {
                    this.logger.printLogs('i', 'Hospital updated successfully', this.hospital);

                    // this.saveAllocatedSections(hospitalID, selectedSections);

                    this.closeDialog();
                    this.showAlert('Update Successful', 'Hospital has been updated successfully.', false, 'success');
                    this.loadHospitals()
                },
                error: (err) => {
                    this.showAlert('Updating Failed', err, true);
                },
                complete: () => {
                    this.submitted = false;
                }
            });
        } else {

            // CREATE hospital
            const selectedSections = this.form.value['sections'] || [];

            const allocationPayload = selectedSections.map((sec: any) => ({
                sectionID: sec.sectionID || sec, // depends on your dropdown structure
                allocation: sec.allocation || 0, // adjust if needed
                status: sec.status || 'Active',
                userId: this.tokenPayload.nameid
            }));

            this.api.createHospital(this.hospital).subscribe({
                next: (res: any) => {
                    this.logger.printLogs('i', 'Hospital created successfully', res);
                    const hospitalID = res.hospitalID;

                    this.saveAllocatedSections(hospitalID, selectedSections);

                    this.closeDialog();
                    this.showAlert('Creation Successful', 'Hospital has been created successfully.', false, 'success');
                },
                error: (err) => {
                    this.showAlert('Saving Failed', err, true, 'error');
                },
                complete: () => {
                    this.submitted = false;
                }
            });
        }
    }

    private saveAllocatedSections(hospitalID: string, sections: any[]) {
        if (!sections || sections.length === 0) {
            this.logger.printLogs('w', 'No sections selected, skipping allocation.', sections);
            this.showAlert('No Sections Selected', 'Please select at least one section to allocate.', true, 'warning');
            return;
        }

        const request = {
            hospitalID: hospitalID,
            userID: this.tokenPayload.nameid,
            sectionIDs: sections
        };

        this.api.createAllocationsBulk(request).subscribe({
            next: (res) => {
                this.logger.printLogs('i', 'Allocations saved successfully', res);
                this.loadHospitals();
            },
            error: (err) => {
                this.logger.printLogs('e', 'Failed to save allocations', err);
                this.showAlert('Allocation Failed', err, false, 'error');
            }
        });
    }


    openAllocatedSections(hospital: any) {
        this.hospital = hospital;

        this.api.getAllocationsByHospitalID(hospital.hospitalID).subscribe({
            next: (allocations) => {
                this.allocations = allocations || [];
                this.logger.printLogs('i', `Loaded sections for ${hospital.hospitalID}`, this.selectedSections);
                this.assignDialog = true;
            },
            error: (err) => {
                this.logger.printLogs('e', `Failed to load sections for ${hospital.hospitalID}`, err);
                this.showAlert('Loading Failed', err, false, 'error');
            }
        });

    }

    updateStatus(allocation: any) {
        this.allocation = allocation;
    }




    delete(hospital: any) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete ${hospital.hospitalName}?`,
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            rejectLabel: 'Cancel',
            acceptLabel: "Yes! I'm Sure",
            rejectIcon: 'pi pi-times',
            acceptIcon: 'pi pi-check',
            acceptButtonStyleClass: 'p-button-outlined p-button-success',
            rejectButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.logger.printLogs('i', `Deleting hospital ${hospital.hospitalName}`, hospital);

                this.api.deleteHospital(hospital.hospitalID).subscribe({
                    next: (res) => {
                        this.logger.printLogs('i', 'Hospital deleted successfully', res);
                        this.loadHospitals();
                        this.showAlert('Deletion Successful', `${hospital.hospitalName} has been deleted.`, false, 'success');
                    },
                    error: (err) => {
                        this.logger.printLogs('e', 'Failed to delete hospital', err);
                        this.showAlert('Deletion Failed', err, false, 'error');
                    }
                });
            }
        });
    }


    private showAlert(title: string, message: string, dialogOpen: boolean, severity: 'success' | 'error' | 'warning' | 'info' | 'question' | undefined = 'info') {
        this.logger.printLogs('e', 'Failed to create hospital', message);
        this.messageService.add({
            severity: severity,
            summary: title,
            detail: message,
            life: 3000
        });

        Swal.fire({
            title: title,
            html: message,
            icon: severity,
            showCancelButton: false,
            confirmButtonText: 'OK',
        }).then((result) => {
            if (result.isConfirmed) {
                this.itemDialog = dialogOpen;
            }
        });
    }

    onAllocationInput(section: any) {
        if (section.allocation < 1 || section.allocation == null) {
            section.allocation = 1; // force minimum to 1
        }
    }

    saveAllocated() {


        const invalid = this.allocations.some(s => !s.allocation || s.allocation < 1);

        if (invalid) {
            this.messageService.add({
                severity: 'error',
                summary: 'Validation Error',
                detail: 'Allocation values must be at least 1!',
                life: 3000
            });
            return;
        }

        const allocations = this.allocations.map(s => ({
            sectionID: s.sectionID,
            allocation: s.allocation, // || 1 default to 1 if not set
            status: s.status, // || false default to 1 if not set
            isTimeRestricted: s.isTimeRestricted, // || false default to 1 if not set
            userID: this.tokenPayload.nameid, //  || 'USR0001' default to 1 if not set
        }));

        this.logger.printLogs('i', `Saving allocated sections for hospital ${this.hospital.hospitalID} ==> `, this.allocations);

        this.api.updateAllocationsBulk(this.hospital.hospitalID, allocations).subscribe({
            next: (res) => {
                this.logger.printLogs('i', 'Allocations saved successfully', res);
                this.showAlert('Allocated Successfully', 'Allocations have been updated successfully.', false, 'success');
                this.loadHospitals();
            },
            error: (err) => {
                this.logger.printLogs('e', 'Failed to save allocations', err);
                this.showAlert('Failed to save allocations', err, false, 'error');
            }
        });


        // TODO: Call service to save
        this.assignDialog = false;

    }

    onChangeStatus(selectedAllocation: any) {
        this.logger.printLogs('i', `On Change allocation status from ${!selectedAllocation.status} to `, selectedAllocation.status);
        this.allocations.map((a: any) => {
            if (a.allocationID == selectedAllocation.allocationID) {
                a.status = selectedAllocation.status
            }
        });
    }


    // helper to reset and close
    private closeDialog() {
        this.itemDialog = false;
        this.form.reset({
            hospitalName: '',
            address: '',
            userID: this.tokenPayload.nameid
        });
        this.hospital = {}; // reset form
    }


}
