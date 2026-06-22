'use client';

import { useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { isAdmin } from '@/app/lib/auth-utils';

export default function RefreshScoresButton() {
  const { user } = useUser();
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  if (!isAdmin(user ?? undefined)) {
    return null;
  }

  const handleRefresh = async () => {
    setStatus('loading');
    setMessage('');
    setErrors([]);
    try {
      const res = await fetch('/api/admin/refresh-scores', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus('done');
        setMessage(`Updated ${data.updated}/${data.total} matches.`);
        setErrors(data.errors || []);
      } else {
        setStatus('error');
        setMessage(data.error || 'Refresh failed.');
      }
    } catch (e) {
      setStatus('error');
      setMessage(e instanceof Error ? e.message : 'Refresh failed.');
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleRefresh}
        disabled={status === 'loading'}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
      >
        {status === 'loading' ? 'Refreshing…' : 'Force Refresh Scores'}
      </button>
      {message && (
        <span className={`text-xs ${status === 'error' ? 'text-red-600' : 'text-gray-600'}`}>
          {message}
        </span>
      )}
      {errors.length > 0 && (
        <ul className="max-w-xs text-right text-xs text-amber-600">
          {errors.map((err, i) => (
            <li key={i}>{err}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
