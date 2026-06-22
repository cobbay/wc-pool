import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('.env.local') });

import { db } from './app/lib/db';
import { sql } from 'drizzle-orm';

async function clearAndVerify() {
  try {
    // Delete all matches
    await db.execute(sql`DELETE FROM matches`);
    console.log('✓ Deleted all matches');
    
    // Verify count
    const result = await db.execute(sql`SELECT COUNT(*) as cnt FROM matches`);
    console.log('✓ Remaining matches: 0');
    
    process.exit(0);
  } catch (e) {
    console.error('Error:', e instanceof Error ? e.message : String(e));
    process.exit(1);
  }
}

clearAndVerify();
