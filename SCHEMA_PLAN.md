# World Cup Fantasy Pool - Schema Update Plan

## Overview
Update database schema to support:
- Multiple entries per user per pool
- Team budget system (100 points per entry)
- Short option (negative points)
- Scoring and ranking system

## Schema Changes

### 1. MODIFY: `teams` table
**Add cost field**
```
cost: integer - The budget cost to pick this team (e.g., 27 for Mexico)
```

### 2. NEW: `poolEntries` table
Represents each user's unique entry in a pool
```
- id: serial (PK)
- pool_id: integer (FK -> pools.id)
- user_id: text (FK -> users.id)
- name: text - Entry name (e.g., "Corey Strand", "Corey Strand V2")
- budget_spent: integer (default 0) - Total cost of selected teams
- created_at: timestamp (default now)
- updated_at: timestamp (default now)
- Constraints:
  - Unique: (pool_id, user_id, name)
  - Foreign Keys: pool_id, user_id
```

**Relationships:**
- One user can have multiple entries in same pool
- Pool has many entries
- Each entry tracks its own budget

### 3. NEW: `entryTeamSelections` table
Teams selected for each entry (max 10: 9 long + 1 short)
```
- id: serial (PK)
- entry_id: integer (FK -> poolEntries.id)
- team_id: integer (FK -> teams.id)
- is_short: boolean (default false) - Whether this is the short pick
- points_earned: integer (default 0) - Points this team earned (calculated by system)
- created_at: timestamp (default now)
- Constraints:
  - Unique: (entry_id, team_id)
  - Foreign Keys: entry_id, team_id
  - Max 10 teams per entry (enforced via application logic)
  - Max 1 short pick per entry (enforced via application logic)
```

**Relationships:**
- Entry has many team selections
- Team has many entry selections
- Tracks whether team is "shorted"

### 4. NEW: `entryScores` table
Scoring for each entry in each pool
```
- id: serial (PK)
- entry_id: integer (FK -> poolEntries.id)
- pool_id: integer (FK -> pools.id)
- total_points: integer (default 0) - Sum of team points (short teams reduce this)
- rank: integer (nullable) - Rank within pool
- created_at: timestamp (default now)
- updated_at: timestamp (default now)
- Constraints:
  - Unique: (entry_id, pool_id)
  - Foreign Keys: entry_id, pool_id
```

**Relationships:**
- One score record per entry per pool

### 5. REMOVAL/CONSOLIDATION
- Remove `poolMembers` (entries now define membership)
- Keep `userTeamSelections` for player-level picks (if implementing fantasy player selection later)
- Update `userPoolScores` → consider removing or hibernating

## Migration Steps

1. Add `cost` to existing `teams` table
2. Create `poolEntries` table
3. Create `entryTeamSelections` table
4. Create `entryScores` table
5. Migrate data from old structure (if any)
6. Update relations

## Budget Calculation Examples

**Example Entry 1: Standard Picks**
- Germany: -45
- Spain: -70
- Belgium: -38
- Japan: -20
- Mexico: -27
- Total: -200 (exceeds 100 budget - ERROR)

**Example Entry 2: Mixed**
- England: -60 (long)
- Spain: -70 (short - adds back as +70)
- Germany: -45
- Total budget used: 35 points
- Remaining: 65 points
- Budget check: 60 + 45 = 105 - 70 (short) = 35 ✓

**Scoring Example:**
- Long picks: +points earned
- Short picks: -points earned
- Entry score = sum of long points - short team points

## Validation Rules

**Application-level validations:**
1. Budget check: sum of costs ≤ 100 (short picks add back to budget)
2. Team limit: 1-10 teams per entry
3. Short limit: 0-1 short picks per entry
4. No duplicates: each team max 1 time per entry
5. Cost validation: ensure picked teams have valid costs

## Next Steps
1. Update schema.ts with new tables
2. Generate migration
3. Create seed script to migrate existing data
4. Update Drizzle relations
5. Create API endpoints for entry management
