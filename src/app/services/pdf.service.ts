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


  async generateSchoolsReport(schools: any[]) {
    // Ensure logos are loaded before generating
    if (!this.leftLogo || !this.rightLogo) await this.loadLogos();

    const docDefinition: any = {
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
    // Ensure logos are loaded before generating
    if (!this.leftLogo || !this.rightLogo) await this.loadLogos();

    const docDefinition: any = {
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

  async generateHopitalsReport(hospitals: any[]) {
    this.logger.printLogs('i', "Generate PDF for Hospitals : ", hospitals);

    // Ensure logos are loaded
    if (!this.leftLogo || !this.rightLogo) await this.loadLogos();

    const docDefinition: any = {
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


  /** ✅ Map status IDs to readable labels */
  private mapStatus(status: number): string {
    switch (status) {
      case 1: return 'Approved';
      case 2: return 'Inactive';
      case 3: return 'Suspended';
      default: return 'Pending';
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
    dateTo: string
  ) {
    // Ensure logos are loaded
    if (!this.leftLogo || !this.rightLogo) await this.loadLogos();

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
              widths: [25, '25%', '25%', '25%', '10%'],
              body: [
                [
                  { text: '#', bold: true, alignment: 'center', fontSize: 9 },
                  { text: 'Hospital', bold: true, fontSize: 9 },
                  { text: 'Section', bold: true, fontSize: 9 },
                  { text: 'Allocation', bold: true, fontSize: 9 },
                  { text: 'Status', bold: true, fontSize: 9, alignment: 'center' }
                ],

                ...shiftEntries.map((item: any, idx: number) => [
                  { text: idx + 1, alignment: 'center', fontSize: 9 },
                  { text: item.hospitalName, fontSize: 9, noWrap: false },
                  { text: item.sectionName, fontSize: 9 },
                  { text: item.allocation?.toString() ?? '0', fontSize: 9 },
                  {
                    text:
                      item.slotStatus === 0 ? 'ONGOING' : item.slotStatus === 1 ? 'OPEN' : 'CLOSED',
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

}
