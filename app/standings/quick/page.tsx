import { db } from '@/app/lib/db';
import { poolEntries, pools, entryTeamSelections, teams } from '@/app/lib/schema';
import { eq } from 'drizzle-orm';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function QuickStandingsPage() {
  // Get the main pool
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

  // For each entry, calculate total points
  const entriesWithPoints = await Promise.all(
    entries.map(async entry => {
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
        name: entry.name,
        totalPoints,
      };
    })
  );

  // Sort by points descending, then by name ascending for ties
  const sortedEntries = entriesWithPoints.sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) {
      return b.totalPoints - a.totalPoints;
    }
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-8 py-6">
          <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Quick Standings</h1>
          <p className="text-gray-600 mt-1">Entries and total points only</p>
        </div>
      </div>

      {/* Standings Table */}
      <div className="max-w-4xl mx-auto px-8 py-8">
        {sortedEntries.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">No entries yet.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Rank</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Entry</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Total Points</th>
                </tr>
              </thead>
              <tbody>
                {sortedEntries.map((entry, index) => (
                  <tr key={entry.name} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{index + 1}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{entry.name}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-blue-600 text-right">{entry.totalPoints}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
