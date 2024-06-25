ALTER TABLE "SessionCustomer" ALTER COLUMN "expiresAt" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "SessionOrg" ALTER COLUMN "expiresAt" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "User" ALTER COLUMN "id" SET DATA TYPE text;