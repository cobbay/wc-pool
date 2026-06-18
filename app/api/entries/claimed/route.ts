import { db } from '@/app/lib/db';
import { poolEntries, entryTeamSelections } from '@/app/lib/schema';
import { eq } from 'drizzle-orm';
import { NextResponse, NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Get user ID from query parameter
    const userId = req.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({});
    }

    // Get the entry claimed by this user
    const entry = await db
      .select({
        id: poolEntries.id,
        name: poolEntries.name,
        poolId: poolEntries.poolId,
      })
      .from(poolEntries)
      .where(eq(poolEntries.userId, userId))
      .limit(1);

    if (entry.length === 0) {
      return NextResponse.json({});
    }

    // Calculate points for this entry
    const teamSelections = await db
      .select({
        pointsEarned: entryTeamSelections.pointsEarned,
        isShort: entryTeamSelections.isShort,
      })
      .from(entryTeamSelections)
      .where(eq(entryTeamSelections.entryId, entry[0].id));

    const totalPoints = teamSelections.reduce((sum, sel) => {
      const points = sel.pointsEarned || 0;
      return sel.isShort ? sum - points : sum + points;
    }, 0);

    return NextResponse.json({
      id: entry[0].id,
      name: entry[0].name,
      totalPoints,
    });
  } catch (error) {
    console.error('Error fetching claimed entry:', error);
    return NextResponse.json({});
  }
}
