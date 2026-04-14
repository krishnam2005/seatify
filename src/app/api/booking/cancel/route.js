import { NextResponse } from 'next/server';
import { cancelBooking } from '@/services/bookingService';

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, bookingId } = body;

    if (!userId || !bookingId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await cancelBooking(parseInt(userId), parseInt(bookingId));

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
