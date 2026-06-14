# World Cup Score Auto-Update Setup Guide

This document explains how to set up automatic score updates using football-data.org's API and Vercel cron jobs.

## Files Created

1. **`app/lib/score-updater.ts`** - Fetches scores from football-data.org API and updates database
2. **`app/api/cron/update-scores/route.ts`** - API endpoint that Vercel cron job calls
3. **`vercel.json`** - Cron job configuration (updates hourly at top of each hour)

## Setup Steps

### Step 1: Get Football-Data.org API Key

1. Go to [https://www.football-data.org](https://www.football-data.org)
2. Sign up for a free account
3. Go to your dashboard and copy your API key
4. Add it to your `.env.local` file:

```
FOOTBALL_DATA_API_KEY=your_api_key_here
```

### Step 2: Set Cron Secret

Generate a secure random string for the cron secret (prevents unauthorized calls):

```
CRON_SECRET=your_random_secret_here
```

Add to `.env.local`:

```
NEXT_PUBLIC_CRON_SECRET=your_random_secret_here
```

### Step 3: Deploy to Vercel

1. Push your changes to GitHub:
```bash
git add .
git commit -m "Add automated score updates"
git push
```

2. Set environment variables in Vercel:
   - Go to your project settings in Vercel dashboard
   - Add `FOOTBALL_DATA_API_KEY` (your football-data.org key)
   - Add `CRON_SECRET` (your random secret)

3. Deploy the updated code to Vercel

### Step 4: Verify Cron Job is Working

Check Vercel dashboard:
1. Go to your project → Functions → Cron
2. You should see `/api/cron/update-scores` listed
3. Check the recent invocations to verify it's running hourly

## How It Works

- **Frequency**: Runs at the top of every hour (0 * * * * in cron format)
- **Process**: 
  1. Vercel calls `/api/cron/update-scores` with Bearer token
  2. Endpoint verifies the CRON_SECRET matches
  3. `score-updater.ts` fetches finished matches from football-data.org
  4. Scores are updated in the database matches table
  5. Response includes count of updated matches

## API Response Example

```json
{
  "success": true,
  "updated": 5,
  "total": 72,
  "errors": [],
  "timestamp": "2026-06-13T18:00:00.000Z"
}
```

## Testing Locally

To test the cron job locally without Vercel:

```bash
curl -X GET http://localhost:3000/api/cron/update-scores \
  -H "Authorization: Bearer your_random_secret_here"
```

## Troubleshooting

### "FOOTBALL_DATA_API_KEY not configured"
- Check that you've added the API key to Vercel environment variables
- Redeploy after adding the variable

### "Unauthorized" error
- Verify the CRON_SECRET is set correctly in Vercel
- Ensure it matches in the API route and Vercel dashboard

### No matches updating
- Check if football-data.org has the 2026 World Cup data available
- Verify team names in score-updater.ts match the API response exactly
- Check API rate limits (free tier: 10 calls/min)

## Future Enhancements

- Add live score updates during matches (not just final scores)
- Calculate points automatically based on match results
- Add knockout stage and playoff matches
- Send notifications when matches are completed
- Display recent scores on entry pages
