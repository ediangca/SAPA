import { Injectable } from '@angular/core';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { LogsService } from './logs.service';

const pdfMakeLib: any = pdfMake;
pdfMakeLib.vfs = (pdfFonts as any).pdfMake?.vfs || (pdfFonts as any).vfs;

@Injectable({
  providedIn: 'root'
})
export class PdfService {
  private leftLogo: string | null = null;
  private rightLogo: string | null = null;
  pdfPreviewSrc: string | null = null;

  sapaWatermark: any = null;

  constructor(
    private logger: LogsService,) {
    // Preload logos
    this.loadLogos();
  }

  /** Preload both logos once */
  private async loadLogos() {
    this.leftLogo = await this.getBase64ImageFromURL('assets/images/ddn.png');
    this.rightLogo = await this.getBase64ImageFromURL('assets/images/peedo.png');
  }

  /** Global header generator */
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

  /** Global header generator */
  private getHeader(title: string) {
    return {
      columns: [
        { image: this.leftLogo, width: 60 },
        {
          stack: [
            { text: 'Republic of the Philippines', bold: true, fontSize: 12, alignment: 'center' },
            { text: 'Provincial Government of Davao del Norte', fontSize: 12, alignment: 'center' },
            { text: 'Government Center, Mankilam, Tagum City', fontSize: 11, alignment: 'center' },
            { text: `\n${title}`, bold: true, fontSize: 14, alignment: 'center' }
          ],
          width: '*'
        },
        { image: this.rightLogo, width: 60 }
      ]
    };
  }


  private getFooter() {
    return {
      columns: [
        {
          text: '© 2025 Provincial Government of Davao del Norte. All rights reserved.',
          fontSize: 9,
          alignment: 'left',
          margin: [40, 0, 0, 0]
        },
        {
          text: `Generated on: ${new Date().toLocaleString()}`,
          fontSize: 9,
          alignment: 'right',
          margin: [0, 0, 40, 0]
        }
      ]
    };
  }

  async loadSapaWatermark() {
    this.sapaWatermark = await this.getBase64ImageFromURL('assets/images/sapa-logo.png');
  }

  async generateSchoolsReport(schools: any[]) {
    // Ensure logos are loaded
    if (!this.leftLogo || !this.rightLogo || !this.sapaWatermark) {
      await this.loadLogos();
      await this.loadSapaWatermark(); // if separate
    }

    const docDefinition: any = {
      background: (currentPage: number, pageSize: any) => {
        return [
          {
            image: this.sapaWatermark,
            width: 250,
            absolutePosition: {
              x: (pageSize.width / 2) - 125,
              y: (pageSize.height / 2) - 125
            },
            opacity: 0.08
          }
        ];
      },
      content: [
        this.getHeader('LIST OF SCHOOL'),
        { text: '\n' },
        {
          table: {
            headerRows: 1,
            widths: [25, '20%', '25%', '20%', '15%', '20%'], // adjust proportionally
            body: [
              [
                { text: '#', bold: true, fontSize: 10, alignment: 'center' },
                { text: 'School Name', bold: true, fontSize: 10 },
                { text: 'Address', bold: true, fontSize: 10 },
                { text: 'Coordinator', bold: true, fontSize: 10 },
                { text: 'Status', bold: true, fontSize: 10 },
                { text: 'Date Created', bold: true, fontSize: 10, alignment: 'center' }
              ],
              ...schools.map((s, i) => [
                { text: (i + 1).toString(), alignment: 'center', fontSize: 9 },
                { text: s.schoolName || '—', fontSize: 9, noWrap: false },
                { text: s.address || '—', fontSize: 9, noWrap: false, style: 'tableCell' },
                { text: s.createdBy || '—', fontSize: 9, noWrap: false },
                { text: this.mapStatus(s.status), alignment: 'center', fontSize: 9 },
                { text: new Date(s.date_Created).toLocaleDateString(), alignment: 'center', fontSize: 9 }
              ])
            ]
          },
          layout: {
            fillColor: (rowIndex: number) => (rowIndex === 0 ? '#f2f2f2' : null),
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => '#aaa',
            vLineColor: () => '#aaa',
            paddingLeft: () => 4,
            paddingRight: () => 4,
            paddingTop: () => 2,
            paddingBottom: () => 2,
          },
          margin: [0, 10, 30, 10]

        },
      ],
      footer: this.getFooter(),
      styles: {
        header: { bold: true, alignment: 'center', fontSize: 13 },
        tableCell: { fontSize: 9, noWrap: false, lineHeight: 1.1 },
      }
    };

    pdfMakeLib.createPdf(docDefinition).open();
  }

