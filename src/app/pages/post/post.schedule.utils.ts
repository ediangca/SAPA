import { EventInput } from '@fullcalendar/core';

let eventGuid = 0;
const TODAY_STR = new Date().toISOString().replace(/T.*$/, ''); // YYYY-MM-DD of today


export function mapSlotsToEvents(slots: any[], roleID: string | null = null) {
  return slots.map(slot => ({
    id: slot.slotID,
    title: (roleID === 'UGR0001' || roleID === 'UGR0002' )? `${slot.schoolName}` :`${slot.hospitalName}(${slot.sectionName}) - ${slot.shiftName}`,
    shift: slot.shiftName,
    // `${slot.shiftName} - ${slot.sectionName}`,
    // describedAs: slot.shiftName,
    // status: slot.allocationStatus,
    start: `${slot.dateSlot}T${slot.startTime}`,
    end: computeEnd(slot.dateSlot, slot.endTime),
    extendedProps: {
      slotStatus: slot.slotStatus,
      schoolID: slot.schoolID,
      schoolName: slot.schoolName,
      hospitalID: slot.hospitalID,
      hospitalName: slot.hospitalName,
      sectionID: slot.sectionID,
      sectionName: slot.sectionName,
      shiftID: slot.shiftID,
      shiftName: slot.shiftName,
      startTime: `${formatTimeString(slot.dateSlot + 'T' + slot.startTime)}`,
      endTime: `${formatTimeString(computeEnd(slot.dateSlot, slot.endTime))}`,
      allocation: slot.allocation,
      allocationStatus: slot.allocationStatus,
      userID: slot.userID,
    }
  }));
}

export function computeEnd(date: string, time: string) {
  // If time is 07:00 but start is 23:00, adjust date +1
  const startHour = parseInt(time.substring(0, 2), 10);
  const isNextDay = startHour < 12; // simple rule if endTime < startTime
  const endDate = isNextDay
    ? new Date(new Date(date).getTime() + 86400000)
    : new Date(date);

  return `${endDate.toISOString().substring(0, 10)}T${time}`;
}

export function formatTimeString(timeString: string): string {
  const date = new Date(timeString);
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(date);
}

export const INITIAL_EVENTS: EventInput[] = [
  {
    id: createEventId(),
    title: 'All-day event',
    start: TODAY_STR
  },
  {
    id: createEventId(),
    title: 'Timed event',
    start: TODAY_STR + 'T00:00:00',
    end: TODAY_STR + 'T03:00:00'
  },
  {
    id: createEventId(),
    title: 'Timed event',
    start: TODAY_STR + 'T12:00:00',
    end: TODAY_STR + 'T15:00:00'
  }
];

export function createEventId() {
  return String(eventGuid++);
}
