import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma.js';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const idStr = searchParams.get('id');

  if (!idStr) {
    return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(idStr) },
      select: { id: true, name: true, squadId: true, batchId: true, email: true }
    });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
