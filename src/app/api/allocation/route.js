import { NextResponse } from 'next/server';
import { getUserWeeklyAllocation } from '@/services/allocationService';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const dateStr = searchParams.get('date');

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  const date = dateStr ? new Date(dateStr) : new Date();

  try {
    const data = await getUserWeeklyAllocation(parseInt(userId), date);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
