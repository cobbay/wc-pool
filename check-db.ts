import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('.env.local') });
dotenv.config({ path: path.resolve('.env') });

import { db } from './app/lib/db';
import { matches, teams } from './app/lib/schema';
import { eq } from 'drizzle-orm';

async function check() {
  try {
    const germanyMatches = await db
      .select({
        homeTeamId: matches.homeTeamId,
        awayTeamId: matches.awayTeamId,
        matchDate: matches.matchDate,
      })
      .from(matches)
      .where(eq(matches.homeTeamId, 13));

    console.log(`Found ${germanyMatches.length} Germany home matches:`);
    germanyMatches.forEach(match => {
      const date = new Date(match.matchDate);
      const formatted = date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'America/Chicago',
      });
      console.log(`  - ${formatted} (UTC: ${date.toISOString()})`);
    });
  } catch (e) {
    console.error('Error:', e);
  }
  process.exit(0);
}

check();
