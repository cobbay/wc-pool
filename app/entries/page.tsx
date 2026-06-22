import { db } from '@/app/lib/db';
import { poolEntries, pools, entryTeamSelections, teams } from '@/app/lib/schema';
import { eq } from 'drizzle-orm';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function EntriesPage() {
  // Get the main pool (assuming pool_id = 1)
  const poolData = await db
    .select()
    .from(pools)
    .where(eq(pools.id, 1));

  if (poolData.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Home
          </Link>
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">No Pool Found</h1>
            <p className="text-gray-600">Please set up a pool first.</p>
          </div>
        </div>
      </div>
    );
  }

  const pool = poolData[0];

  // Fetch all entries for this pool
  const entries = await db
    .select()
    .from(poolEntries)
    .where(eq(poolEntries.poolId, pool.id));

  // For each entry, calculate stats from actual team selections
  const entriesWithStats = await Promise.all(
    entries.map(async entry => {
      // Get team selections with team cost info
      const teamSelections = await db
        .select({
          teamId: entryTeamSelections.teamId,
          isShort: entryTeamSelections.isShort,
          cost: teams.cost,
          pointsEarned: entryTeamSelections.pointsEarned,
        })
        .from(entryTeamSelections)
        .innerJoin(teams, eq(entryTeamSelections.teamId, teams.id))
        .where(eq(entryTeamSelections.entryId, entry.id));

      const teamCount = teamSelections.length;
      
      // Calculate budget spent: sum all costs except short pick subtracts its cost
      let budgetUsed = 0;
      let totalPoints = 0;
      
      teamSelections.forEach(sel => {
        if (sel.isShort) {
          // Short pick recovers budget (negative cost)
          budgetUsed -= sel.cost;
        } else {
          // Long pick costs budget
          budgetUsed += sel.cost;
        }
        totalPoints += sel.pointsEarned || 0;
      });

      return {
        ...entry,
        teamCount,
        budgetUsed,
        totalPoints,
      };
    })
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-8 py-6">
          <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{pool.name}</h1>
          <p className="text-gray-600 mt-1">{entriesWithStats.length} entries, sorted alphabetically</p>
        </div>
      </div>

      {/* Entries List */}
      <div className="max-w-6xl mx-auto px-8 py-8">
        {entriesWithStats.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">No entries yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {entriesWithStats.sort((a, b) => a.name.localeCompare(b.name)).map(entry => (
              <Link key={entry.id} href={`/entries/${entry.id}`}>
                <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 truncate">
                    {entry.name}
                  </h2>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Points</span>
                      <span className="font-semibold text-blue-600 text-lg">{entry.totalPoints}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Teams</span>
                      <span className="font-semibold text-gray-900">{entry.teamCount}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Current ranking</span>
                      <span className="font-semibold text-gray-900">1st</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="text-sm text-blue-600 font-medium">
                      View Details →
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
