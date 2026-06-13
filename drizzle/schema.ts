import { pgTable, foreignKey, serial, integer, text, timestamp, unique, boolean, primaryKey } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const matchEvents = pgTable("match_events", {
	id: serial().primaryKey().notNull(),
	matchId: integer("match_id").notNull(),
	playerId: integer("player_id").notNull(),
	eventType: text("event_type").notNull(),
	minute: integer().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.matchId],
			foreignColumns: [matches.id],
			name: "match_events_match_id_matches_id_fk"
		}),
	foreignKey({
			columns: [table.playerId],
			foreignColumns: [players.id],
			name: "match_events_player_id_players_id_fk"
		}),
]);

export const playerScores = pgTable("player_scores", {
	id: serial().primaryKey().notNull(),
	playerId: integer("player_id").notNull(),
	matchId: integer("match_id").notNull(),
	points: integer().default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.playerId],
			foreignColumns: [players.id],
			name: "player_scores_player_id_players_id_fk"
		}),
	foreignKey({
			columns: [table.matchId],
			foreignColumns: [matches.id],
			name: "player_scores_match_id_matches_id_fk"
		}),
]);

export const players = pgTable("players", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	teamId: integer("team_id").notNull(),
	position: text(),
	number: integer(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.teamId],
			foreignColumns: [teams.id],
			name: "players_team_id_teams_id_fk"
		}),
]);

export const matches = pgTable("matches", {
	id: serial().primaryKey().notNull(),
	homeTeamId: integer("home_team_id").notNull(),
	awayTeamId: integer("away_team_id").notNull(),
	homeScore: integer("home_score"),
	awayScore: integer("away_score"),
	matchDate: timestamp("match_date", { mode: 'string' }).notNull(),
	status: text().default('pending').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.homeTeamId],
			foreignColumns: [teams.id],
			name: "matches_home_team_id_teams_id_fk"
		}),
	foreignKey({
			columns: [table.awayTeamId],
			foreignColumns: [teams.id],
			name: "matches_away_team_id_teams_id_fk"
		}),
]);

export const teams = pgTable("teams", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	code: text().notNull(),
	flag: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	cost: integer().default(0).notNull(),
}, (table) => [
	unique("teams_name_unique").on(table.name),
	unique("teams_code_unique").on(table.code),
]);

export const pools = pgTable("pools", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	createdBy: text("created_by").notNull(),
	maxParticipants: integer("max_participants"),
	entryFee: integer("entry_fee"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "pools_created_by_users_id_fk"
		}),
]);

export const users = pgTable("users", {
	id: text().primaryKey().notNull(),
	email: text().notNull(),
	name: text(),
	picture: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("users_email_unique").on(table.email),
]);

export const entryTeamSelections = pgTable("entry_team_selections", {
	entryId: integer("entry_id").notNull(),
	teamId: integer("team_id").notNull(),
	isShort: boolean("is_short").default(false),
	pointsEarned: integer("points_earned").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	id: serial().primaryKey().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.entryId],
			foreignColumns: [poolEntries.id],
			name: "entry_team_selections_entry_id_pool_entries_id_fk"
		}),
	foreignKey({
			columns: [table.teamId],
			foreignColumns: [teams.id],
			name: "entry_team_selections_team_id_teams_id_fk"
		}),
	unique("entry_team_selections_entry_id_team_id_unique").on(table.entryId, table.teamId),
]);

export const poolEntries = pgTable("pool_entries", {
	id: serial().primaryKey().notNull(),
	poolId: integer("pool_id").notNull(),
	userId: text("user_id").notNull(),
	name: text().notNull(),
	budgetSpent: integer("budget_spent").default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.poolId],
			foreignColumns: [pools.id],
			name: "pool_entries_pool_id_pools_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "pool_entries_user_id_users_id_fk"
		}),
	unique("pool_entries_pool_id_user_id_name_unique").on(table.poolId, table.userId, table.name),
]);

export const entryScores = pgTable("entry_scores", {
	entryId: integer("entry_id").notNull(),
	poolId: integer("pool_id").notNull(),
	totalPoints: integer("total_points").default(0).notNull(),
	rank: integer(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	id: serial().primaryKey().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.entryId],
			foreignColumns: [poolEntries.id],
			name: "entry_scores_entry_id_pool_entries_id_fk"
		}),
	foreignKey({
			columns: [table.poolId],
			foreignColumns: [pools.id],
			name: "entry_scores_pool_id_pools_id_fk"
		}),
	unique("entry_scores_entry_id_pool_id_unique").on(table.entryId, table.poolId),
]);

export const poolMembers = pgTable("pool_members", {
	poolId: integer("pool_id").notNull(),
	userId: text("user_id").notNull(),
	joinedAt: timestamp("joined_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.poolId],
			foreignColumns: [pools.id],
			name: "pool_members_pool_id_pools_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "pool_members_user_id_users_id_fk"
		}),
	primaryKey({ columns: [table.poolId, table.userId], name: "pool_members_pool_id_user_id_pk"}),
]);

export const userPoolScores = pgTable("user_pool_scores", {
	userId: text("user_id").notNull(),
	poolId: integer("pool_id").notNull(),
	totalPoints: integer("total_points").default(0).notNull(),
	rank: integer(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_pool_scores_user_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.poolId],
			foreignColumns: [pools.id],
			name: "user_pool_scores_pool_id_pools_id_fk"
		}),
	primaryKey({ columns: [table.userId, table.poolId], name: "user_pool_scores_user_id_pool_id_pk"}),
]);

export const userTeamSelections = pgTable("user_team_selections", {
	userId: text("user_id").notNull(),
	poolId: integer("pool_id").notNull(),
	playerId: integer("player_id").notNull(),
	captain: boolean().default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_team_selections_user_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.poolId],
			foreignColumns: [pools.id],
			name: "user_team_selections_pool_id_pools_id_fk"
		}),
	foreignKey({
			columns: [table.playerId],
			foreignColumns: [players.id],
			name: "user_team_selections_player_id_players_id_fk"
		}),
	primaryKey({ columns: [table.userId, table.poolId, table.playerId], name: "user_team_selections_user_id_pool_id_player_id_pk"}),
]);
