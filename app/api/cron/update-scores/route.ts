import { NextRequest, NextResponse } from 'next/server';
import { fetchAndUpdateScores } from '@/app/lib/score-updater';

// Verify cron secret
const CRON_SECRET = process.env.CRON_SECRET;

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Verify the cron secret
  const authHeader = request.headers.get('authorization');
  
  if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const result = await fetchAndUpdateScores();
    
    return NextResponse.json(
      {
        success: result.success,
        message: `Score update completed - Updated: ${result.updated}/${result.total} matches`,
        ...result,
        timestamp: new Date().toISOString(),
      },
      { status: result.success ? 200 : 500 }
    );
  } catch (e) {
    return NextResponse.json(
      {
        success: false,
        error: e instanceof Error ? e.message : String(e),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
