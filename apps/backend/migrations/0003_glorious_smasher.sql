ALTER TABLE "User" RENAME COLUMN "id" TO "count";--> statement-breakpoint
ALTER TABLE "Favourite" DROP CONSTRAINT "Favourite_userId_User_user_id_fk";
--> statement-breakpoint
ALTER TABLE "SessionCustomer" DROP CONSTRAINT "SessionCustomer_userId_User_user_id_fk";
