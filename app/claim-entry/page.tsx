'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type Entry = {
  id: number;
  poolId: number;
  name: string;
  userId: string | null;
  totalPoints: number;
};

export default function ClaimEntryPage() {
  const { user, isLoading } = useUser();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimedEntryId, setClaimedEntryId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchEntries = async () => {
      try {
        const res = await fetch('/api/entries/available');
        const data = await res.json();
        setEntries(data);
      } catch (err) {
        setError('Failed to load entries');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, [user]);

  const handleClaim = async (entryId: number) => {
    try {
      const res = await fetch(`/api/entries/${entryId}/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.sub }),
      });

      if (!res.ok) throw new Error('Failed to claim entry');

      setClaimedEntryId(entryId);
      // Remove claimed entry from list
      setEntries((prev) => prev.filter((e) => e.id !== entryId));
      setError(null);
    } catch (err) {
      setError('Failed to claim entry');
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Home
          </Link>
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign In Required</h1>
            <p className="text-gray-600 mb-4">You need to be signed in to claim an entry.</p>
            <a
              href="/auth/login"
              className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sign In with Auth0
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-8 py-6">
          <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Claim Your Entry</h1>
          <p className="text-gray-600 mt-1">Select an entry to highlight it on the standings</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-8 py-8">
        {claimedEntryId && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-medium">✓ Entry claimed successfully!</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">✗ {error}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading entries...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 mb-4">No unclaimed entries available.</p>
            <Link
              href="/standings/quick"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              View Standings
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{entry.name}</h3>
                    <p className="text-gray-600 mt-1">Total Points: {entry.totalPoints}</p>
                  </div>
                  <button
                    onClick={() => handleClaim(entry.id)}
                    className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Claim Entry
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
