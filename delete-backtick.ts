import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('.env.local') });

import { db } from './app/lib/db';
import { poolEntries, entryTeamSelections } from './app/lib/schema';
import { eq, sql } from 'drizzle-orm';

async function deleteBacktickEntry() {
  try {
    // First delete all entry_team_selections for this entry
    const toDelete = await db
      .select({ id: poolEntries.id })
      .from(poolEntries)
      .where(eq(poolEntries.name, '`'));

    if (toDelete.length === 0) {
      console.log('No entry with backtick name found');
      process.exit(0);
    }

    const entryId = toDelete[0].id;
    console.log('Found entry ID:', entryId);

    // Delete team selections first
    await db.delete(entryTeamSelections).where(eq(entryTeamSelections.entryId, entryId));
    console.log('✓ Deleted team selections');

    // Delete entry
    const result = await db.delete(poolEntries).where(eq(poolEntries.id, entryId)).returning();
    console.log('✓ Deleted entry with backtick name (ID:', result[0].id, ')');

    process.exit(0);
  } catch (e) {
    console.error('Error:', e instanceof Error ? e.message : String(e));
    process.exit(1);
  }
}

deleteBacktickEntry();
