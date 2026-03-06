import { EventInput } from '@fullcalendar/core';

let eventGuid = 0;
const TODAY_STR = new Date().toISOString().replace(/T.*$/, ''); // YYYY-MM-DD of today


export function mapSlotsToEvents(slots: any[], roleID: string | null = null) {
  return slots.map(slot => ({
    id: slot.slotID,
    title: (roleID === 'UGR0001' || roleID === 'UGR0002') ? `${slot.schoolName}` : `${slot.hospitalName}(${slot.sectionName}) - ${slot.shiftName}`,
    shift: slot.shiftName,
    // `${slot.shiftName} - ${slot.sectionName}`,
    // describedAs: slot.shiftName,
    // status: slot.allocationStatus,
    start: `${slot.dateSlot}T${slot.startTime}`,
    end: computeEnd(slot.dateSlot, slot.endTime),
    extendedProps: {
      slotID: slot.slotID,
      dateSlot: slot.dateSlot,
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
      fullname: slot.fullname,
    }
  }));
}

// export function aggregateSlotsByDay(slots: any[]) {
//   const map = new Map<string, any[]>();

//   slots.forEach(slot => {
//     const day = slot.dateSlot;
//     if (!map.has(day)) map.set(day, []);
//     map.get(day)!.push(slot);
//   });

//   return Array.from(map.entries()).map(([day, daySlots]) => ({
//     id: day,
//     start: day,
//     allDay: true,

//     title: `Schedules (${daySlots.length})`,
//     extendedProps: {
//       slots: daySlots
//     }
//   }));
// }

// export function aggregateSlotsByDay(
//   slots: any[],
//   roleID: string | null = null,
//   currentUserID: string | null = null
// ): EventInput[] {
//   // 1️⃣ Filter slots based on role
//   let filteredSlots = slots;
//   if (roleID !== 'UGR0001' && roleID !== 'UGR0002' && currentUserID) {
//     filteredSlots = slots.filter(slot => slot.userID === currentUserID);
//   }

//   // 2️⃣ Aggregate by date
//   const dateMap = new Map<string, any[]>();
//   filteredSlots.forEach(slot => {
//     const day = slot.dateSlot;
//     if (!dateMap.has(day)) dateMap.set(day, []);
//     dateMap.get(day)!.push(slot);
//   });

//   // 3️⃣ For each day, group slots by school (admin) or hospital (coordinator)
//   const events: EventInput[] = [];

//   dateMap.forEach((daySlots, day) => {
//     if (roleID === 'UGR0001' || roleID === 'UGR0002') {
//       // Admin → group by schoolID
//       const schoolMap = new Map<string, any[]>();
//       daySlots.forEach(slot => {
//         if (!schoolMap.has(slot.schoolID)) schoolMap.set(slot.schoolID, []);
//         schoolMap.get(slot.schoolID)!.push(slot);
//       });

//       schoolMap.forEach((schoolSlots, schoolID) => {
//         const schoolName = schoolSlots[0].schoolName;
//         events.push({
//           id: `${day}-${schoolID}`,
//           start: day,
//           allDay: true,
//           title: schoolName, // Show school name
//           extendedProps: { slots: schoolSlots }
//         });
//       });

//     } else {
//       // Coordinator → group by hospitalID
//       const hospitalMap = new Map<string, any[]>();
//       daySlots.forEach(slot => {
//         if (!hospitalMap.has(slot.hospitalID)) hospitalMap.set(slot.hospitalID, []);
//         hospitalMap.get(slot.hospitalID)!.push(slot);
//       });

//       hospitalMap.forEach((hospitalSlots, hospitalID) => {
//         const hospitalName = hospitalSlots[0].hospitalName;
//         events.push({
//           id: `${day}-${hospitalID}`,
//           start: day,
//           allDay: true,
//           title: hospitalName, // Show hospital name
//           extendedProps: { slots: hospitalSlots }
//         });
//       });
//     }
//   });

//   return events;
// }


// export function aggregateSlotsByDay(
//   slots: any[],
//   roleID: string | null = null,
//   currentUserID: string | null = null,
//   hospitalID: string | null = null
// ): EventInput[] {

