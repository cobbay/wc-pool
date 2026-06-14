import { db } from '@/app/lib/db';
import { matches } from '@/app/lib/schema';
import { eq, and } from 'drizzle-orm';

const API_BASE = 'https://api.football-data.org/v4';

// Team name to database ID mapping (from seed-matches.ts)
const teamNameToId: Record<string, number> = {
  'Mexico': 1,
  'South Africa': 2,
  'South Korea': 3,
  'Czech Republic': 4,
  'Canada': 5,
  'Bosnia and Herzegovina': 6,
  'Qatar': 7,
  'Switzerland': 8,
  'Brazil': 9,
  'Morocco': 10,
  'Haiti': 11,
  'Scotland': 12,
  'Germany': 13,
  'Curaçao': 14,
  'Ivory Coast': 15,
  'Ecuador': 16,
  'Netherlands': 17,
  'Japan': 18,
  'Sweden': 19,
  'Tunisia': 20,
  'Belgium': 21,
  'Egypt': 22,
  'Iran': 23,
  'New Zealand': 24,
  'Spain': 25,
  'Cape Verde': 26,
  'Saudi Arabia': 27,
  'Uruguay': 28,
  'France': 29,
  'Senegal': 30,
  'Iraq': 31,
  'Norway': 32,
  'Argentina': 33,
  'Algeria': 34,
  'Austria': 35,
  'Jordan': 36,
  'Portugal': 37,
  'DR Congo': 38,
  'Uzbekistan': 39,
  'Colombia': 40,
  'England': 41,
  'Croatia': 42,
  'Ghana': 43,
  'Panama': 44,
};

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

    let updated = 0;
    const errors: string[] = [];

    for (const match of matches_data) {
      try {
        const homeTeamId = teamNameToId[match.homeTeam.name];
        const awayTeamId = teamNameToId[match.awayTeam.name];

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
              status: match.status,
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
