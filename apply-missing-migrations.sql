-- Apply migrations 0002-0005 to create missing tables
-- Run this in your Neon SQL editor for the ep-royal-tree (dev) branch

-- Migration 0002: Create the 3 missing tables and add cost to teams
CREATE TABLE "entry_scores" (
	"id" serial PRIMARY KEY NOT NULL,
	"entry_id" integer NOT NULL,
	"pool_id" integer NOT NULL,
	"total_points" integer DEFAULT 0 NOT NULL,
	"rank" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "entry_scores_entry_id_pool_id_pk" PRIMARY KEY("entry_id","pool_id")
);

CREATE TABLE "entry_team_selections" (
	"id" serial PRIMARY KEY NOT NULL,
	"entry_id" integer NOT NULL,
	"team_id" integer NOT NULL,
	"is_short" boolean DEFAULT false,
	"points_earned" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "entry_team_selections_entry_id_team_id_pk" PRIMARY KEY("entry_id","team_id")
);

CREATE TABLE "pool_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"pool_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"budget_spent" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "pool_entries_pool_id_user_id_name_pk" PRIMARY KEY("pool_id","user_id","name")
);

ALTER TABLE "teams" ADD COLUMN "cost" integer DEFAULT 0 NOT NULL;

ALTER TABLE "entry_scores" ADD CONSTRAINT "entry_scores_entry_id_pool_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."pool_entries"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "entry_scores" ADD CONSTRAINT "entry_scores_pool_id_pools_id_fk" FOREIGN KEY ("pool_id") REFERENCES "public"."pools"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "entry_team_selections" ADD CONSTRAINT "entry_team_selections_entry_id_pool_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."pool_entries"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "entry_team_selections" ADD CONSTRAINT "entry_team_selections_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "pool_entries" ADD CONSTRAINT "pool_entries_pool_id_pools_id_fk" FOREIGN KEY ("pool_id") REFERENCES "public"."pools"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "pool_entries" ADD CONSTRAINT "pool_entries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;

-- Migration 0003 & 0004 (drop and re-add id): Skip these - they're just internal restructuring

-- Migration 0005: Convert composite PKs to unique constraints
ALTER TABLE "entry_scores" DROP CONSTRAINT "entry_scores_entry_id_pool_id_pk";

ALTER TABLE "entry_team_selections" DROP CONSTRAINT "entry_team_selections_entry_id_team_id_pk";

ALTER TABLE "pool_entries" DROP CONSTRAINT "pool_entries_pool_id_user_id_name_pk";

ALTER TABLE "entry_scores" ADD CONSTRAINT "entry_scores_entry_id_pool_id_unique" UNIQUE("entry_id","pool_id");

ALTER TABLE "entry_team_selections" ADD CONSTRAINT "entry_team_selections_entry_id_team_id_unique" UNIQUE("entry_id","team_id");

ALTER TABLE "pool_entries" ADD CONSTRAINT "pool_entries_pool_id_user_id_name_unique" UNIQUE("pool_id","user_id","name");
