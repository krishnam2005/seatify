import prisma from '../lib/prisma.js';
import { getNextWorkingDay, getAssignedBatchForDate, isHoliday, getISTNow, normalizeDate } from './calendarService.js';

export async function getSeatMap(dateInput, userId) {
  const date = normalizeDate(dateInput);

  const allSeats = await prisma.seat.findMany({ orderBy: { id: 'asc' } });
  const activeBookings = await prisma.booking.findMany({
    where: {
      date,
      status: 'BOOKED'
    }
  });

  const bookedMap = new Map();
  activeBookings.forEach(b => bookedMap.set(b.seatId, b));

  const seats = allSeats.map(seat => {
    const booking = bookedMap.get(seat.id);
    return {
      ...seat,
      isBooked: !!booking,
      isMine: booking?.userId === userId,
      status: booking ? 'BOOKED' : 'AVAILABLE'
    };
  });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  const assignedBatch = getAssignedBatchForDate(date);
  const isAssignedDay = assignedBatch === user.batchId;

  const nowIST = getISTNow();
  const nextWorkingDay = await getNextWorkingDay(nowIST);

  let canBook = true;
  let blockReason = '';

  const isHolidayDate = await isHoliday(date);

  if (isHolidayDate) {
    canBook = false;
    blockReason = 'Booking not allowed — Holiday';
  } else if (date.getTime() > nextWorkingDay.getTime() || date.getTime() < nextWorkingDay.getTime()) {
    canBook = false;
    blockReason = 'Can only book for the next working day.';
  } else if (nowIST.getHours() < 15) {
    canBook = false;
    blockReason = 'Booking opens after 3 PM for next working day.';
  } else if (isAssignedDay) {
    canBook = false;
    blockReason = 'You are already assigned a seat for this day.';
  } else if (activeBookings.length >= 50) {
    canBook = false;
    blockReason = 'Maximum capacity reached for this day.';
  }

  return {
    seats,
    userBatch: user.batchId,
    userSquad: user.squadId,
    isAssignedDay,
    isHoliday: isHolidayDate,
    canBook,
    blockReason,
    isBefore3PM: nowIST.getHours() < 15,
    nextWorkingDayStr: nextWorkingDay.toISOString().split('T')[0]
  };
}

export async function bookSeat(userId, seatId, targetDateInput) {
  const targetDate = normalizeDate(targetDateInput);
  
  const nowIST = getISTNow();
  const nextWorkingDay = await getNextWorkingDay(nowIST);

  if (targetDate.getTime() > nextWorkingDay.getTime() || targetDate.getTime() < nextWorkingDay.getTime()) {
    throw new Error('Can only book for the immediate next working day');
  }

  if (nowIST.getHours() < 15) {
      throw new Error('Booking window for the next working day opens at 3 PM.');
  }

  const isHolidayDate = await isHoliday(targetDate);
  if (isHolidayDate) {
      throw new Error('Booking not allowed due to holiday.');
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  const assignedBatch = getAssignedBatchForDate(targetDate);
  if (user.batchId === assignedBatch) {
    throw new Error('You are already designated for this day via your batch schedule. No need to book a floating seat.');
  }

  const existingBooking = await prisma.booking.findFirst({
    where: { userId, date: targetDate, status: 'BOOKED' }
  });
  if (existingBooking) throw new Error('User already has a booking for this date');

  const activeBookingsCount = await prisma.booking.count({
    where: { date: targetDate, status: 'BOOKED' }
  });
  if (activeBookingsCount >= 50) throw new Error('Maximum capacity reached for this day');

  const seat = await prisma.seat.findUnique({ where: { id: seatId } });
  if (!seat) throw new Error('Seat not found');
  if (seat.type !== 'FLOATING') {
    throw new Error('Designated seats cannot be booked manually. They are auto-assigned by the system.');
  }

  const result = await prisma.$transaction(async (tx) => {
    const isTaken = await tx.booking.findFirst({
      where: {
        seatId,
        date: targetDate,
        status: 'BOOKED'
      }
    });

    if (isTaken) throw new Error('Seat is already booked');

    const newBooking = await tx.booking.create({
      data: {
        userId,
        seatId,
        date: targetDate,
        status: 'BOOKED',
        type: 'BLOCKED'
      }
    });
    return newBooking;
  });

  return result;
}

export async function cancelBooking(userId, bookingId) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId }
  });

  if (!booking) throw new Error('Booking not found');
  if (booking.userId !== userId) throw new Error('Unauthorized');

  const today = new Date();
  today.setHours(0,0,0,0);
  
  const bookingDate = new Date(booking.date);
  bookingDate.setHours(0,0,0,0);

  if (bookingDate.getTime() < today.getTime()) {
    throw new Error('Cannot cancel past bookings');
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: 'CANCELLED' }
  });

  return { success: true };
}
