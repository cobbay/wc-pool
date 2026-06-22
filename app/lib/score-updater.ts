import { db } from '@/app/lib/db';
import { matches, teams } from '@/app/lib/schema';
import { eq, and } from 'drizzle-orm';

const API_BASE = 'https://api.football-data.org/v4';

// football-data.org uses different team names than our seeded `teams` table for some countries.
const API_NAME_ALIASES: Record<string, string> = {
  'Czech Republic': 'Czechia',
  'Bosnia and Herzegovina': 'Bosnia & Herzegovina',
  'Bosnia-Herzegovina': 'Bosnia & Herzegovina',
  'IR Iran': 'Iran',
  'Korea Republic': 'South Korea',
  'Turkey': 'Türkiye',
  'United States of America': 'United States',
  "Côte d'Ivoire": 'Ivory Coast',
  'Cape Verde Islands': 'Cape Verde',
  'Congo DR': 'DR Congo',
};

function resolveTeamName(apiName: string): string {
  return API_NAME_ALIASES[apiName] || apiName;
}

// football-data.org statuses (FINISHED, IN_PLAY, PAUSED, TIMED, SCHEDULED, POSTPONED, ...)
// vs. our schema's lowercase convention ('pending' | 'live' | 'completed').
const API_STATUS_TO_DB_STATUS: Record<string, string> = {
  FINISHED: 'completed',
  IN_PLAY: 'live',
  PAUSED: 'live',
  TIMED: 'pending',
  SCHEDULED: 'pending',
};

function resolveStatus(apiStatus: string): string {
  return API_STATUS_TO_DB_STATUS[apiStatus] || apiStatus.toLowerCase();
}

export async function fetchAndUpdateScores() {
  try {
    const apiKey = process.env.FOOTBALL_DATA_API_KEY;

    if (!apiKey) {
      return { success: false, error: 'FOOTBALL_DATA_API_KEY not configured' };
    }

    // Fetch all matches from competition (2026 World Cup)
    const response = await fetch(`${API_BASE}/competitions/WC/matches?status=FINISHED`, {
      headers: { 'X-Auth-Token': apiKey },
    });

    if (!response.ok) {
      return { success: false, error: `API error: ${response.status}` };
    }

    const data = await response.json();
    const matches_data = data.matches || [];

    const teamRows = await db.select().from(teams);
    const teamIdByName = new Map(teamRows.map((t) => [t.name, t.id]));

    let updated = 0;
    const errors: string[] = [];

    for (const match of matches_data) {
      try {
        const homeName = resolveTeamName(match.homeTeam.name);
        const awayName = resolveTeamName(match.awayTeam.name);
        const homeTeamId = teamIdByName.get(homeName);
        const awayTeamId = teamIdByName.get(awayName);

        if (!homeTeamId || !awayTeamId) {
          errors.push(`Team mapping not found: ${match.homeTeam.name} vs ${match.awayTeam.name}`);
          continue;
        }

        // Update or find match by home and away team
        const existingMatch = await db
          .select()
          .from(matches)
          .where(and(eq(matches.homeTeamId, homeTeamId), eq(matches.awayTeamId, awayTeamId)))
          .limit(1);

        if (existingMatch.length > 0) {
          // Update existing match with score
          await db
            .update(matches)
            .set({
              homeScore: match.score.fullTime.home,
              awayScore: match.score.fullTime.away,
              status: resolveStatus(match.status),
            })
            .where(eq(matches.id, existingMatch[0].id));

          updated++;
        }
      } catch (e) {
        errors.push(`Error processing match: ${e instanceof Error ? e.message : String(e)}`);
      }
    }

    return { success: true, updated, total: matches_data.length, errors };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : String(e) };
  }
}
