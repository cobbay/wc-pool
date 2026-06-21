'use client';

import Link from 'next/link';
import { useUser } from '@auth0/nextjs-auth0/client';
import { isAdmin } from '@/app/lib/auth-utils';
import RefreshScoresButton from '@/app/ui/refresh-scores-button';
import RefreshPoolScoresButton from '@/app/ui/refresh-pool-scores-button';

export default function AdminPage() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return null;
  }

  if (!isAdmin(user ?? undefined)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Not authorized</h1>
        <p className="text-gray-600">You don&apos;t have admin access to this page.</p>
        <Link href="/" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
          ← Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-8 py-6">
          <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Admin</h1>
          <p className="text-gray-600 mt-1">Tools for managing live tournament data</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-8 space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Match Scores</h2>
          <p className="text-gray-600 text-sm mb-4">
            Pull the latest results from football-data.org and update the matches table. Runs
            automatically once a day via cron; use this to force an immediate refresh.
          </p>
          <RefreshScoresButton />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Pool Scores</h2>
          <p className="text-gray-600 text-sm mb-4">
            Recalculate Group Phase points (win/tie + group placement bonus) for every team from
            completed matches, then update each entry&apos;s total points and rank. Safe to re-run
            anytime &mdash; fully recomputes rather than accumulating. Run this after refreshing
            match scores. Knockout phase scoring isn&apos;t supported yet.
          </p>
          <RefreshPoolScoresButton />
        </div>
      </div>
    </div>
  );
}
