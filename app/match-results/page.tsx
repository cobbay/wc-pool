import { db } from '@/app/lib/db';
import { matches, teams } from '@/app/lib/schema';
import Link from 'next/link';
import { getFlagImageUrl } from '@/app/lib/flag-utils';

export const dynamic = 'force-dynamic';

export default async function MatchResultsPage() {
  // Fetch all matches ordered chronologically
  const allMatches = await db
    .select({
      id: matches.id,
      matchDate: matches.matchDate,
      homeTeamId: matches.homeTeamId,
      homeScore: matches.homeScore,
      awayTeamId: matches.awayTeamId,
      awayScore: matches.awayScore,
      status: matches.status,
    })
    .from(matches)
    .orderBy(matches.matchDate);

  // Fetch all teams
  const allTeams = await db.select().from(teams);
  const teamMap = new Map(allTeams.map((t) => [t.id, t]));

  // Combine match and team data
  const matchesWithAwayTeams = allMatches.map((match) => {
    const homeTeam = teamMap.get(match.homeTeamId);
    const awayTeam = teamMap.get(match.awayTeamId);

    return {
      id: match.id,
      matchDate: match.matchDate,
      homeTeamName: homeTeam?.name || 'Unknown',
      homeTeamCode: homeTeam?.code || '',
      homeTeamId: match.homeTeamId,
      homeScore: match.homeScore,
      awayTeamId: match.awayTeamId,
      awayTeamName: awayTeam?.name || 'Unknown',
      awayTeamCode: awayTeam?.code || '',
      awayScore: match.awayScore,
      status: match.status,
    };
  });

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-8 py-6">
          <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Match Results</h1>
          <p className="text-gray-600 mt-1">World Cup 2026 matches in chronological order</p>
        </div>
      </div>

      {/* Matches */}
      <div className="max-w-4xl mx-auto px-8 py-8">
        {matchesWithAwayTeams.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">No matches scheduled yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {matchesWithAwayTeams.map((match) => (
              <div
                key={match.id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between">
                  {/* Date and Status */}
                  <div className="text-sm text-gray-500 min-w-[150px]">
                    {formatDate(match.matchDate)}
                    <span
                      className={`ml-2 inline-block px-2 py-1 rounded text-xs font-semibold ${
                        match.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : match.status === 'live'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
                    </span>
                  </div>

                  {/* Match Score */}
                  <div className="flex-1 flex items-center justify-center gap-6">
                    {/* Home Team */}
                    <div className="flex flex-col items-center">
                      <img
                        src={getFlagImageUrl(match.homeTeamCode)}
                        alt={match.homeTeamName}
                        className="w-12 h-8 object-cover rounded mb-2"
                      />
                      <div className="text-sm font-semibold text-center text-gray-900">
                        {match.homeTeamName}
                      </div>
                      <div className="text-xs text-gray-500">{match.homeTeamCode}</div>
                    </div>

                    {/* Score */}
                    <div className="flex flex-col items-center gap-2">
                      <div className="text-4xl font-bold text-gray-900">
                        {match.homeScore !== null && match.awayScore !== null ? (
                          <span>
                            {match.homeScore} - {match.awayScore}
                          </span>
                        ) : (
                          <span className="text-lg text-gray-400">vs</span>
                        )}
                      </div>
                    </div>

                    {/* Away Team */}
                    <div className="flex flex-col items-center">
                      <img
                        src={getFlagImageUrl(match.awayTeamCode)}
                        alt={match.awayTeamName}
                        className="w-12 h-8 object-cover rounded mb-2"
                      />
                      <div className="text-sm font-semibold text-center text-gray-900">
                        {match.awayTeamName}
                      </div>
                      <div className="text-xs text-gray-500">{match.awayTeamCode}</div>
                    </div>
                  </div>

                  {/* Padding for alignment */}
                  <div className="min-w-[150px]" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
