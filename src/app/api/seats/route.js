import { NextResponse } from 'next/server';
import { getSeatMap } from '@/services/bookingService';

export const dynamic = 'force-dynamic';

import { getNextWorkingDay } from '@/services/calendarService';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const dateStr = searchParams.get('date');
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
  }

  try {
    let date;
    if (!dateStr) {
      const now = new Date();
      date = await getNextWorkingDay(now);
    } else {
      date = new Date(dateStr);
    }

    const data = await getSeatMap(date, parseInt(userId));
    // Embed the resolved date back to the client natively
    data.resolvedDateStr = date.toISOString().split('T')[0];
    
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
