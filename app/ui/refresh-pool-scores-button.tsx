'use client';

import { useState } from 'react';

export default function RefreshPoolScoresButton() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleRefresh = async () => {
    setStatus('loading');
    setMessage('');
    try {
      const res = await fetch('/api/admin/refresh-pool-scores', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus('done');
        setMessage(
          `Scored ${data.teamsScored} teams, updated ${data.selectionsUpdated} selections, ${data.entriesUpdated} entry rankings.`
        );
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
    <div className="flex flex-col items-start gap-1">
      <button
        onClick={handleRefresh}
        disabled={status === 'loading'}
        className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
      >
        {status === 'loading' ? 'Recalculating…' : 'Refresh Pool Scores'}
      </button>
      {message && (
        <span className={`text-xs ${status === 'error' ? 'text-red-600' : 'text-gray-600'}`}>
          {message}
        </span>
      )}
    </div>
  );
}
