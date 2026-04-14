import prisma from '../lib/prisma.js';
import { getAssignedBatchForDate, getNextWorkingDay, isHoliday, isWorkingDay, normalizeDate } from './calendarService.js';
import { startOfWeek, addDays, format } from 'date-fns';

export async function getUserWeeklyAllocation(userId, weekStartDate) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  const weekStart = startOfWeek(weekStartDate, { weekStartsOn: 1 }); // Monday
  
  const allocation = [];

  for (let i = 0; i < 5; i++) { // Mon to Fri
    let currentDay = addDays(weekStart, i);
    const dayStr = format(currentDay, 'yyyy-MM-dd');
    
    currentDay = normalizeDate(currentDay);

    const isHoli = await isHoliday(currentDay);
    if (!isWorkingDay(currentDay) || isHoli) {
      allocation.push({
        date: dayStr,
        status: isHoli ? 'HOLIDAY' : 'WEEKEND',
        isDesignated: false,
      });
      continue;
    }

    const assignedBatch = getAssignedBatchForDate(currentDay);
    const isDesignated = assignedBatch === user.batchId;

    const booking = await prisma.booking.findFirst({
      where: {
        userId,
        date: currentDay,
        status: 'BOOKED'
      },
      include: { seat: true }
    });

    allocation.push({
      date: dayStr,
      status: booking ? 'BOOKED' : (isDesignated ? 'DESIGNATED' : 'NOT_BOOKED'),
      isDesignated,
      assignedBatch,
      booking: booking ? { id: booking.id, seatName: booking.seat.name, type: booking.type } : null
    });
  }

  return { 
    user: { id: user.id, name: user.name, squadId: user.squadId, batchId: user.batchId }, 
    allocation 
  };
}

export async function generatePreassignedBookings(dateInput) {
  const date = normalizeDate(dateInput);
  
  if (!isWorkingDay(date) || await isHoliday(date)) {
    return { success: false, message: 'Not a working day or holiday' };
  }

  const batchId = getAssignedBatchForDate(date);
  if (!batchId) return { success: false, message: 'No batch assigned for this day' };

  const designatedSeats = await prisma.seat.findMany({
    where: { type: 'DESIGNATED' },
    orderBy: { id: 'asc' }
  });

  const users = await prisma.user.findMany({
    where: { batchId },
    orderBy: { id: 'asc' }
  });

  let allocated = 0;
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const seat = designatedSeats[i];
    if (!seat) break;

    const existing = await prisma.booking.findFirst({
      where: { userId: user.id, date },
    });

    if (!existing) {
      await prisma.booking.create({
        data: {
          userId: user.id,
          seatId: seat.id,
          date,
          status: 'BOOKED',
          type: 'PREASSIGNED'
        }
      });
      allocated++;
    }
  }

  return { success: true, allocated, batchId };
}
