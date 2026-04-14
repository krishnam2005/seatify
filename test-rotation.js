const { addDays, startOfWeek, differenceInCalendarWeeks } = require('date-fns');

const REF_DATE = new Date('2024-01-01T00:00:00Z');

function getWeekCycle(date) {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 });
  const refWeekStart = startOfWeek(REF_DATE, { weekStartsOn: 1 });
  
  const weekDiff = differenceInCalendarWeeks(weekStart, refWeekStart, { weekStartsOn: 1 });
  console.log(`Date: ${date.toDateString()}, WeekDiff: ${weekDiff}, Cycle: ${(weekDiff % 2 === 0) ? 1 : 2}`);
  return (weekDiff % 2 === 0) ? 1 : 2;
}

function getAssignedBatchForDate(date) {
  const cycle = getWeekCycle(date);
  const dayOfWeek = date.getDay();
  
  const isMonToWed = dayOfWeek >= 1 && dayOfWeek <= 3;
  const isThuToFri = dayOfWeek >= 4 && dayOfWeek <= 5;

  if (cycle === 1) {
    if (isMonToWed) return 1;
    if (isThuToFri) return 2;
  } else {
    if (isMonToWed) return 2;
    if (isThuToFri) return 1;
  }
  return null;
}

console.log("Testing Rotation Logic:");
const today = new Date('2026-04-14T12:00:00Z'); // Tuesday
for (let i = 0; i < 14; i++) {
    const d = addDays(today, i);
    const b = getAssignedBatchForDate(d);
    console.log(`Day: ${d.toDateString()}, Assigned Batch: ${b}`);
    console.log("---");
}
