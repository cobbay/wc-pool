'use client';

import Link from 'next/link';
import { useUser } from '@auth0/nextjs-auth0/client';

export default function Home() {
  const { user, isLoading } = useUser();

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
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to WC Pool
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Join the world class gaming experience. Sign in to get started!
          </p>
          <a
            href="/auth/login"
            className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In with Auth0
          </a>
        </div>
      </div>
    );
  }

  // User is logged in - show dashboard
  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-8 text-white">
        <h1 className="text-4xl font-bold mb-2">
          Welcome back, {user.name || user.email}!
        </h1>
        <p className="text-blue-100">
          You're all set to start your WC Pool journey
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/claim-entry" className="group">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow hover:shadow-lg transition-shadow h-full border-2 border-green-300">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-green-600 transition-colors">
              Claim Your Entry
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Select an entry to highlight on standings
            </p>
          </div>
        </Link>

        <Link href="/entries" className="group">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow hover:shadow-lg transition-shadow h-full">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 transition-colors">
              Entries
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Browse all entries and team selections
            </p>
          </div>
        </Link>

        <Link href="/standings/quick" className="group">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow hover:shadow-lg transition-shadow h-full">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 transition-colors">
              Quick Standings
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Entries and total points only
            </p>
          </div>
        </Link>

        <Link href="/standings/detailed" className="group">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow hover:shadow-lg transition-shadow h-full">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 transition-colors">
              Detailed Standings
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Full team grid with points
            </p>
          </div>
        </Link>

        <Link href="/rules" className="group">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow hover:shadow-lg transition-shadow h-full">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 transition-colors">
              Rules & Scoring
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Learn the rules and point system
            </p>
          </div>
        </Link>

        <Link href="/match-results" className="group">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow hover:shadow-lg transition-shadow h-full">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 transition-colors">
              Match Results
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              World Cup matches in chronological order
            </p>
          </div>
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Quick Stats
          </h2>
          <div className="space-y-2 text-gray-600 dark:text-gray-300">
            <p>Status: Active</p>
            <p>Member since: {user.updated_at ? new Date(user.updated_at).toLocaleDateString() : 'Today'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

