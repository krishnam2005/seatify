import { addDays, isWeekend, format, differenceInCalendarWeeks, startOfWeek, isSameDay } from 'date-fns';
import prisma from '../lib/prisma.js';

// Reference date to determine Week 1 vs Week 2 (e.g. assume a past Monday as Week 1)
const REF_DATE = new Date('2024-01-01');

export async function isHoliday(date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const holiday = await prisma.holiday.findUnique({
    where: { date: startOfDay },
  });

  return !!holiday;
}

export function isWorkingDay(date) {
  return !isWeekend(date);
}

export async function getNextWorkingDay(from = new Date()) {
  let nextDate = addDays(from, 1);
  nextDate.setHours(0, 0, 0, 0);

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
