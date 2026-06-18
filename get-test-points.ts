import * as dotenv from 'dotenv';
import * as path from 'path';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './app/lib/schema';
import { gt, sql, eq, desc, max } from 'drizzle-orm';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });
dotenv.config({ path: path.join(process.cwd(), '.env') });

async function getTeamPoints() {
  const queryClient = postgres(process.env.DATABASE_URL!);
  const db = drizzle(queryClient, { schema });
  
  const result = await db
    .select({ 
      code: schema.teams.code, 
      name: schema.teams.name, 
      pointsEarned: max(schema.entryTeamSelections.pointsEarned).mapWith((v) => Number(v))
    })
    .from(schema.entryTeamSelections)
    .rightJoin(schema.teams, eq(schema.teams.id, schema.entryTeamSelections.teamId))
    .where(gt(schema.entryTeamSelections.pointsEarned, 0))
    .groupBy(schema.teams.id, schema.teams.code, schema.teams.name)
    .orderBy((t) => desc(t.pointsEarned));
  
  console.log('\n📊 Team Test Points:');
  console.log('='.repeat(50));
  result.forEach((team) => {
    console.log(`${String(team.code).padEnd(5)} ${String(team.name).padEnd(30)} ${team.pointsEarned} pts`);
  });
  console.log('='.repeat(50));
  console.log(`Total: ${result.length} teams with test points\n`);
  
  await queryClient.end();
}

getTeamPoints().catch(console.error);
