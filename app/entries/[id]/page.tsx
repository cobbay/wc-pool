import { db } from '@/app/lib/db';
import { poolEntries, entryTeamSelections, teams, pools } from '@/app/lib/schema';
import { eq, and } from 'drizzle-orm';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface EntryPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EntryPage({ params }: EntryPageProps) {
  const { id } = await params;
  const entryId = parseInt(id);

  // Validate entry ID
  if (isNaN(entryId) || entryId <= 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/entries" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Back to Entries
          </Link>
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Entry ID</h1>
            <p className="text-gray-600">The entry ID must be a valid number.</p>
          </div>
        </div>
      </div>
    );
  }

  // Fetch entry with pool info
  const entryData = await db
    .select({
      id: poolEntries.id,
      name: poolEntries.name,
      poolId: poolEntries.poolId,
      userId: poolEntries.userId,
      budgetSpent: poolEntries.budgetSpent,
      createdAt: poolEntries.createdAt,
    })
    .from(poolEntries)
    .where(eq(poolEntries.id, entryId));

  if (entryData.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Back
          </Link>
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Entry Not Found</h1>
            <p className="text-gray-600">The entry you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    );
  }

  const entry = entryData[0];

  // Fetch pool name
  const poolData = await db
    .select({ name: pools.name })
    .from(pools)
    .where(eq(pools.id, entry.poolId));

  const poolName = poolData[0]?.name || 'Unknown Pool';

  // Fetch team selections for this entry
  const teamSelections = await db
    .select({
      selectionId: entryTeamSelections.id,
      teamId: entryTeamSelections.teamId,
      teamName: teams.name,
      teamCode: teams.code,
      teamFlag: teams.flag,
      cost: teams.cost,
      isShort: entryTeamSelections.isShort,
      pointsEarned: entryTeamSelections.pointsEarned,
    })
    .from(entryTeamSelections)
    .innerJoin(teams, eq(entryTeamSelections.teamId, teams.id))
    .where(eq(entryTeamSelections.entryId, entry.id))
    .orderBy(entryTeamSelections.isShort); // Short picks last

  // Calculate totals
  const totalCost = teamSelections.reduce((sum, sel) => {
    const cost = sel.isShort ? sel.cost * -1 : sel.cost; // Short gives back half
    return sum + cost;
  }, 0);
  const totalPoints = teamSelections.reduce((sum, sel) => sum + (sel.pointsEarned || 0), 0);
  const shortPick = teamSelections.find(sel => sel.isShort);
  const longPicks = teamSelections.filter(sel => !sel.isShort);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-8 py-6">
          <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Back to Entries
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{entry.name}</h1>
              <p className="text-gray-600 mt-1">{poolName}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Total Points</div>
              <div className="text-3xl font-bold text-blue-600">{totalPoints}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-8 py-8">
        {/* Budget Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">Teams Selected</div>
            <div className="text-2xl font-bold text-gray-900">{teamSelections.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">Total Budget Used</div>
            <div className="text-2xl font-bold text-gray-900">{totalCost} / 100</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">Budget Remaining</div>
            <div className={`text-2xl font-bold ${100 - totalCost >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {100 - totalCost}
            </div>
          </div>
        </div>

        {/* Long Picks */}
        {longPicks.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Long Picks</h2>
            <div className="space-y-3">
              {longPicks.map(selection => (
                <div
                  key={selection.teamId}
                  className="bg-white rounded-lg shadow p-4 flex items-center justify-between hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4 flex-1">
                    {selection.teamFlag && (
                      <span className="text-4xl">{selection.teamFlag}</span>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900">{selection.teamName}</h3>
                      <p className="text-sm text-gray-500">{selection.teamCode}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Cost</div>
                    <div className="text-lg font-bold text-gray-900">{selection.cost} pts</div>
                    <div className="text-xs text-gray-500 mt-1">{selection.pointsEarned || 0} points earned</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Short Pick */}
        {shortPick && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Short Pick</h2>
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg shadow-md p-6 border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {shortPick.teamFlag && (
                    <span className="text-6xl">{shortPick.teamFlag}</span>
                  )}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{shortPick.teamName}</h3>
                    <p className="text-sm text-gray-600">{shortPick.teamCode}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Recovers {shortPick.cost} pts if team scores 0 points
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Recovery Points</div>
                  <div className="text-2xl font-bold text-orange-600">+{shortPick.cost}</div>
                  <div className="text-xs text-gray-500 mt-1">{shortPick.pointsEarned || 0} points earned</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No Teams */}
        {teamSelections.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">No teams selected for this entry yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
