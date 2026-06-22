import { db } from '@/app/lib/db';
import { poolEntries, entryTeamSelections, teams, pools, matches } from '@/app/lib/schema';
import { eq, and, or, gte } from 'drizzle-orm';
import Link from 'next/link';
import { getFlagImageUrl } from '@/app/lib/flag-utils';

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
  const poolName = 'East Rutherford Project 2026';

  // Fetch team selections for this entry
  const teamSelectionsBase = await db
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

  // Fetch next match info for each team
  const teamSelections = await Promise.all(
    teamSelectionsBase.map(async (selection) => {
      // Get all upcoming matches for this team
      const upcomingMatchesData = await db
        .select({
          id: matches.id,
          matchDate: matches.matchDate,
          homeTeamId: matches.homeTeamId,
          awayTeamId: matches.awayTeamId,
          homeTeamName: teams.name,
        })
        .from(matches)
        .innerJoin(teams, eq(matches.homeTeamId, teams.id))
        .where(
          and(
            or(
              eq(matches.homeTeamId, selection.teamId),
              eq(matches.awayTeamId, selection.teamId)
            ),
            gte(matches.matchDate, new Date())
          )
        )
        .orderBy(matches.matchDate);

      let nextMatch = null;
      if (upcomingMatchesData.length > 0) {
        const match = upcomingMatchesData[0];
        const isHome = match.homeTeamId === selection.teamId;
        const opponentTeamId = isHome ? match.awayTeamId : match.homeTeamId;
        
        // Get opponent name
        const opponentData = await db
          .select({ name: teams.name })
          .from(teams)
          .where(eq(teams.id, opponentTeamId));
        
        nextMatch = {
          matchDate: match.matchDate,
          opponent: opponentData[0]?.name || 'Unknown',
          isHome: isHome,
        };
      }

      return {
        ...selection,
        nextMatch,
      };
    })
  );

  // Calculate totals
  const totalCost = teamSelections.reduce((sum, sel) => {
    const cost = sel.isShort ? sel.cost * -1 : sel.cost; // Short gives back half
    return sum + cost;
  }, 0);
  const totalPoints = teamSelections.reduce((sum, sel) => sum + (sel.pointsEarned || 0), 0);
  const shortPick = teamSelections.find(sel => sel.isShort);
  const longPicks = teamSelections.filter(sel => !sel.isShort);

  // Find team with next match
  const nextMatchTeam = teamSelections
    .filter(sel => sel.nextMatch)
    .sort((a, b) => {
      const dateA = a.nextMatch?.matchDate ? new Date(a.nextMatch.matchDate).getTime() : Infinity;
      const dateB = b.nextMatch?.matchDate ? new Date(b.nextMatch.matchDate).getTime() : Infinity;
      return dateA - dateB;
    })[0] || null;

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
        {/* Standard Picks */}
        {longPicks.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Standard Picks</h2>
            <div className="space-y-3">
              {longPicks.map(selection => {
                const isNextMatch = nextMatchTeam?.teamId === selection.teamId;
                return (
                  <div
                    key={selection.teamId}
                    className={`rounded-lg shadow p-4 flex items-center justify-between hover:shadow-md transition-shadow bg-white`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      {selection.teamCode && (
                        <img
                          src={getFlagImageUrl(selection.teamCode)}
                          alt={selection.teamName}
                          className="w-16 h-auto rounded"
                          loading="lazy"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900">{selection.teamName}</h3>
                        {selection.nextMatch && (
                          <div className={`text-xs mt-1 ${isNextMatch ? 'text-green-600 font-bold' : 'text-gray-600'}`}>
                            Next: {new Date(selection.nextMatch.matchDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}, {new Date(selection.nextMatch.matchDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'America/Chicago' })} vs {selection.nextMatch.opponent}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">{selection.pointsEarned || 0} {(selection.pointsEarned || 0) === 1 ? 'point' : 'points'}</div>
                      <div className="text-xs text-gray-500 mt-1">Cost {selection.cost} pts</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Short Pick */}
        {shortPick && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Short Pick</h2>
            <div className={`rounded-lg shadow-md p-6 bg-white`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  {shortPick.teamCode && (
                    <img
                      src={getFlagImageUrl(shortPick.teamCode)}
                      alt={shortPick.teamName}
                      className="w-20 h-auto rounded"
                      loading="lazy"
                    />
                  )}
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{shortPick.teamName}</h3>
                    {shortPick.nextMatch && (
                      <div className={`text-xs mt-2 ${nextMatchTeam?.teamId === shortPick.teamId ? 'text-green-600 font-bold' : 'text-gray-600'}`}>
                        Next: {new Date(shortPick.nextMatch.matchDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}, {new Date(shortPick.nextMatch.matchDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'America/Chicago' })} vs {shortPick.nextMatch.opponent}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">{shortPick.pointsEarned || 0} {(shortPick.pointsEarned || 0) === 1 ? 'point' : 'points'}</div>
                  <div className="text-xs text-gray-500 mt-1">Recovery {shortPick.cost} pts</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Budget Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">Teams Selected</div>
            <div className="text-2xl font-bold text-gray-900">{teamSelections.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">Total Budget Used</div>
            <div className="text-2xl font-bold text-gray-900">{totalCost} / 100</div>
          </div>
        </div>

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