//   const isAdmin = roleID === 'UGR0001' || roleID === 'UGR0002';

//   // 1️⃣ Filter slots by role
//   const filteredSlots = (!isAdmin && currentUserID)
//     ? slots.filter(s => s.userID === currentUserID)
//     : slots;

//   // 2️⃣ Group slots by date
//   const dateMap = new Map<string, any[]>();
//   for (const slot of filteredSlots) {
//     if (!dateMap.has(slot.dateSlot)) {
//       dateMap.set(slot.dateSlot, []);
//     }
//     dateMap.get(slot.dateSlot)!.push(slot);
//   }

//   // 3️⃣ Build events
//   const events: EventInput[] = [];

//   dateMap.forEach((daySlots, day) => {

//     const groupKey = isAdmin ? 'schoolID' : 'hospitalID';
//     const titleKey = isAdmin ? 'schoolName' : 'hospitalName';

//     const groupMap = new Map<string, any[]>();

//     for (const slot of daySlots) {
//       const key = slot[groupKey];
//       if (!groupMap.has(key)) {
//         groupMap.set(key, []);
//       }
//       groupMap.get(key)!.push(slot);
//     }

//     groupMap.forEach((groupSlots, key) => {
//       events.push({
//         id: `${day}-${key}`,
//         start: day,
//         allDay: true,
//         title: groupSlots[0][titleKey],
//         extendedProps: { slots: groupSlots }
//       });
//     });
//   });

//   return events;
// }

export function aggregateSlotsByDay(
  slots: any[],
  roleID: string | null = null,
  currentUserID: string | null = null,
  currentSchoolID: string | null = null,
  currentHospitalID: string | null = null
): EventInput[] {

  const isAdmin = roleID === 'UGR0001' || roleID === 'UGR0002'
  const isHospitalSupervisor = roleID === 'UGR0005';
  const isSchoolCoordinator = roleID === 'UGR0003';
  const isStudent = roleID === 'UGR0004';

  let filteredSlots = slots;

  // 🔹 School Coordinator → only their school
  if (isSchoolCoordinator && currentSchoolID) {
    filteredSlots = slots.filter(s => s.schoolID === currentSchoolID);
  }

  // 🔹 Hospital Supervisor → only their hospital
  if (isHospitalSupervisor && currentHospitalID) {
    filteredSlots = slots.filter(s => s.hospitalID === currentHospitalID);
  }

  // 🔹 Admin → no filtering

  // Group by date
  const dateMap = new Map<string, any[]>();
  for (const slot of filteredSlots) {
    if (!dateMap.has(slot.dateSlot)) {
      dateMap.set(slot.dateSlot, []);
    }
    dateMap.get(slot.dateSlot)!.push(slot);
  }

  const events: EventInput[] = [];

  dateMap.forEach((daySlots, day) => {

    // 🔹 Student → 1 event per day
    // if (isStudent) {
    //   events.push({
    //     id: day,
    //     start: day,
    //     allDay: true,
    //     title: `${daySlots.length}`,
    //     extendedProps: { slots: daySlots }
    //   });
    //   return;
    // }

    // 🔹 Admin → group by school
    // 🔹 School Coordinator → group by hospital
    // 🔹 Hospital Supervisor → group by hospital
    const groupKey =
      isAdmin ? 'schoolID' : 'hospitalID';

    // const titleKey =
    //   isAdmin ? 'schoolName' : 'hospitalName';
    const titleKey = 'schoolName';

    const groupMap = new Map<string, any[]>();

    for (const slot of daySlots) {
      const key = slot[groupKey];
      if (!key) continue;

      if (!groupMap.has(key)) {
        groupMap.set(key, []);
      }
      groupMap.get(key)!.push(slot);
    }

    groupMap.forEach((groupSlots, key) => {
      events.push({
        id: `${day}-${key}`,
        start: day,
        allDay: true,
        title: groupSlots[0][titleKey] || 'Unknown',
        extendedProps: { slots: groupSlots }
      });
    });

  });

  return events;
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
