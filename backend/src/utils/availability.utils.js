import {
  APPOINTMENT_DURATION_MINUTES,
  SLOT_INTERVAL_MINUTES,
  BUSINESS_HOURS,
  MIN_ADVANCE_HOURS,
  MAX_FUTURE_DAYS,
  BUSINESS_WEEKDAYS
} from "../constants/availability.js";

export function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

export function startOfDay(date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function endOfDay(date) {
  const copy = new Date(date);
  copy.setHours(23, 59, 59, 999);
  return copy;
}

export function isBusinessDay(date) {
  const weekday = date.getDay(); // 0 domingo, 1 segunda, ..., 6 sábado
  return BUSINESS_WEEKDAYS.includes(weekday);
}

export function buildBusinessWindow(date) {
  const dayStart = new Date(date);
  dayStart.setHours(BUSINESS_HOURS.startHour, 0, 0, 0);

  const dayEnd = new Date(date);
  dayEnd.setHours(BUSINESS_HOURS.endHour, 0, 0, 0);

  return { dayStart, dayEnd };
}

export function isWithinAdvanceWindow(startDate) {
  const now = new Date();
  const minAllowed = addMinutes(now, MIN_ADVANCE_HOURS * 60);
  return startDate >= minAllowed;
}

export function isWithinFutureLimit(startDate) {
  const now = new Date();
  const maxAllowed = startOfDay(addMinutes(now, MAX_FUTURE_DAYS * 24 * 60 + 24 * 60));
  return startDate < maxAllowed;
}

export function buildSlotEnd(startDate) {
  return addMinutes(startDate, APPOINTMENT_DURATION_MINUTES);
}

export function isInsideBusinessHours(startDate, endDate) {
  const { dayStart, dayEnd } = buildBusinessWindow(startDate);
  return startDate >= dayStart && endDate <= dayEnd;
}

export function intervalsOverlap(startA, endA, startB, endB) {
  return startA < endB && endA > startB;
}

export function generateDailySlots(date) {
  const { dayStart, dayEnd } = buildBusinessWindow(date);
  const slots = [];

  let cursor = new Date(dayStart);

  while (true) {
    const slotStart = new Date(cursor);
    const slotEnd = buildSlotEnd(slotStart);

    if (slotEnd > dayEnd) {
      break;
    }

    slots.push({
      start: slotStart,
      end: slotEnd
    });

    cursor = addMinutes(cursor, SLOT_INTERVAL_MINUTES);
  }
  

  return slots;
}
export function parseLocalDateString(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}