'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useUser } from '@auth0/nextjs-auth0/client';

export default function UserDisplay() {
  const { user, isLoading } = useUser();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  if (isLoading) {
    return null;
  }

  if (user) {
    const userName = user.name || user.email || user.nickname || user.sub;
    
    return (
      <>
        {/* Desktop User Display */}
        <div className="hidden md:flex items-center gap-2">
          <span className="text-sm text-white">
            {userName}
          </span>
          <a
            href="/auth/logout"
            className="flex h-10 items-center rounded-lg bg-gray-600 px-4 text-sm font-medium text-white transition-colors hover:bg-gray-700"
          >
            Logout
          </a>
        </div>

        {/* Mobile User Icon Dropdown */}
        <div className="md:hidden relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors"
            aria-label="User Menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
              <div className="py-1" role="menu">
                <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
                  <div className="font-medium">{userName}</div>
                </div>
                
                <a
                  href="/auth/logout"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Logout
                </a>
              </div>
            </div>
          )}
        </div>
      </>
    );
  }

  // Not logged in - show login button
  return (
    <a
      href="/auth/login"
      className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-700"
    >
      Login
    </a>
  );
}
