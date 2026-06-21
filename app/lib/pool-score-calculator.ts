import { db } from '@/app/lib/db';
import { matches, teams, entryTeamSelections, poolEntries } from '@/app/lib/schema';
import { eq, sql } from 'drizzle-orm';

// Group Phase scoring only (app/rules/page.tsx). Knockout phase points are not
// computable yet since the `matches` table doesn't have bracket fixtures.
const POINTS_PER_WIN = 2;
const POINTS_PER_TIE = 1;
const GROUP_FIRST_PLACE_BONUS = 3;
const GROUP_SECOND_PLACE_BONUS = 1;

type GroupStanding = {
  teamId: number;
  teamName: string;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
};

function computeGroupStandings(
  teamsInGroup: { id: number; name: string }[],
  completedMatches: { homeTeamId: number; awayTeamId: number; homeScore: number; awayScore: number }[]
): GroupStanding[] {
  const standingByTeamId = new Map<number, GroupStanding>(
    teamsInGroup.map((t) => [t.id, { teamId: t.id, teamName: t.name, points: 0, goalsFor: 0, goalsAgainst: 0, goalDiff: 0 }])
  );

  for (const m of completedMatches) {
    const home = standingByTeamId.get(m.homeTeamId);
    const away = standingByTeamId.get(m.awayTeamId);
    if (!home || !away) continue;

    home.goalsFor += m.homeScore;
    home.goalsAgainst += m.awayScore;
    away.goalsFor += m.awayScore;
    away.goalsAgainst += m.homeScore;

    if (m.homeScore > m.awayScore) {
      home.points += POINTS_PER_WIN;
    } else if (m.homeScore < m.awayScore) {
      away.points += POINTS_PER_WIN;
    } else {
      home.points += POINTS_PER_TIE;
      away.points += POINTS_PER_TIE;
    }
  }

  for (const s of standingByTeamId.values()) {
    s.goalDiff = s.goalsFor - s.goalsAgainst;
  }

  return [...standingByTeamId.values()].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return a.teamName.localeCompare(b.teamName); // final fallback (no head-to-head data)
  });
}

/**
 * Recomputes Group Phase points for every team from completed matches,
 * writes them to entryTeamSelections.pointsEarned, and recomputes each
 * entry's entryScores total + rank. Safe to re-run at any time.
 */
export async function recalculatePoolScores() {
  const allTeams = await db.select().from(teams);
  const allGroupStageMatches = await db.select().from(matches);

  const teamsByGroup = new Map<string, { id: number; name: string }[]>();
  for (const t of allTeams) {
    const group = t.group || 'UNGROUPED';
    if (!teamsByGroup.has(group)) teamsByGroup.set(group, []);
    teamsByGroup.get(group)!.push({ id: t.id, name: t.name });
  }

  const pointsByTeamId = new Map<number, number>();

  for (const [, teamsInGroup] of teamsByGroup) {
    const teamIdsInGroup = new Set(teamsInGroup.map((t) => t.id));
    const matchesInGroup = allGroupStageMatches.filter(
      (m) => teamIdsInGroup.has(m.homeTeamId) && teamIdsInGroup.has(m.awayTeamId)
    );
    const completedMatchesInGroup = matchesInGroup.filter(
      (m) => m.status === 'completed' && m.homeScore !== null && m.awayScore !== null
    ) as { homeTeamId: number; awayTeamId: number; homeScore: number; awayScore: number }[];

    // Only award the placement bonus once every match in the group has been played —
    // standings are provisional (and the "leader" can still change) until then.
    const groupIsComplete = matchesInGroup.length > 0 && completedMatchesInGroup.length === matchesInGroup.length;

    const standings = computeGroupStandings(teamsInGroup, completedMatchesInGroup);

    standings.forEach((s, index) => {
      let points = s.points;
      if (groupIsComplete) {
        if (index === 0) points += GROUP_FIRST_PLACE_BONUS;
        else if (index === 1) points += GROUP_SECOND_PLACE_BONUS;
      }
      pointsByTeamId.set(s.teamId, points);
    });
  }

  // Update pointsEarned for every entry's team selections in a single bulk statement.
  const allSelections = await db.select().from(entryTeamSelections);
  const selectionUpdates = allSelections
    .map((sel) => ({ id: sel.id, points: pointsByTeamId.get(sel.teamId) ?? 0 }))
    .filter((u, i) => u.points !== (allSelections[i].pointsEarned ?? 0));

  if (selectionUpdates.length > 0) {
    await db.execute(sql`
      UPDATE entry_team_selections AS ets
      SET points_earned = v.points
      FROM (VALUES ${sql.join(
        selectionUpdates.map((u) => sql`(${u.id}::integer, ${u.points}::integer)`),
        sql`, `
      )}) AS v(id, points)
      WHERE ets.id = v.id
    `);
  }
  const selectionsUpdated = selectionUpdates.length;

  // Recompute each entry's total (long picks add, short picks subtract) and rank within its pool,
  // using the freshly computed points in memory rather than re-querying the DB.
  const pointsBySelectionId = new Map(selectionUpdates.map((u) => [u.id, u.points]));
  const allEntries = await db.select().from(poolEntries);
  const selectionsByEntryId = new Map<number, typeof allSelections>();
  for (const sel of allSelections) {
    if (!selectionsByEntryId.has(sel.entryId)) selectionsByEntryId.set(sel.entryId, []);
    selectionsByEntryId.get(sel.entryId)!.push(sel);
  }

  const entryTotals = allEntries.map((entry) => {
    const sels = selectionsByEntryId.get(entry.id) || [];
    const totalPoints = sels.reduce((sum, sel) => {
      const points = pointsBySelectionId.get(sel.id) ?? sel.pointsEarned ?? 0;
      return sel.isShort ? sum - points : sum + points;
    }, 0);
    return { entry, totalPoints };
  });

  const entriesByPoolId = new Map<number, typeof entryTotals>();
  for (const et of entryTotals) {
    if (!entriesByPoolId.has(et.entry.poolId)) entriesByPoolId.set(et.entry.poolId, []);
    entriesByPoolId.get(et.entry.poolId)!.push(et);
  }

  const entryScoreRows: { entryId: number; poolId: number; totalPoints: number; rank: number }[] = [];
  for (const [poolId, entries] of entriesByPoolId) {
    const sorted = [...entries].sort((a, b) => b.totalPoints - a.totalPoints);

    let rank = 0;
    let lastPoints: number | null = null;
    for (let i = 0; i < sorted.length; i++) {
      if (sorted[i].totalPoints !== lastPoints) {
        rank = i + 1;
        lastPoints = sorted[i].totalPoints;
      }
      entryScoreRows.push({ entryId: sorted[i].entry.id, poolId, totalPoints: sorted[i].totalPoints, rank });
    }
  }

  if (entryScoreRows.length > 0) {
    await db.execute(sql`
      INSERT INTO entry_scores (entry_id, pool_id, total_points, rank)
      VALUES ${sql.join(
        entryScoreRows.map((r) => sql`(${r.entryId}, ${r.poolId}, ${r.totalPoints}, ${r.rank})`),
        sql`, `
      )}
      ON CONFLICT (entry_id, pool_id) DO UPDATE SET
        total_points = excluded.total_points,
        rank = excluded.rank,
        updated_at = now()
    `);
  }

  return { success: true, teamsScored: pointsByTeamId.size, selectionsUpdated, entriesUpdated: entryScoreRows.length };
}