  async generateUserReport(users: any[], title: string) {

    // Ensure logos are loaded
    if (!this.leftLogo || !this.rightLogo || !this.sapaWatermark) {
      await this.loadLogos();
      await this.loadSapaWatermark(); // if separate
    }

    const docDefinition: any = {
      background: (currentPage: number, pageSize: any) => {
        return [
          {
            image: this.sapaWatermark,
            width: 250,
            absolutePosition: {
              x: (pageSize.width / 2) - 125,
              y: (pageSize.height / 2) - 125
            },
            opacity: 0.08
          }
        ];
      },
      content: [
        this.getHeader(title),
        { text: '\n' },
        {
          table: {
            headerRows: 1,
            widths: [25, '20%', '25%', '20%', '15%', '20%'], // adjust proportionally
            body: [
              [
                { text: '#', bold: true, fontSize: 10, alignment: 'center' },
                { text: 'FullName', bold: true, fontSize: 10 },
                { text: 'Email', bold: true, fontSize: 10 },
                { text: 'Role', bold: true, fontSize: 10 },
                { text: 'Status', bold: true, fontSize: 10 },
                { text: 'Date Created', bold: true, fontSize: 10, alignment: 'center' }
              ],
              ...users.map((s, i) => [
                { text: (i + 1).toString(), alignment: 'center', fontSize: 9 },
                { text: s.fullname || '—', fontSize: 9, noWrap: false },
                { text: s.email || '—', fontSize: 9, noWrap: false, style: 'tableCell' },
                { text: s.rolename || '—', fontSize: 9, noWrap: false },
                { text: this.mapUserStatus(s.status), alignment: 'center', fontSize: 9 },
                { text: new Date(s.date_Created).toLocaleDateString(), alignment: 'center', fontSize: 9 }
              ])
            ]
          },
          layout: {
            fillColor: (rowIndex: number) => (rowIndex === 0 ? '#f2f2f2' : null),
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => '#aaa',
            vLineColor: () => '#aaa',
            paddingLeft: () => 4,
            paddingRight: () => 4,
            paddingTop: () => 2,
            paddingBottom: () => 2,
          },
          margin: [0, 10, 30, 10]

        },
      ],
      footer: this.getFooter(),
      styles: {
        header: { bold: true, alignment: 'center', fontSize: 13 },
        tableCell: { fontSize: 9, noWrap: false, lineHeight: 1.1 },
      }
    };

    pdfMakeLib.createPdf(docDefinition).open();
  }

  async generateRoleReport(roles: any[], title: string) {
    // Ensure logos are loaded before generating
    if (!this.leftLogo || !this.rightLogo || !this.sapaWatermark) {
      await this.loadLogos();
      await this.loadSapaWatermark(); // if separate
    }

    const docDefinition: any = {
      background: (currentPage: number, pageSize: any) => {
        return [
          {
            image: this.sapaWatermark,
            width: 250,
            absolutePosition: {
              x: (pageSize.width / 2) - 125,
              y: (pageSize.height / 2) - 125
            },
            opacity: 0.08
          }
        ];
      },
      content: [
        this.getHeader(title),
        { text: '\n' },
        {
          table: {
            headerRows: 1,
            widths: [25, '80%', '20%'], // adjust proportionally
            body: [
              [
                { text: '#', bold: true, fontSize: 10, alignment: 'center' },
                { text: 'Role Name', bold: true, fontSize: 10 },
                { text: 'Date Created', bold: true, fontSize: 10, alignment: 'center' }
              ],
              ...roles.map((s, i) => [
                { text: (i + 1).toString(), alignment: 'center', fontSize: 9 },
                { text: s.roleName || '—', fontSize: 9, noWrap: false },
                { text: new Date(s.date_Created).toLocaleDateString(), alignment: 'center', fontSize: 9 }
              ])
            ]
          },
          layout: {
            fillColor: (rowIndex: number) => (rowIndex === 0 ? '#f2f2f2' : null),
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => '#aaa',
            vLineColor: () => '#aaa',
            paddingLeft: () => 4,
            paddingRight: () => 4,
            paddingTop: () => 2,
            paddingBottom: () => 2,
          },
          margin: [0, 10, 30, 10]

        },
      ],
      footer: this.getFooter(),
      styles: {
        header: { bold: true, alignment: 'center', fontSize: 13 },
        tableCell: { fontSize: 9, noWrap: false, lineHeight: 1.1 },
      }
    };

    pdfMakeLib.createPdf(docDefinition).open();
  }

  async generateHopitalsReport(hospitals: any[]) {
    this.logger.printLogs('i', "Generate PDF for Hospitals : ", hospitals);

    // Ensure logos are loaded
    if (!this.leftLogo || !this.rightLogo || !this.sapaWatermark) {
      await this.loadLogos();
      await this.loadSapaWatermark(); // if separate
    }

    const docDefinition: any = {
      background: (currentPage: number, pageSize: any) => {
        return [
          {
            image: this.sapaWatermark,
            width: 250,
            absolutePosition: {
              x: (pageSize.width / 2) - 125,
              y: (pageSize.height / 2) - 125
            },
            opacity: 0.08
          }
        ];
      },
      content: [
        this.getHeader('LIST OF HOSPITALS'),
        { text: '\n' },

        {
          table: {
            headerRows: 1,
            widths: [25, '20%', '30%', '25%', '10%', '15%'],
            // # | Hospital Name | Address | Total Alloc | Sections | Created Date
            body: [
              [
                { text: '#', bold: true, fontSize: 10, alignment: 'center' },
                { text: 'Hospital Name', bold: true, fontSize: 10 },
                { text: 'Address', bold: true, fontSize: 10 },
                { text: 'Sections [Allocation]', bold: true, fontSize: 10 },
                { text: 'Total Alloc.', bold: true, fontSize: 10, alignment: 'center' },
                { text: 'Created', bold: true, fontSize: 10, alignment: 'center' },
              ],

              ...hospitals.map((h, i) => [
                { text: (i + 1).toString(), alignment: 'center', fontSize: 9 },
                { text: h.hospitalName || '—', fontSize: 9, noWrap: false },
                { text: h.address || '—', fontSize: 9, noWrap: false },
                {
                  stack: h.sections?.length
                    ? h.sections.map((s: any) => ({
                      text: `• ${s.sectionName} [${s.allocation}]`,
                      fontSize: 8,
                      margin: [0, 1, 0, 1]
                    }))
                    : [{ text: '—', fontSize: 8 }]
                },
                { text: h.totalAllocations?.toString() || '0', alignment: 'center', fontSize: 9 },
                {
                  text: h.dateCreated
                    ? new Date(h.dateCreated).toLocaleDateString()
                    : '—',
                  alignment: 'center',
                  fontSize: 9
                },
              ])
            ]
          },

          layout: {
            fillColor: (rowIndex: number) => (rowIndex === 0 ? '#f2f2f2' : null),
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => '#aaa',
            vLineColor: () => '#aaa',
            paddingLeft: () => 4,
            paddingRight: () => 4,
            paddingTop: () => 2,
            paddingBottom: () => 2,
          },

          margin: [0, 10, 30, 10]
        }
      ],

      footer: this.getFooter(),

      styles: {
        header: { bold: true, alignment: 'center', fontSize: 13 },
        tableCell: { fontSize: 9, noWrap: false, lineHeight: 1.1 },
      }
    };

    pdfMakeLib.createPdf(docDefinition).open();
  }

