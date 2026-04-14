import { addDays, isWeekend, format, differenceInCalendarWeeks, startOfWeek, isSameDay } from 'date-fns';
import { toZonedTime, formatInTimeZone } from 'date-fns-tz';
import prisma from '../lib/prisma.js';

// Enforce Centralized Timezone
const IST_TIMEZONE = 'Asia/Kolkata';

export function getISTNow() {
  return toZonedTime(new Date(), IST_TIMEZONE);
}

// Convert an absolute boundary generic date into a flat UTC midnight structure representing the logical day bounds
export function normalizeDate(date) {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

// Reference date to determine Week 1 vs Week 2 (e.g. assume a past Monday as Week 1)
const REF_DATE = new Date('2024-01-01T00:00:00Z');

export async function isHoliday(date) {
  const startOfDay = normalizeDate(date);

  const holiday = await prisma.holiday.findUnique({
    where: { date: startOfDay },
  });

  return !!holiday;
}

export function isWorkingDay(date) {
  return !isWeekend(date);
}

export async function getNextWorkingDay(from) {
  const baseDate = from ? normalizeDate(from) : normalizeDate(getISTNow());
  let nextDate = addDays(baseDate, 1);
  nextDate = normalizeDate(nextDate);

  while (!isWorkingDay(nextDate) || await isHoliday(nextDate)) {
    nextDate = addDays(nextDate, 1);
  }

  return nextDate;
}

export function getWeekCycle(date) {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 });
  const refWeekStart = startOfWeek(REF_DATE, { weekStartsOn: 1 });
  
  const weekDiff = differenceInCalendarWeeks(weekStart, refWeekStart, { weekStartsOn: 1 });
  return (weekDiff % 2 === 0) ? 1 : 2;
}

export function getAssignedBatchForDate(date) {
  if (isWeekend(date)) return null;

  const cycle = getWeekCycle(date);
  const dayOfWeek = date.getDay(); // 0: Sun, 1: Mon, 2: Tue, 3: Wed, 4: Thu, 5: Fri, 6: Sat
  
  const isMonToWed = dayOfWeek >= 1 && dayOfWeek <= 3;
  const isThuToFri = dayOfWeek >= 4 && dayOfWeek <= 5;

  if (cycle === 1) {
    if (isMonToWed) return 1;
    if (isThuToFri) return 2;
  } else {
    // Cycle 2
    if (isMonToWed) return 2;
    if (isThuToFri) return 1;
  }
  
  return null;
}
