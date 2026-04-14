import { NextResponse } from 'next/server';
import { bookSeat } from '@/services/bookingService';

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, seatId, date } = body;

    if (!userId || !seatId || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const targetDate = new Date(date);
    const booking = await bookSeat(parseInt(userId), parseInt(seatId), targetDate);

    return NextResponse.json(booking);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
