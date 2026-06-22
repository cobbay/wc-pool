import { db } from '@/app/lib/db';
import { poolEntries, entryTeamSelections } from '@/app/lib/schema';
import { isNull, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Get all entries without a user (unclaimed)
    const entries = await db
      .select({
        id: poolEntries.id,
        name: poolEntries.name,
        poolId: poolEntries.poolId,
        userId: poolEntries.userId,
      })
      .from(poolEntries)
      .where(isNull(poolEntries.userId));

    // For each entry, calculate total points
    const entriesWithPoints = await Promise.all(
      entries.map(async (entry) => {
        const teamSelections = await db
          .select({
            pointsEarned: entryTeamSelections.pointsEarned,
            isShort: entryTeamSelections.isShort,
          })
          .from(entryTeamSelections)
          .where(eq(entryTeamSelections.entryId, entry.id));

        const totalPoints = teamSelections.reduce((sum, sel) => {
          const points = sel.pointsEarned || 0;
          return sel.isShort ? sum - points : sum + points;
        }, 0);

        return {
          ...entry,
          totalPoints,
        };
      })
    );

    // Sort by points descending
    entriesWithPoints.sort((a, b) => b.totalPoints - a.totalPoints);

    return NextResponse.json(entriesWithPoints);
  } catch (error) {
    console.error('Error fetching available entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch entries' },
      { status: 500 }
    );
  }
}
