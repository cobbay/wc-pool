import { relations } from "drizzle-orm/relations";
import { matches, matchEvents, players, playerScores, teams, users, pools, poolEntries, entryTeamSelections, entryScores, poolMembers, userPoolScores, userTeamSelections } from "./schema";

export const matchEventsRelations = relations(matchEvents, ({one}) => ({
	match: one(matches, {
		fields: [matchEvents.matchId],
		references: [matches.id]
	}),
	player: one(players, {
		fields: [matchEvents.playerId],
		references: [players.id]
	}),
}));

export const matchesRelations = relations(matches, ({one, many}) => ({
	matchEvents: many(matchEvents),
	playerScores: many(playerScores),
	team_homeTeamId: one(teams, {
		fields: [matches.homeTeamId],
		references: [teams.id],
		relationName: "matches_homeTeamId_teams_id"
	}),
	team_awayTeamId: one(teams, {
		fields: [matches.awayTeamId],
		references: [teams.id],
		relationName: "matches_awayTeamId_teams_id"
	}),
}));

export const playersRelations = relations(players, ({one, many}) => ({
	matchEvents: many(matchEvents),
	playerScores: many(playerScores),
	team: one(teams, {
		fields: [players.teamId],
		references: [teams.id]
	}),
	userTeamSelections: many(userTeamSelections),
}));

export const playerScoresRelations = relations(playerScores, ({one}) => ({
	player: one(players, {
		fields: [playerScores.playerId],
		references: [players.id]
	}),
	match: one(matches, {
		fields: [playerScores.matchId],
		references: [matches.id]
	}),
}));

export const teamsRelations = relations(teams, ({many}) => ({
	players: many(players),
	matches_homeTeamId: many(matches, {
		relationName: "matches_homeTeamId_teams_id"
	}),
	matches_awayTeamId: many(matches, {
		relationName: "matches_awayTeamId_teams_id"
	}),
	entryTeamSelections: many(entryTeamSelections),
}));

export const poolsRelations = relations(pools, ({one, many}) => ({
	user: one(users, {
		fields: [pools.createdBy],
		references: [users.id]
	}),
	poolEntries: many(poolEntries),
	entryScores: many(entryScores),
	poolMembers: many(poolMembers),
	userPoolScores: many(userPoolScores),
	userTeamSelections: many(userTeamSelections),
}));

export const usersRelations = relations(users, ({many}) => ({
	pools: many(pools),
	poolEntries: many(poolEntries),
	poolMembers: many(poolMembers),
	userPoolScores: many(userPoolScores),
	userTeamSelections: many(userTeamSelections),
}));

export const entryTeamSelectionsRelations = relations(entryTeamSelections, ({one}) => ({
	poolEntry: one(poolEntries, {
		fields: [entryTeamSelections.entryId],
		references: [poolEntries.id]
	}),
	team: one(teams, {
		fields: [entryTeamSelections.teamId],
		references: [teams.id]
	}),
}));

export const poolEntriesRelations = relations(poolEntries, ({one, many}) => ({
	entryTeamSelections: many(entryTeamSelections),
	pool: one(pools, {
		fields: [poolEntries.poolId],
		references: [pools.id]
	}),
	user: one(users, {
		fields: [poolEntries.userId],
		references: [users.id]
	}),
	entryScores: many(entryScores),
}));

export const entryScoresRelations = relations(entryScores, ({one}) => ({
	poolEntry: one(poolEntries, {
		fields: [entryScores.entryId],
		references: [poolEntries.id]
	}),
	pool: one(pools, {
		fields: [entryScores.poolId],
		references: [pools.id]
	}),
}));

export const poolMembersRelations = relations(poolMembers, ({one}) => ({
	pool: one(pools, {
		fields: [poolMembers.poolId],
		references: [pools.id]
	}),
	user: one(users, {
		fields: [poolMembers.userId],
		references: [users.id]
	}),
}));

export const userPoolScoresRelations = relations(userPoolScores, ({one}) => ({
	user: one(users, {
		fields: [userPoolScores.userId],
		references: [users.id]
	}),
	pool: one(pools, {
		fields: [userPoolScores.poolId],
		references: [pools.id]
	}),
}));

export const userTeamSelectionsRelations = relations(userTeamSelections, ({one}) => ({
	user: one(users, {
		fields: [userTeamSelections.userId],
		references: [users.id]
	}),
	pool: one(pools, {
		fields: [userTeamSelections.poolId],
		references: [pools.id]
	}),
	player: one(players, {
		fields: [userTeamSelections.playerId],
		references: [players.id]
	}),
}));