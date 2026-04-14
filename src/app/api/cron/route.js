import { NextResponse } from 'next/server';
import { generatePreassignedBookings } from '@/services/allocationService';
import { getNextWorkingDay, getISTNow } from '@/services/calendarService';

export async function POST(request) {
  try {
    const nextWorkingDay = await getNextWorkingDay(getISTNow());
    const result = await generatePreassignedBookings(nextWorkingDay);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
