CREATE TABLE "match_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"match_id" integer NOT NULL,
	"player_id" integer NOT NULL,
	"event_type" text NOT NULL,
	"minute" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "matches" (
	"id" serial PRIMARY KEY NOT NULL,
	"home_team_id" integer NOT NULL,
	"away_team_id" integer NOT NULL,
	"home_score" integer,
	"away_score" integer,
	"match_date" timestamp NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "player_scores" (
	"id" serial PRIMARY KEY NOT NULL,
	"player_id" integer NOT NULL,
	"match_id" integer NOT NULL,
	"points" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "players" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"team_id" integer NOT NULL,
	"position" text,
	"number" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pool_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"pool_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "pool_members_pool_id_user_id_pk" PRIMARY KEY("pool_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "pools" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_by" text NOT NULL,
	"max_participants" integer,
	"entry_fee" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"flag" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "teams_name_unique" UNIQUE("name"),
	CONSTRAINT "teams_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "user_pool_scores" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"pool_id" integer NOT NULL,
	"total_points" integer DEFAULT 0 NOT NULL,
	"rank" integer,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_pool_scores_user_id_pool_id_pk" PRIMARY KEY("user_id","pool_id")
);
--> statement-breakpoint
CREATE TABLE "user_team_selections" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"pool_id" integer NOT NULL,
	"player_id" integer NOT NULL,
	"captain" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_team_selections_user_id_pool_id_player_id_pk" PRIMARY KEY("user_id","pool_id","player_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"picture" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "match_events" ADD CONSTRAINT "match_events_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_events" ADD CONSTRAINT "match_events_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_home_team_id_teams_id_fk" FOREIGN KEY ("home_team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_away_team_id_teams_id_fk" FOREIGN KEY ("away_team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_scores" ADD CONSTRAINT "player_scores_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_scores" ADD CONSTRAINT "player_scores_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "players" ADD CONSTRAINT "players_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pool_members" ADD CONSTRAINT "pool_members_pool_id_pools_id_fk" FOREIGN KEY ("pool_id") REFERENCES "public"."pools"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pool_members" ADD CONSTRAINT "pool_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pools" ADD CONSTRAINT "pools_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_pool_scores" ADD CONSTRAINT "user_pool_scores_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_pool_scores" ADD CONSTRAINT "user_pool_scores_pool_id_pools_id_fk" FOREIGN KEY ("pool_id") REFERENCES "public"."pools"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_team_selections" ADD CONSTRAINT "user_team_selections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_team_selections" ADD CONSTRAINT "user_team_selections_pool_id_pools_id_fk" FOREIGN KEY ("pool_id") REFERENCES "public"."pools"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_team_selections" ADD CONSTRAINT "user_team_selections_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;