import { db } from '@/app/lib/db';
import { poolEntries } from '@/app/lib/schema';
import { eq } from 'drizzle-orm';
import { NextResponse, NextRequest } from 'next/server';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get user ID from request body
    const body = await req.json();
    const userId = body.userId as string;

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const entryId = parseInt(params.id, 10);
    if (isNaN(entryId)) {
      return NextResponse.json(
        { error: 'Invalid entry ID' },
        { status: 400 }
      );
    }

    // Check if entry exists and is unclaimed
    const entry = await db
      .select()
      .from(poolEntries)
      .where(eq(poolEntries.id, entryId))
      .limit(1);

    if (entry.length === 0) {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      );
    }

    if (entry[0].userId !== null && entry[0].userId !== userId) {
      return NextResponse.json(
        { error: 'Entry already claimed' },
        { status: 400 }
      );
    }

    // Update entry with user ID
    await db
      .update(poolEntries)
      .set({ userId })
      .where(eq(poolEntries.id, entryId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error claiming entry:', error);
    return NextResponse.json(
      { error: 'Failed to claim entry' },
      { status: 500 }
    );
  }
}
