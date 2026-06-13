ALTER TABLE "entry_scores" DROP CONSTRAINT "entry_scores_entry_id_pool_id_pk";--> statement-breakpoint
ALTER TABLE "entry_team_selections" DROP CONSTRAINT "entry_team_selections_entry_id_team_id_pk";--> statement-breakpoint
ALTER TABLE "pool_entries" DROP CONSTRAINT "pool_entries_pool_id_user_id_name_pk";--> statement-breakpoint
ALTER TABLE "entry_scores" ADD CONSTRAINT "entry_scores_entry_id_pool_id_unique" UNIQUE("entry_id","pool_id");--> statement-breakpoint
ALTER TABLE "entry_team_selections" ADD CONSTRAINT "entry_team_selections_entry_id_team_id_unique" UNIQUE("entry_id","team_id");--> statement-breakpoint
ALTER TABLE "pool_entries" ADD CONSTRAINT "pool_entries_pool_id_user_id_name_unique" UNIQUE("pool_id","user_id","name");