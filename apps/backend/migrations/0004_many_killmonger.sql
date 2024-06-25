ALTER TABLE "User" RENAME COLUMN "user_id" TO "id";--> statement-breakpoint
ALTER TABLE "User" DROP CONSTRAINT "User_user_id_unique";--> statement-breakpoint
ALTER TABLE "User" DROP CONSTRAINT "User_user_id_UserMeta_user_id_fk";
--> statement-breakpoint
ALTER TABLE "User" ALTER COLUMN count TYPE INTEGER USING count::INTEGER;
CREATE SEQUENCE users_count_seq AS integer START 1 OWNED BY "User"."count";
ALTER TABLE "User" ALTER COLUMN count SET DEFAULT nextval('users_count_seq');

DO $$ BEGIN
 ALTER TABLE "User" ADD CONSTRAINT "User_id_UserMeta_user_id_fk" FOREIGN KEY ("id") REFERENCES "UserMeta"("user_id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "User" ADD CONSTRAINT "User_id_unique" UNIQUE("id");
