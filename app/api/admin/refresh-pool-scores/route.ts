import { NextResponse } from 'next/server';
import { auth0 } from '@/app/lib/auth0';
import { isAdmin } from '@/app/lib/auth-utils';
import { recalculatePoolScores } from '@/app/lib/pool-score-calculator';

export const dynamic = 'force-dynamic';

export async function POST() {
  const session = await auth0.getSession();

  if (!isAdmin(session?.user)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const result = await recalculatePoolScores();
    return NextResponse.json(
      { ...result, timestamp: new Date().toISOString() },
      { status: 200 }
    );
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
