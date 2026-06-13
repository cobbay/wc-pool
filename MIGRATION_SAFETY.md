# Database Migration Safety Guide

## The Problem
Node runs migrations using `DATABASE_URL` from the environment. Without care:
- **Local `.env`** will migrate PRODUCTION database
- **Vercel/CI `.env`** will accidentally migrate dev if not configured correctly

## Solution: Environment Detection

### Environment Priority (Node.js dotenv)
```
1. .env.local (highest priority - LOCAL DEV ONLY)
2. .env (fallback - PRODUCTION)
3. System environment variables
```

### Safe Migration Commands

#### For Local Development (DEV database)
```bash
npm run db:push:dev
# Uses .env.local automatically
```

#### For Production (PROD database)  
```bash
npm run db:push:prod
# Uses .env only (must ensure .env.local doesn't exist in production)
```

## Prevention Strategies

### ✅ DO THIS

1. **Keep `.env.local` in `.gitignore`** (it is)
   ```
   # .gitignore
   .env.local
   ```

2. **Use explicit db commands locally**
   ```bash
   npm run db:push:dev    # ← ALWAYS use this locally
   npm run db:generate    # ← Safe to use anytime
   ```

3. **On Vercel/Production**
   - Set `DATABASE_URL` in Vercel environment to PROD database
   - Do NOT upload `.env.local` to production
   - Run from main branch only for prod migrations

4. **Verify before migrating**
   - Check which database URL will be used:
   ```bash
   # On your local machine
   echo $DATABASE_URL
   # Should show: ep-royal-tree-...-pooler.c-3.us-east-1.aws.neon.tech
   
   # Before production deploy
   # DATABASE_URL should be: ep-spring-queen-...-pooler.c-3.us-east-1.aws.neon.tech
   ```

### ❌ DON'T DO THIS

- ❌ Run `npm run db:push:force` without checking which database
- ❌ Upload `.env.local` to version control
- ❌ Run migrations on production from local machine
- ❌ Use generic `db:push` without knowing which environment

## Environment Check

Before running ANY migration, verify the database:

```bash
# Check your current DATABASE_URL (dev)
grep DATABASE_URL .env.local
# Output: DATABASE_URL='postgresql://...ep-royal-tree...'

# NEVER show production secrets, but verify pattern
grep DATABASE_URL .env
# Should NOT be visible locally (prod only)
```

## Workflow

### Local Development
```bash
# Generate schema changes
npm run db:generate

# Apply to DEV database
npm run db:push:dev
```

### Production (Vercel)
1. Configure `DATABASE_URL` env var in Vercel to production database
2. On deploy, production build runs: `npm run build`
3. Build script includes: `npm run db:push:force`
4. Since Vercel only has `.env`, it migrates prod database

## What We Did Wrong

Last time we:
1. ✗ Didn't verify which DATABASE_URL was loaded
2. ✗ Ran migrations without checking environment
3. ✗ Accidentally used production database URL

## How We Fixed It

New approach:
1. ✓ Created explicit `db:push:dev` and `db:push:prod` commands
2. ✓ Document which command to use when
3. ✓ Use environment detection in npm scripts
4. ✓ Instructions in this guide

## Future Improvements

Consider adding:
- [ ] Pre-migration confirmation prompt asking to confirm database
- [ ] Check script that validates DATABASE_URL before running
- [ ] Separate drizzle config for dev vs prod
- [ ] GitHub Actions to prevent prod migrations from PR branches

