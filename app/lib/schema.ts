import { pgTable, text, serial, integer, boolean, timestamp, primaryKey, foreignKey, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').unique().notNull(),
  name: text('name'),
  picture: text('picture'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Pools/Leagues table
export const pools = pgTable('pools', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  createdBy: text('created_by').notNull().references(() => users.id),
  maxParticipants: integer('max_participants'),
  entryFee: integer('entry_fee'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// World Cup Teams
export const teams = pgTable('teams', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  code: text('code').notNull().unique(), // e.g., 'USA', 'BRA'
  flag: text('flag'),
  cost: integer('cost').notNull().default(0), // Budget cost to pick this team
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// World Cup Players
export const players = pgTable('players', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  teamId: integer('team_id').notNull().references(() => teams.id),
  position: text('position'), // e.g., 'GK', 'DEF', 'MID', 'FWD'
  number: integer('number'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Pool Entries - Each user can have multiple entries per pool
export const poolEntries = pgTable('pool_entries', {
  id: serial('id').primaryKey(),
  poolId: integer('pool_id').notNull().references(() => pools.id),
  userId: text('user_id').notNull().references(() => users.id),
  name: text('name').notNull(), // Entry name (e.g., "Corey Strand V2")
  budgetSpent: integer('budget_spent').notNull().default(0), // Total cost of selected teams
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  unique_entry: unique().on(table.poolId, table.userId, table.name),
}));

// Entry Team Selections - Teams picked for each entry
export const entryTeamSelections = pgTable('entry_team_selections', {
  id: serial('id').primaryKey(),
  entryId: integer('entry_id').notNull().references(() => poolEntries.id),
  teamId: integer('team_id').notNull().references(() => teams.id),
  isShort: boolean('is_short').default(false), // Whether this is the short pick
  pointsEarned: integer('points_earned').default(0), // Points this team earned
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  unique_selection: unique().on(table.entryId, table.teamId),
}));

// Entry Scores - Scoring for each entry in each pool
export const entryScores = pgTable('entry_scores', {
  id: serial('id').primaryKey(),
  entryId: integer('entry_id').notNull().references(() => poolEntries.id),
  poolId: integer('pool_id').notNull().references(() => pools.id),
  totalPoints: integer('total_points').notNull().default(0), // Sum of team points
  rank: integer('rank'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  unique_entry_pool: unique().on(table.entryId, table.poolId),
}));

// User Pool Membership (legacy)
export const poolMembers = pgTable('pool_members', {
  poolId: integer('pool_id').notNull().references(() => pools.id),
  userId: text('user_id').notNull().references(() => users.id),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
}, (table) => ({
  unique_pool_user: primaryKey({ columns: [table.poolId, table.userId] }),
}));

// User Team Selections (what players a user picked)
export const userTeamSelections = pgTable('user_team_selections', {
  userId: text('user_id').notNull().references(() => users.id),
  poolId: integer('pool_id').notNull().references(() => pools.id),
  playerId: integer('player_id').notNull().references(() => players.id),
  captain: boolean('captain').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  unique_selection: primaryKey({ columns: [table.userId, table.poolId, table.playerId] }),
}));

// World Cup Matches
export const matches = pgTable('matches', {
  id: serial('id').primaryKey(),
  homeTeamId: integer('home_team_id').notNull().references(() => teams.id),
  awayTeamId: integer('away_team_id').notNull().references(() => teams.id),
  homeScore: integer('home_score'),
  awayScore: integer('away_score'),
  matchDate: timestamp('match_date').notNull(),
  status: text('status').notNull().default('pending'), // 'pending', 'live', 'completed'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Match Events (goals, assists, etc.)
export const matchEvents = pgTable('match_events', {
  id: serial('id').primaryKey(),
  matchId: integer('match_id').notNull().references(() => matches.id),
  playerId: integer('player_id').notNull().references(() => players.id),
  eventType: text('event_type').notNull(), // 'goal', 'assist', 'yellow_card', 'red_card'
  minute: integer('minute').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Player Scores (calculated for each player per match)
export const playerScores = pgTable('player_scores', {
  id: serial('id').primaryKey(),
  playerId: integer('player_id').notNull().references(() => players.id),
  matchId: integer('match_id').notNull().references(() => matches.id),
  points: integer('points').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// User Pool Scores (calculated per user, per pool)
export const userPoolScores = pgTable('user_pool_scores', {
  userId: text('user_id').notNull().references(() => users.id),
  poolId: integer('pool_id').notNull().references(() => pools.id),
  totalPoints: integer('total_points').notNull().default(0),
  rank: integer('rank'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.poolId] }),
}));

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  pools: many(pools),
  poolMemberships: many(poolMembers),
  teamSelections: many(userTeamSelections),
  scores: many(userPoolScores),
}));

export const poolsRelations = relations(pools, ({ one, many }) => ({
  creator: one(users, { fields: [pools.createdBy], references: [users.id] }),
  members: many(poolMembers),
  teamSelections: many(userTeamSelections),
  scores: many(userPoolScores),
}));

export const teamsRelations = relations(teams, ({ many }) => ({
  players: many(players),
  homeMatches: many(matches, { relationName: 'homeTeam' }),
  awayMatches: many(matches, { relationName: 'awayTeam' }),
  entrySelections: many(entryTeamSelections),
}));

export const playersRelations = relations(players, ({ one, many }) => ({
  team: one(teams, { fields: [players.teamId], references: [teams.id] }),
  teamSelections: many(userTeamSelections),
  matchEvents: many(matchEvents),
  scores: many(playerScores),
}));

export const poolMembersRelations = relations(poolMembers, ({ one }) => ({
  pool: one(pools, { fields: [poolMembers.poolId], references: [pools.id] }),
  user: one(users, { fields: [poolMembers.userId], references: [users.id] }),
}));

export const matchesRelations = relations(matches, ({ one, many }) => ({
  homeTeam: one(teams, { fields: [matches.homeTeamId], references: [teams.id], relationName: 'homeTeam' }),
  awayTeam: one(teams, { fields: [matches.awayTeamId], references: [teams.id], relationName: 'awayTeam' }),
  events: many(matchEvents),
  playerScores: many(playerScores),
}));

export const matchEventsRelations = relations(matchEvents, ({ one }) => ({
  match: one(matches, { fields: [matchEvents.matchId], references: [matches.id] }),
  player: one(players, { fields: [matchEvents.playerId], references: [players.id] }),
}));

export const playerScoresRelations = relations(playerScores, ({ one }) => ({
  player: one(players, { fields: [playerScores.playerId], references: [players.id] }),
  match: one(matches, { fields: [playerScores.matchId], references: [matches.id] }),
}));

export const userTeamSelectionsRelations = relations(userTeamSelections, ({ one }) => ({
  user: one(users, { fields: [userTeamSelections.userId], references: [users.id] }),
  pool: one(pools, { fields: [userTeamSelections.poolId], references: [pools.id] }),
  player: one(players, { fields: [userTeamSelections.playerId], references: [players.id] }),
}));

export const userPoolScoresRelations = relations(userPoolScores, ({ one }) => ({
  user: one(users, { fields: [userPoolScores.userId], references: [users.id] }),
  pool: one(pools, { fields: [userPoolScores.poolId], references: [pools.id] }),
}));

// Pool Entries Relations
export const poolEntriesRelations = relations(poolEntries, ({ one, many }) => ({
  pool: one(pools, { fields: [poolEntries.poolId], references: [pools.id] }),
  user: one(users, { fields: [poolEntries.userId], references: [users.id] }),
  teamSelections: many(entryTeamSelections),
  scores: many(entryScores),
}));

// Entry Team Selections Relations
export const entryTeamSelectionsRelations = relations(entryTeamSelections, ({ one }) => ({
  entry: one(poolEntries, { fields: [entryTeamSelections.entryId], references: [poolEntries.id] }),
  team: one(teams, { fields: [entryTeamSelections.teamId], references: [teams.id] }),
}));

// Entry Scores Relations
export const entryScoresRelations = relations(entryScores, ({ one }) => ({
  entry: one(poolEntries, { fields: [entryScores.entryId], references: [poolEntries.id] }),
  pool: one(pools, { fields: [entryScores.poolId], references: [pools.id] }),
}));
