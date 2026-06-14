import { db } from '@/app/lib/db';
import { poolEntries, pools, entryTeamSelections, teams } from '@/app/lib/schema';
import { eq } from 'drizzle-orm';
import Link from 'next/link';
import { DetailedStandingsTable } from './client';

export const dynamic = 'force-dynamic';

type TeamStats = {
  id: number;
  name: string;
  code: string;
  group: string | null;
  cost: number;
  timesChosen: number;
  timesShorted: number;
  totalPointsEarned: number;
};

type EntryPointsByTeam = {
  [teamId: number]: number;
};

export default async function DetailedStandingsPage() {
  // Get the main pool
  const poolData = await db
    .select()
    .from(pools)
    .where(eq(pools.id, 1));

  if (poolData.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
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

  // Fetch all teams with their stats
  const allTeams = await db.select().from(teams);
  
  // Fetch all entries for this pool
  const entries = await db
    .select()
    .from(poolEntries)
    .where(eq(poolEntries.poolId, pool.id));

  // Get all team selections for calculations
  const allSelections = await db
    .select({
      entryId: entryTeamSelections.entryId,
      teamId: entryTeamSelections.teamId,
      isShort: entryTeamSelections.isShort,
      pointsEarned: entryTeamSelections.pointsEarned,
    })
    .from(entryTeamSelections);

  // Build team stats
  const teamStats: Map<number, TeamStats> = new Map();
  
  for (const team of allTeams) {
    const selectionsForTeam = allSelections.filter(s => s.teamId === team.id);
    const timesChosen = selectionsForTeam.length;
    const timesShorted = selectionsForTeam.filter(s => s.isShort).length;
    const totalPointsEarned = selectionsForTeam.reduce((sum, s) => sum + (s.pointsEarned || 0), 0);
    
    teamStats.set(team.id, {
      id: team.id,
      name: team.name,
      code: team.code,
      group: team.group,
      cost: team.cost,
      timesChosen,
      timesShorted,
      totalPointsEarned,
    });
  }

  // Build entry data with points for each team
  const entriesData = await Promise.all(
    entries.map(async entry => {
      const pointsByTeam: EntryPointsByTeam = {};
      const shortTeamIds: Set<number> = new Set();
      let totalPoints = 0;

      for (const selection of allSelections.filter(s => s.entryId === entry.id)) {
        pointsByTeam[selection.teamId] = selection.pointsEarned || 0;
        if (selection.isShort) {
          // Short picks subtract from total
          totalPoints -= selection.pointsEarned || 0;
          shortTeamIds.add(selection.teamId);
        } else {
          // Regular picks add to total
          totalPoints += selection.pointsEarned || 0;
        }
      }

      return {
        id: entry.id,
        name: entry.name,
        totalPoints,
        pointsByTeam,
        shortTeamIds,
      };
    })
  );

  // Sort entries by points descending
  entriesData.sort((a, b) => b.totalPoints - a.totalPoints);

  // Sort teams by group
  const teamsByGroup = Array.from(teamStats.values()).sort((a, b) => {
    if (!a.group || !b.group) return 0;
    return a.group.localeCompare(b.group);
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Detailed Standings</h1>
          <p className="text-gray-600 mt-1">Full team grid with points</p>
        </div>
      </div>

      {/* Standings Table */}
      <div className="px-8 py-8">
        {entriesData.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">No entries yet.</p>
          </div>
        ) : (
          <DetailedStandingsTable teamsByGroup={teamsByGroup} entriesData={entriesData} />
        )}
      </div>
    </div>
  );
}
