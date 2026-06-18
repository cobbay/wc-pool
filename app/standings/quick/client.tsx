'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useEffect, useState } from 'react';

type EntryWithRanking = {
  name: string;
  totalPoints: number;
  rank: string;
};

type QuickStandingsClientProps = {
  entries: EntryWithRanking[];
};

export function QuickStandingsClient({ entries }: QuickStandingsClientProps) {
  const { user } = useUser();
  const [claimedEntryId, setClaimedEntryId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchClaimedEntry = async () => {
      try {
        const res = await fetch(`/api/entries/claimed?userId=${user.sub}`);
        const data = await res.json();
        if (data.id) {
          setClaimedEntryId(data.name);
        }
      } catch (err) {
        console.error('Failed to fetch claimed entry:', err);
      }
    };

    fetchClaimedEntry();
  }, [user]);

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Rank</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Entry</th>
            <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Total Points</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr
              key={entry.name}
              className={`border-b border-gray-200 hover:bg-gray-50 ${
                claimedEntryId === entry.name ? 'bg-green-50 font-semibold' : ''
              }`}
            >
              <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                {entry.rank} {claimedEntryId === entry.name && '⭐'}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">{entry.name}</td>
              <td className="px-6 py-4 text-sm font-semibold text-blue-600 text-right">
                {entry.totalPoints}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