  async generateSectionsReport(sections: any[]) {
    this.logger.printLogs('i', "Generate PDF for Sections : ", sections);

    // Ensure logos are loaded
    if (!this.leftLogo || !this.rightLogo || !this.sapaWatermark) {
      await this.loadLogos();
      await this.loadSapaWatermark(); // if separate
    }
    const docDefinition: any = {
      background: (currentPage: number, pageSize: any) => {
        return [
          {
            image: this.sapaWatermark,
            width: 250,
            absolutePosition: {
              x: (pageSize.width / 2) - 125,
              y: (pageSize.height / 2) - 125
            },
            opacity: 0.08
          }
        ];
      },
      content: [
        this.getHeader('LIST OF SECTIONS'),
        { text: '\n' },

        {
          table: {
            headerRows: 1,
            widths: [25, '20%', '60%', '20%'],
            // # | Section ID | Section Name | Created By | Created / Updated
            body: [
              [
                { text: '#', bold: true, fontSize: 10, alignment: 'center' },
                { text: 'Section ID', bold: true, fontSize: 10 },
                { text: 'Section Name', bold: true, fontSize: 10 },
                { text: 'Created', bold: true, fontSize: 10, alignment: 'center' },
              ],

              ...sections.map((s, i) => [
                { text: (i + 1).toString(), alignment: 'center', fontSize: 9 },
                { text: s.sectionID || '—', fontSize: 9 },
                { text: s.sectionName || '—', fontSize: 9 },
                {
                  text: s.dateCreated
                    ? new Date(s.dateCreated).toLocaleDateString()
                    : '—',
                  alignment: 'center',
                  fontSize: 9
                },
              ])
            ]
          },

          layout: {
            fillColor: (rowIndex: number) => (rowIndex === 0 ? '#f2f2f2' : null),
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => '#aaa',
            vLineColor: () => '#aaa',
            paddingLeft: () => 4,
            paddingRight: () => 4,
            paddingTop: () => 2,
            paddingBottom: () => 2,
          },

          margin: [0, 10, 30, 10]
        }
      ],

      footer: this.getFooter(),

      styles: {
        header: { bold: true, alignment: 'center', fontSize: 13 },
        tableCell: { fontSize: 9, noWrap: false, lineHeight: 1.1 },
      }
    };

    pdfMakeLib.createPdf(docDefinition).open();
  }

  /** ✅ Map status IDs to readable labels */
  private mapStatus(status: number): string {
    switch (status) {
      case 1: return 'Approved';
      case 2: return 'Inactive';
      case 3: return 'Suspended';
      default: return 'Pending';
    }
  }

  /** ✅ Map status IDs to readable labels */
  private mapUserStatus(status: String): string {
    switch (status) {
      case 'P': return 'Pending';
      case 'A': return 'Approved';
      case 'S': return 'Suspend';
      case 'I': return 'Inactive';
      default: return 'Unverified';
    }
  }

