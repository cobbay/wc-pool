'use client';

import { useRef, useEffect } from 'react';
import { getFlagImageUrl } from '@/app/lib/flag-utils';

type TeamStats = {
  id: number;
  name: string;
  code: string;
  group: string | null;
  cost: number;
  timesChosen: number;
  timesShorted: number;
  totalPointsEarned: number;
};

type EntryData = {
  id: number;
  name: string;
  totalPoints: number;
  pointsByTeam: { [teamId: number]: number };
  shortTeamIds: Set<number>;
};

type DetailedStandingsTableProps = {
  teamsByGroup: TeamStats[];
  entriesData: EntryData[];
};

export function DetailedStandingsTable({
  teamsByGroup,
  entriesData,
}: DetailedStandingsTableProps) {
  const tableScrollerRef = useRef<HTMLDivElement>(null);
  const topScrollRef = useRef<HTMLDivElement>(null);
  const scrollSyncRef = useRef(false);

  // Build group information
  const groupInfo = teamsByGroup.reduce(
    (acc, team, index) => {
      if (!acc.current || acc.current.group !== team.group) {
        acc.groups.push({
          name: team.group || 'Unknown',
          startIndex: index,
          colSpan: 1,
        });
        acc.current = { group: team.group, startIndex: index };
      } else {
        acc.groups[acc.groups.length - 1].colSpan += 1;
      }
      return acc;
    },
    { groups: [] as Array<{ name: string; startIndex: number; colSpan: number }>, current: null as { group: string | null; startIndex: number } | null }
  ).groups;

  useEffect(() => {
    const tableScroller = tableScrollerRef.current;
    const topScroll = topScrollRef.current;

    if (!tableScroller || !topScroll) return;

    // Set the top scroll area width to match the table's actual scroll width
    const scrollableWidth = tableScroller.scrollWidth;
    const placeholderDiv = topScroll.querySelector('div');
    if (placeholderDiv) {
      placeholderDiv.style.width = scrollableWidth + 'px';
    }

    // Sync table scroll to top scroll
    const handleTableScroll = () => {
      if (scrollSyncRef.current) return;
      scrollSyncRef.current = true;
      topScroll.scrollLeft = tableScroller.scrollLeft;
      scrollSyncRef.current = false;
    };

    // Sync top scroll to table scroll
    const handleTopScroll = () => {
      if (scrollSyncRef.current) return;
      scrollSyncRef.current = true;
      tableScroller.scrollLeft = topScroll.scrollLeft;
      scrollSyncRef.current = false;
    };

    tableScroller.addEventListener('scroll', handleTableScroll);
    topScroll.addEventListener('scroll', handleTopScroll);

    return () => {
      tableScroller.removeEventListener('scroll', handleTableScroll);
      topScroll.removeEventListener('scroll', handleTopScroll);
    };
  }, []);

  return (
    <>
      {/* Top scroll indicator */}
      <div
        ref={topScrollRef}
        className="bg-white rounded-t-lg mb-0 overflow-x-auto"
      >
        <div className="h-2" style={{ width: 'calc(200px + 80px + 48 * 80px)' }}></div>
      </div>

      {/* Main table wrapper */}
      <div
        ref={tableScrollerRef}
        className="bg-white rounded-b-lg shadow overflow-x-auto"
      >
        <table className="min-w-full border-collapse">
          <thead>
            {/* Group Header Row */}
            <tr className="bg-indigo-100 border-b border-gray-300">
              {/* Empty cells for Entry and Total columns */}
              <th className="sticky left-0 z-20 bg-indigo-100 border-r border-gray-300 min-w-[140px]"></th>
              <th className="sticky left-[140px] z-20 bg-indigo-100 border-r border-gray-300 min-w-[60px]"></th>

              {/* Group header cells */}
              {groupInfo.map((group) => (
                <th
                  key={group.name}
                  colSpan={group.colSpan}
                  className="px-2 py-2 text-center text-sm font-bold text-gray-900 border-r border-gray-300"
                >
                  {group.name}
                </th>
              ))}
            </tr>

            <tr className="bg-gray-50 border-b border-gray-200">
              {/* Entry name column */}
              <th className="sticky left-0 z-20 bg-gray-50 px-4 py-3 text-left text-sm font-semibold text-gray-900 border-r border-gray-200 min-w-[140px]">
                Entry
              </th>

              {/* Total points column - now second */}
              <th className="sticky left-[140px] z-20 bg-gray-50 px-4 py-3 text-center text-sm font-semibold text-gray-900 border-r border-gray-200 min-w-[60px]">
                Total
              </th>

              {/* Team columns */}
              {teamsByGroup.map((team) => (
                <th
                  key={team.id}
                  className="px-2 py-3 text-center text-xs font-semibold text-gray-900 border-r border-gray-200 min-w-[70px]"
                >
                  <div className="flex flex-col items-center space-y-1">
                    <img
                      src={getFlagImageUrl(team.code)}
                      alt={team.name}
                      className="w-6 h-4 object-cover rounded"
                    />
                    <div className="text-xs truncate w-full" title={team.name}>
                      {team.code}
                    </div>
                  </div>
                </th>
              ))}
            </tr>

            {/* Stats rows */}
            <tr className="bg-blue-50 border-b border-gray-200 font-semibold text-xs">
              <td className="sticky left-0 z-20 bg-blue-50 px-4 py-2 text-left text-gray-900 border-r border-gray-200">
                Times Chosen
              </td>
              <td className="sticky left-[200px] z-20 bg-blue-50 px-4 py-2 text-center text-gray-900 border-r border-gray-200"></td>
              {teamsByGroup.map((team) => (
                <td
                  key={`chosen-${team.id}`}
                  className="px-2 py-2 text-center text-gray-900 border-r border-gray-200"
                >
                  {team.timesChosen}
                </td>
              ))}
            </tr>

            <tr className="bg-amber-50 border-b border-gray-200 font-semibold text-xs">
              <td className="sticky left-0 z-20 bg-amber-50 px-4 py-2 text-left text-gray-900 border-r border-gray-200">
                Times Shorted
              </td>
              <td className="sticky left-[200px] z-20 bg-amber-50 px-4 py-2 text-center text-gray-900 border-r border-gray-200"></td>
              {teamsByGroup.map((team) => (
                <td
                  key={`shorted-${team.id}`}
                  className="px-2 py-2 text-center text-gray-900 border-r border-gray-200"
                >
                  {team.timesShorted}
                </td>
              ))}
            </tr>

            <tr className="bg-green-50 border-b border-gray-200 font-semibold text-xs">
              <td className="sticky left-0 z-20 bg-green-50 px-4 py-2 text-left text-gray-900 border-r border-gray-200">
                Pts Earned / Price
              </td>
              <td className="sticky left-[200px] z-20 bg-green-50 px-4 py-2 text-center text-gray-900 border-r border-gray-200"></td>
              {teamsByGroup.map((team) => (
                <td
                  key={`ratio-${team.id}`}
                  className="px-2 py-2 text-center text-gray-900 border-r border-gray-200"
                >
                  <div className="font-bold text-green-700">
                    {team.cost > 0 && team.timesChosen > 0
                      ? ((team.totalPointsEarned / team.timesChosen) / team.cost).toFixed(1)
                      : '0.0'}
                  </div>
                </td>
              ))}
            </tr>
          </thead>

          <tbody>
            {entriesData.map((entry, index) => (
              <tr
                key={entry.id}
                className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
              >
                {/* Entry name */}
                <td className="sticky left-0 z-10 px-4 py-3 text-left font-semibold text-gray-900 border-r border-gray-200 min-w-[140px] bg-inherit">
                  <div className="truncate">
                    #{index + 1}. {entry.name}
                  </div>
                </td>

                {/* Total column */}
                <td className="sticky left-[140px] z-10 px-4 py-3 text-center text-lg font-bold text-blue-600 border-r border-gray-200 min-w-[60px] bg-inherit">
                  {entry.totalPoints}
                </td>

                {/* Points for each team */}
                {teamsByGroup.map((team) => (
                  <td
                    key={`entry-${entry.id}-team-${team.id}`}
                    className={`px-2 py-3 text-center text-sm font-semibold border-r border-gray-200 ${
                      entry.shortTeamIds.has(team.id)
                        ? 'text-red-600'
                        : 'text-blue-600'
                    }`}
                  >
                    {entry.pointsByTeam[team.id] === undefined
                      ? '-'
                      : entry.shortTeamIds.has(team.id)
                      ? `(${entry.pointsByTeam[team.id]})`
                      : entry.pointsByTeam[team.id]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