  /** ✅ Convert image to Base64 for PDF embedding */
  private getBase64ImageFromURL(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.setAttribute('crossOrigin', 'anonymous');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject('Could not create canvas context');
          return;
        }
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = error => reject(error);
      img.src = url;
    });
  }

  async generateScheduleReport(
    title: string,
    schedules: any[],
    dateFrom: string,
    dateTo: string,
    isAttendanceReport: boolean = false
  ) {
    // Ensure logos are loaded
    if (!this.leftLogo || !this.rightLogo || !this.sapaWatermark) {
      await this.loadLogos();
      await this.loadSapaWatermark(); // if separate
    }
    // Group schedules by date → shift → entries
    const grouped: any = {};

    schedules.forEach(slot => {
      if (!grouped[slot.dateSlot]) grouped[slot.dateSlot] = {};
      if (!grouped[slot.dateSlot][slot.shiftName]) {
        grouped[slot.dateSlot][slot.shiftName] = [];
      }
      grouped[slot.dateSlot][slot.shiftName].push(slot);
    });

    const content: any[] = [
      this.getHeader(title),
      { text: '\n' }
    ];

    // Build PDF content
    Object.keys(grouped)
      .sort()
      .forEach(date => {
        content.push({
          text: `DATE: ${date}`,
          style: 'dateTitle',
          margin: [0, 10, 0, 5]
        });

        const shifts = grouped[date];

        Object.keys(shifts).forEach(shiftName => {
          const shiftEntries = shifts[shiftName];

          content.push({
            text: `Shift: ${shiftName} (${shiftEntries[0].startTime} - ${shiftEntries[0].endTime})`,
            style: 'shiftTitle',
            margin: [0, 5, 0, 3]
          });

          // Table per shift
          content.push({
            table: {
              headerRows: 1,
              widths: [20, '30%', '20%', '20%', '10%', '15%'],
              body: [
                [
                  { text: '#', bold: true, alignment: 'center', fontSize: 9 },
                  { text: 'School', bold: true, fontSize: 9 },
                  { text: 'Hospital', bold: true, fontSize: 9 },
                  { text: 'Section', bold: true, fontSize: 9 },
                  { text: 'Allocation', bold: true, fontSize: 9 },
                  { text: 'Status', bold: true, fontSize: 9, alignment: 'center' }
                ],


                ...shiftEntries.map((item: any, idx: number) => [
                  { text: idx + 1, alignment: 'center', fontSize: 9 },
                  { text: item.schoolName, fontSize: 9, noWrap: false },
                  { text: item.hospitalName, fontSize: 9, noWrap: false },
                  { text: item.sectionName, fontSize: 9 },
                  { text: (item.studentCount?.toString() ?? '0') + "/" + (item.allocation?.toString() ?? '0'), fontSize: 9 },
                  // {
                  //     text: statusIcon.text,
                  //     color: statusIcon.color,
                  //     alignment: 'center',
                  //     fontSize: 12,   // slightly larger for icon feel
                  //     bold: true
                  // }
                  {
                    text:
                      item.slotStatus === 0 ? 'UNCONFIRMED'
                        : item.slotStatus === 1 ? 'CONFIRMED'
                          : item.slotStatus === 2 ? 'DECLINED'
                            : item.slotStatus === 3 ? 'CANCEL REQUEST'
                              : item.slotStatus === 4 ? 'CANCELED'
                                : 'UNKNOWN',
                    alignment: 'center',
                    fontSize: 9
                  }
                ])
              ]
            },
            layout: {
              fillColor: (rowIndex: number) => (rowIndex === 0 ? '#f2f2f2' : null),
              hLineWidth: () => 0.5,
              vLineWidth: () => 0.5,
              hLineColor: () => '#aaa',
              vLineColor: () => '#aaa',
              paddingLeft: () => 4,
              paddingRight: () => 4,
              paddingTop: () => 2,
              paddingBottom: () => 2,
            },
            margin: [0, 0, 0, 10]
          });
        });
      });

    const docDefinition: any = {
      background: (currentPage: number, pageSize: any) => {
        return [
          {
            image: this.sapaWatermark,
            width: 250,
            absolutePosition: {
              x: (pageSize.width / 2) - 125,
              y: (pageSize.height / 2) - 125
            },
            opacity: 0.08
          }
        ];
      },
      content,
      footer: this.getFooter(),
      styles: {
        dateTitle: {
          fontSize: 12,
          bold: true,
          margin: [0, 10, 0, 5]
        },
        shiftTitle: {
          fontSize: 11,
          italics: true,
          bold: true,
          margin: [0, 5, 0, 5]
        },
        tableCell: { fontSize: 9, noWrap: false }
      }
    };

    pdfMakeLib.createPdf(docDefinition).open();

  }

  getStatusIcon(status: number) {
    switch (status) {
      case 0:
        return { text: '⏳', color: '#f59e0b' }; // Pending
      case 1:
        return { text: '✔', color: '#16a34a' }; // Confirmed
      case 2:
        return { text: '✖', color: '#dc2626' }; // Declined
      case 3:
        return { text: '⚠', color: '#ea580c' }; // Cancel Request
      case 4:
        return { text: '⛔', color: '#6b7280' }; // Canceled
      default:
        return { text: '?', color: '#000000' };
    }
  }


  // Appointment Report
  async generateAppointmentReport(
    title: string,
    appointments: any[],
    dateFrom: string,
    dateTo: string,
    preview: boolean = false
  ) {
    // Ensure logos are loaded
    if (!this.leftLogo || !this.rightLogo) await this.loadLogos();

    // Group appointments by school → date
    const grouped: any = {};
    appointments.forEach(appt => {
      if (!grouped[appt.schoolName]) grouped[appt.schoolName] = {};
      if (!grouped[appt.schoolName][appt.dateSlot]) grouped[appt.schoolName][appt.dateSlot] = [];
      grouped[appt.schoolName][appt.dateSlot].push(appt);
    });

    const content: any[] = [
      this.getHeader(title),
      { text: '\n' }
    ];

    // Build PDF content
    Object.keys(grouped)
      .sort()
      .forEach(school => {
        const schoolDates = grouped[school];

        // School Header
        content.push({
          text: `SCHOOL: ${school}`,
          style: 'schoolTitle',
          margin: [0, 10, 0, 5]
        });

        Object.keys(schoolDates)
          .sort()
          .forEach(date => {
            const dayAppointments = schoolDates[date];

            // Date Header
            content.push({
              text: `DATE: ${this.dateFormat(date)}`,
              style: 'dateTitle',
              margin: [0, 5, 0, 3]
            });

            // Table for the date
            content.push({
              table: {
                headerRows: 1,
                widths: [25, '25%', '25%', '15%', '10%', '10%'],
                body: [
                  [
                    { text: '#', bold: true, alignment: 'center', fontSize: 9 },
                    { text: 'Full Name', bold: true, fontSize: 9 },
                    { text: 'Hospital', bold: true, fontSize: 9 },
                    { text: 'Section', bold: true, fontSize: 9 },
                    { text: 'Shift', bold: true, fontSize: 9 },
                    { text: 'Status', bold: true, alignment: 'center', fontSize: 9 }
                  ],
                  ...dayAppointments.map((item: any, idx: number) => [
                    { text: idx + 1, alignment: 'center', fontSize: 9 },
                    { text: item.fullname, fontSize: 9, noWrap: false },
                    { text: item.hospitalName, fontSize: 9 },
                    { text: item.sectionName, fontSize: 9 },
                    { text: item.shiftName, fontSize: 9 },
                    {
                      text: item.status === 0 ? 'UNCONFIRMED' :
                        item.status === 1 ? 'POSTED' :
                          item.status === 2 ? 'DECLINED' :
                            item.status === 3 ? 'CANCEL REQUEST' :
                              item.status === 4 ? 'CANCELED' :
                                'UNKNOWN',
                      alignment: 'center',
                      fontSize: 9
                    }
                  ])
                ]
              },
              layout: {
                fillColor: (rowIndex: number) => rowIndex === 0 ? '#f2f2f2' : null,
                hLineWidth: () => 0.5,
                vLineWidth: () => 0.5,
                hLineColor: () => '#aaa',
                vLineColor: () => '#aaa',
                paddingLeft: () => 4,
                paddingRight: () => 4,
                paddingTop: () => 2,
                paddingBottom: () => 2
              },
              margin: [0, 0, 0, 10]
            });
          });
      });

    const docDefinition: any = {
      content,
      footer: this.getFooter(),
      styles: {
        schoolTitle: {
          fontSize: 13,
          bold: true,
          color: '#333',
          margin: [0, 10, 0, 5]
        },
        dateTitle: {
          fontSize: 12,
          bold: true,
          margin: [0, 5, 0, 3]
        },
        tableCell: { fontSize: 9, noWrap: false }
      }
    };

    // pdfMakeLib.createPdf(docDefinition).open();

    if (preview) {
      // Get PDF as data URL
      pdfMake.createPdf(docDefinition).getDataUrl((dataUrl: string) => {
        this.pdfPreviewSrc = dataUrl; // bind to iframe
      });
    } else {
      pdfMake.createPdf(docDefinition).open();
    }
  }

  // Return a Promise<string> containing the PDF Data URL
  generateAppointmentReportPreview(
    title: string,
    appointments: any[],
    dateFrom: string,
    dateTo: string
  ): Promise<string> {
    return new Promise(async (resolve, reject) => {

      // Ensure logos are loaded
      if (!this.leftLogo || !this.rightLogo) await this.loadLogos();

      // Group appointments by school → date
      const grouped: any = {};
      appointments.forEach(appt => {
        if (!grouped[appt.schoolName]) grouped[appt.schoolName] = {};
        if (!grouped[appt.schoolName][appt.dateSlot]) grouped[appt.schoolName][appt.dateSlot] = [];
        grouped[appt.schoolName][appt.dateSlot].push(appt);
      });

      const content: any[] = [
        this.getHeader(title),
        { text: '\n' }
      ];

      // Build PDF content
      Object.keys(grouped)
        .sort()
        .forEach(school => {
          const schoolDates = grouped[school];

          // School Header
          content.push({
            text: `${school}`,
            style: 'schoolTitle',
            margin: [0, 10, 0, 5]
          });

          Object.keys(schoolDates)
            .sort()
            .forEach(date => {
              const dayAppointments = schoolDates[date];

              // Date Header
              content.push({
                text: `DATE: ${this.dateFormat(date)}`,
                style: 'dateTitle',
                margin: [0, 5, 0, 3]
              });

              // Table for the date
              content.push({
                table: {
                  headerRows: 1,
                  widths: [25, '25%', '25%', '20%', '10%', '15%'],
                  body: [
                    [
                      { text: '#', bold: true, alignment: 'center', fontSize: 9 },
                      { text: 'Full Name', bold: true, fontSize: 9 },
                      { text: 'Hospital', bold: true, fontSize: 9 },
                      { text: 'Section', bold: true, fontSize: 9 },
                      { text: 'Shift', bold: true, fontSize: 9 },
                      { text: 'Status', bold: true, alignment: 'center', fontSize: 9 }
                    ],
                    ...dayAppointments.map((item: any, idx: number) => [
                      { text: idx + 1, alignment: 'center', fontSize: 9 },
                      { text: item.fullname, fontSize: 9, noWrap: false },
                      { text: item.hospitalName, fontSize: 9 },
                      { text: item.sectionName, fontSize: 9 },
                      { text: item.shiftName, fontSize: 9 },
                      {
                        text: item.status === 0 ? 'UNCONFIRMED' :
                          item.status === 1 ? 'POSTED' :
                            item.status === 2 ? 'DECLINED' :
                              item.status === 3 ? 'CANCEL REQUEST' :
                                item.status === 4 ? 'CANCELED' :
                                  'UNKNOWN',
                        alignment: 'center',
                        fontSize: 9
                      }
                    ])
                  ]
                },
                layout: {
                  fillColor: (rowIndex: number) => rowIndex === 0 ? '#f2f2f2' : null,
                  hLineWidth: () => 0.5,
                  vLineWidth: () => 0.5,
                  hLineColor: () => '#aaa',
                  vLineColor: () => '#aaa',
                  paddingLeft: () => 4,
                  paddingRight: () => 4,
                  paddingTop: () => 2,
                  paddingBottom: () => 2
                },
                margin: [0, 0, 0, 10]
              });
            });
        });


      const docDefinition: any = {
        content,
        footer: this.getFooter(),
        styles: {
          schoolTitle: {
            fontSize: 13,
            bold: true,
            color: '#333',
            margin: [0, 10, 0, 5]
          },
          dateTitle: {
            fontSize: 12,
            bold: true,
            margin: [0, 5, 0, 3]
          },
          tableCell: { fontSize: 9, noWrap: false }
        }
      };

      // Generate Data URL
      pdfMake.createPdf(docDefinition).getDataUrl((dataUrl: string) => {
        resolve(dataUrl);
      });

    });
  }

  downloadAppointmentReport(
    fileName: string,
    appointments: any[],
    dateFrom: string,
    dateTo: string
  ) {
    // const docDefinition = this.buildAppointmentDoc(
    //   `LIST OF APPOINTMENTS (${dateFrom} - ${dateTo})`,
    //   appointments
    // );
    // pdfMake.createPdf(docDefinition).download(fileName + '.pdf');

    this.buildAppointmentDoc(`LIST OF APPOINTMENTS (${this.dateFormat(dateFrom)} - ${this.dateFormat(dateTo)})`, appointments)
      .then((docDefinition) => {
        pdfMake.createPdf(docDefinition).download(fileName + '.pdf');
      })
      .catch((error) => {
        console.error('Error building PDF:', error);
      });
  }

  // --------------------------
  // Private helper to build docDefinition
  // --------------------------
  private async buildAppointmentDoc(title: string, appointments: any[]) {

    // Ensure logos are loaded
    if (!this.leftLogo || !this.rightLogo) await this.loadLogos();

    // Group appointments by school → date
    const grouped: any = {};
    appointments.forEach(appt => {
      if (!grouped[appt.schoolName]) grouped[appt.schoolName] = {};
      if (!grouped[appt.schoolName][appt.dateSlot]) grouped[appt.schoolName][appt.dateSlot] = [];
      grouped[appt.schoolName][appt.dateSlot].push(appt);
    });

    const content: any[] = [
      this.getHeader(title),
      { text: '\n' }
    ];

    // Build PDF content
    Object.keys(grouped)
      .sort()
      .forEach(school => {
        const schoolDates = grouped[school];

        // School Header
        content.push({
          text: `${school}`,
          style: 'schoolTitle',
          margin: [0, 10, 0, 5]
        });

        Object.keys(schoolDates)
          .sort()
          .forEach(date => {
            const dayAppointments = schoolDates[date];

            // Date Header
            content.push({
              text: `DATE: ${this.dateFormat(date)}`,
              style: 'dateTitle',
              margin: [0, 5, 0, 3]
            });

            // Table for the date
            content.push({
              table: {
                headerRows: 1,
                widths: [25, '25%', '25%', '20%', '10%', '15%'],
                body: [
                  [
                    { text: '#', bold: true, alignment: 'center', fontSize: 9 },
                    { text: 'Full Name', bold: true, fontSize: 9 },
                    { text: 'Hospital', bold: true, fontSize: 9 },
                    { text: 'Section', bold: true, fontSize: 9 },
                    { text: 'Shift', bold: true, fontSize: 9 },
                    { text: 'Status', bold: true, alignment: 'center', fontSize: 9 }
                  ],
                  ...dayAppointments.map((item: any, idx: number) => [
                    { text: idx + 1, alignment: 'center', fontSize: 9 },
                    { text: item.fullname, fontSize: 9, noWrap: false },
                    { text: item.hospitalName, fontSize: 9 },
                    { text: item.sectionName, fontSize: 9 },
                    { text: item.shiftName, fontSize: 9 },
                    {
                      text: item.status === 0 ? 'UNCONFIRMED' :
                        item.status === 1 ? 'POSTED' :
                          item.status === 2 ? 'DECLINED' :
                            item.status === 3 ? 'CANCEL REQUEST' :
                              item.status === 4 ? 'CANCELED' :
                                'UNKNOWN',
                      alignment: 'center',
                      fontSize: 9
                    }
                  ])
                ]
              },
              layout: {
                fillColor: (rowIndex: number) => rowIndex === 0 ? '#f2f2f2' : null,
                hLineWidth: () => 0.5,
                vLineWidth: () => 0.5,
                hLineColor: () => '#aaa',
                vLineColor: () => '#aaa',
                paddingLeft: () => 4,
                paddingRight: () => 4,
                paddingTop: () => 2,
                paddingBottom: () => 2
              },
              margin: [0, 0, 0, 10]
            });
          });
      });

    return {
      content,
      styles: {
        header: { fontSize: 14, bold: true, margin: [0, 0, 0, 10] as [number, number, number, number] },
        schoolTitle: { fontSize: 13, bold: true, margin: [0, 10, 0, 5] as [number, number, number, number] },
        dateTitle: { fontSize: 12, bold: true, margin: [0, 5, 0, 3] as [number, number, number, number] }
      }
    };
  }


  printAppointmentReport(
    appointments: any[],
    dateFrom: string,
    dateTo: string
  ) {
    this.buildAppointmentDoc(`LIST OF APPOINTMENTS (${this.dateFormat(dateFrom)} - ${this.dateFormat(dateTo)})`, appointments)
      .then(docDefinition => {
        const pdf = pdfMake.createPdf(docDefinition);
        pdf.print();   // <-- This opens the browser print dialog
      })
      .catch(error => {
        console.error("Error printing PDF:", error);
      });
  }


  // Print Attendance Report
  async generateAttendanceReport(title: string, slots: any[], attendanceRecords: any[]) {
    this.logger.printLogs('i', 'Generate Attendance Report', { title, attendanceRecords });

    // Ensure logos are loaded
    if (!this.leftLogo || !this.rightLogo || !this.sapaWatermark) {
      await this.loadLogos();
      await this.loadSapaWatermark(); // if separate
    }

    // 🔒 Safe slot reference
    const slot = slots?.[0] || {};

    // 🔥 Merge slots with attendance
    const mergedData = slots.map((s) => {
      const attendance = attendanceRecords.find(a => a.userID === s.userID);

      return {
        ...s,
        hasAttendance: !!attendance,
        attendanceDate: attendance?.dateCreated ?? null
      };
    });

    // 🔢 Summary (optional but useful)
    const presentCount = mergedData.filter(x => x.hasAttendance).length;
    const absentCount = mergedData.length - presentCount;

    const docDefinition: any = {

      background: (currentPage: number, pageSize: any) => {
        return [
          {
            image: this.sapaWatermark,
            width: 250,
            absolutePosition: {
              x: (pageSize.width / 2) - 125,
              y: (pageSize.height / 2) - 125
            },
            opacity: 0.08
          }
        ];
      },

      content: [
        this.getHeader(title),
        { text: '\n' },

        // ===============================
        // 📌 SLOT INFORMATION TABLE
        // ===============================
        {
          table: {
            widths: ['20%', '40%', '25%', '15%'],
            body: [

              [
                { text: 'DATE & SHIFT', bold: true, fontSize: 9, color: '#555', fillColor: '#f2f2f2' },
                { text: slot?.dateSlot ? new Date(slot.dateSlot).toLocaleDateString() + ' - ' + (slot?.shiftName ? `${slot.shiftName} (${slot.startTime} - ${slot.endTime})` : '—') : '—', fontSize: 9 },
                {},
                {}
              ],
              [
                { text: 'HOSPITAL', bold: true, fontSize: 9, color: '#555', fillColor: '#f2f2f2' },
                { text: slot?.hospitalName ?? slot?.HospitalName ?? '—', fontSize: 9 },
                { text: 'SECTION', bold: true, fontSize: 9, color: '#555', fillColor: '#f2f2f2' },
                { text: slot?.sectionName ?? slot?.SectionName ?? '—', fontSize: 9 }
              ],
              [
                { text: 'CLINICAL INSTRUCTOR', bold: true, fontSize: 9, color: '#555', fillColor: '#f2f2f2' },
                { text: slot?.ci_fullname ?? '—', fontSize: 9, colSpan: 3 },
                {},
                {}
              ]
            ]
          },
          layout: {
            hLineWidth: () => 0.5, vLineWidth: () => 0.5,
            hLineColor: () => '#ccc', vLineColor: () => '#ccc',
            paddingLeft: () => 4, paddingRight: () => 4,
            paddingTop: () => 3, paddingBottom: () => 3,
          },
          margin: [0, 0, 0, 3]
        },
        {
          text: `Clinical Instructor: ${slot.ci_fullname || '—'}`,
          bold: true,
          fontSize: 10,
          margin: [0, 0, 0, 10]
        },

        // ===============================
        // 📊 ATTENDANCE TABLE
        // ===============================
        {
          table: {
            headerRows: 1,
            widths: ['10%', '55%', '20%', '20%'],
            body: [
              [
                { text: '#', bold: true, fontSize: 10, alignment: 'center' },
                { text: 'Student Name', bold: true, fontSize: 10 },
                { text: 'Time', bold: true, fontSize: 10, alignment: 'center' },
                { text: 'Status', bold: true, fontSize: 10, alignment: 'center' }
              ],

              ...mergedData.map((s, i) => [
                { text: (i + 1).toString(), alignment: 'center', fontSize: 9 },
                { text: s.fullname || '—', fontSize: 9 },
                {
                  text: s.attendanceDate
                    ? new Date(s.attendanceDate).toLocaleTimeString()
                    : '—',
                  alignment: 'center',
                  fontSize: 9
                },
                {
                  text: s.hasAttendance ? 'Present' : 'Absent',
                  alignment: 'center',
                  fontSize: 9,
                  color: s.hasAttendance ? 'green' : 'red',
                  bold: true
                }
              ])
            ]
          },

          layout: {
            fillColor: (rowIndex: number) => (rowIndex === 0 ? '#f2f2f2' : null),
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => '#aaa',
            vLineColor: () => '#aaa',
            paddingLeft: () => 4,
            paddingRight: () => 4,
            paddingTop: () => 2,
            paddingBottom: () => 2,
          },

          margin: [0, 0, 30, 10]
        },

        // ===============================
        // 📈 SUMMARY
        // ===============================
        {
          text: `Total: ${mergedData.length} | Present: ${presentCount} | Absent: ${absentCount}`,
          bold: true,
          fontSize: 10,
          margin: [0, 5, 0, 0]
        }
      ],

      footer: this.getFooter(),

      styles: {
        header: { bold: true, alignment: 'center', fontSize: 13 },
        tableCell: { fontSize: 9, noWrap: false, lineHeight: 1.1 },
      }
    };

    pdfMakeLib.createPdf(docDefinition).open();
  }

  async generateAttendanceReportMulti(title: string, mergedSlots: { slot: any; students: any[] }[]) {
    if (!this.leftLogo || !this.rightLogo || !this.sapaWatermark) {
      await this.loadLogos();
      await this.loadSapaWatermark();
    }

    // ── Group by date → shiftName → slots
    const grouped: Record<string, Record<string, { slot: any; students: any[] }[]>> = {};

    mergedSlots.forEach(({ slot, students }) => {
      const date = slot.dateSlot ?? slot.DateSlot ?? 'Unknown Date';
      const shiftName = slot.shiftName ?? slot.ShiftName ?? 'Unknown Shift';

      if (!grouped[date]) grouped[date] = {};
      if (!grouped[date][shiftName]) grouped[date][shiftName] = [];

      grouped[date][shiftName].push({ slot, students });
    });

    const content: any[] = [this.getHeader(title), { text: '\n' }];

    Object.keys(grouped).sort().forEach(date => {
      // ── DATE HEADER
      content.push({
        text: `DATE: ${new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`,
        style: 'dateTitle',
        margin: [0, 10, 0, 5]
      });

      const shifts = grouped[date];

      Object.keys(shifts).forEach(shiftName => {
        const slotEntries = shifts[shiftName];
        const firstSlot = slotEntries[0]?.slot;

        // ── SHIFT HEADER
        content.push({
          text: `Shift: ${shiftName} (${firstSlot?.startTime ?? ''} – ${firstSlot?.endTime ?? ''})`,
          style: 'shiftTitle',
          margin: [0, 6, 0, 4]
        });

        // ── ONE BLOCK PER SLOT
        slotEntries.forEach(({ slot, students }) => {
          const presentCount = students.filter(s => s.hasAttendance).length;
          const absentCount = students.length - presentCount;

          // Slot info row
          content.push({
            table: {
              widths: ['20%', '40%', '25%', '15%'],
              body: [
                [
                  { text: 'HOSPITAL', bold: true, fontSize: 9, color: '#555', fillColor: '#f2f2f2' },
                  { text: slot?.hospitalName ?? slot?.HospitalName ?? '—', fontSize: 9 },
                  { text: 'SECTION', bold: true, fontSize: 9, color: '#555', fillColor: '#f2f2f2' },
                  { text: slot?.sectionName ?? slot?.SectionName ?? '—', fontSize: 9 }
                ],
                [
                  { text: 'CLINICAL INSTRUCTOR', bold: true, fontSize: 9, color: '#555', fillColor: '#f2f2f2' },
                  { text: slot?.ci_fullname ?? '—', fontSize: 9, colSpan: 3 },
                  {}, {}
                ]
              ]
            },
            layout: {
              hLineWidth: () => 0.5, vLineWidth: () => 0.5,
              hLineColor: () => '#ccc', vLineColor: () => '#ccc',
              paddingLeft: () => 4, paddingRight: () => 4,
              paddingTop: () => 3, paddingBottom: () => 3,
            },
            margin: [0, 0, 0, 3]
          });

          // Student attendance table
          const studentRows = students.length > 0
            ? students.map((s, i) => [
              { text: (i + 1).toString(), alignment: 'center', fontSize: 8 },
              {
                stack: [
                  { text: s.fullname ?? s.Fullname ?? '—', fontSize: 8 },
                  { text: s.userID ?? s.UserID ?? '', fontSize: 7, color: '#999' }
                ]
              },
              {
                text: s.hasAttendance && s.date_created
                  ? new Date(s.date_created).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : '—',
                alignment: 'center', fontSize: 8
              },
              {
                text: s.hasAttendance ? 'Present' : 'Absent',
                color: s.hasAttendance ? 'green' : 'red',
                alignment: 'center', fontSize: 8, bold: true
              }
            ])
            : [[
              {
                text: 'No appointed students found.',
                colSpan: 4, alignment: 'center',
                fontSize: 8, color: '#999', italics: true
              },
              {}, {}, {}
            ]];

          content.push({
            table: {
              headerRows: 1,
              widths: ['6%', '52%', '22%', '20%'],
              body: [
                [
                  { text: '#', bold: true, fontSize: 9, alignment: 'center', fillColor: '#e8e8e8' },
                  { text: 'Student Name', bold: true, fontSize: 9, fillColor: '#e8e8e8' },
                  { text: 'Time', bold: true, fontSize: 9, alignment: 'center', fillColor: '#e8e8e8' },
                  { text: 'Status', bold: true, fontSize: 9, alignment: 'center', fillColor: '#e8e8e8' }
                ],
                ...studentRows
              ]
            },
            layout: {
              fillColor: (_row: number, _node: any, _col: number) => null, // handled per-cell above
              hLineWidth: () => 0.5, vLineWidth: () => 0.5,
              hLineColor: () => '#ccc', vLineColor: () => '#ccc',
              paddingLeft: () => 4, paddingRight: () => 4,
              paddingTop: () => 2, paddingBottom: () => 2,
            },
            margin: [0, 0, 0, 2]
          });

          // Per-slot summary
          content.push({
            columns: [
              { text: `Total: ${students.length}`, bold: true, fontSize: 8, color: '#333' },
              { text: `Present: ${presentCount}`, bold: true, fontSize: 8, color: 'green', alignment: 'center' },
              { text: `Absent: ${absentCount}`, bold: true, fontSize: 8, color: 'red', alignment: 'right' }
            ],
            margin: [0, 1, 0, 8]
          });
        });
      });
    });

    const docDefinition: any = {
      background: (_currentPage: number, pageSize: any) => [{
        image: this.sapaWatermark,
        width: 250,
        absolutePosition: {
          x: (pageSize.width / 2) - 125,
          y: (pageSize.height / 2) - 125
        },
        opacity: 0.08
      }],
      content,
      footer: this.getFooter(),
      styles: {
        dateTitle: {
          fontSize: 12,
          bold: true,
        },
        shiftTitle: {
          fontSize: 10,
          bold: true,
          italics: true,
          color: '#444'
        },
      }
    };

    // ✅ Avoids browser popup block inside async/subscribe
    pdfMakeLib.createPdf(docDefinition).getBlob((blob: Blob) => {
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    });
  }
}
