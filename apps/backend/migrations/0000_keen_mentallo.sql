-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations

DO $$ BEGIN
 CREATE TYPE "PublishStatus" AS ENUM('PUBLISHED', 'DRAFT', 'UNPUBLISHED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "MemberRole" AS ENUM('ADMIN', 'OWNER', 'CREATOR');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"checksum" varchar(64) NOT NULL,
	"finished_at" timestamp with time zone,
	"migration_name" varchar(255) NOT NULL,
	"logs" text,
	"rolled_back_at" timestamp with time zone,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"applied_steps_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "User" (
	"id" serial NOT NULL,
	"email" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"created_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp(6) with time zone,
	"user_id" text PRIMARY KEY NOT NULL,
	"password" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Recipe" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"serving" integer NOT NULL,
	"cooking_time" integer NOT NULL,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"serial" serial NOT NULL,
	"updated_at" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Favourite" (
	"id" serial PRIMARY KEY NOT NULL,
	"mealId" text NOT NULL,
	"userId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Category" (
	"id" serial PRIMARY KEY NOT NULL,
	"label" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Measurement" (
	"id" serial PRIMARY KEY NOT NULL,
	"unit" text NOT NULL,
	"si_unit" text NOT NULL,
	"si_unit_plural" text DEFAULT '' NOT NULL,
	"unit_plural" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Ingredient" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "RecipeIngredient" (
	"id" serial PRIMARY KEY NOT NULL,
	"quantity" double precision NOT NULL,
	"measurementId" integer NOT NULL,
	"ingredientId" integer NOT NULL,
	"alternativeOfId" integer,
	"recipeId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "RecipeStep" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"image" text NOT NULL,
	"order" integer NOT NULL,
	"caption" text NOT NULL,
	"paragraph" text NOT NULL,
	"recipeId" text,
	"serial" serial NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Meal" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"description" text NOT NULL,
	"status" "PublishStatus" NOT NULL,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp(3),
	"video_url" text NOT NULL,
	"name" text NOT NULL,
	"serial" serial NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "_MealToRecipe" (
	"A" text NOT NULL,
	"B" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "_CategoryToMeal" (
	"A" integer NOT NULL,
	"B" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "UserMeta" (
	"user_id" text NOT NULL,
	"onboarded_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Question" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"text" text NOT NULL,
	"status" "PublishStatus" DEFAULT 'DRAFT' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "TeamMember" (
	"id" text PRIMARY KEY NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"role" "MemberRole" NOT NULL,
	"created_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp(6) with time zone,
	"password" text DEFAULT '' NOT NULL,
	"deleted_at" timestamp(6) with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "SessionOrg" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expiresAt" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "SessionCustomer" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"expiresAt" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "QuestionOption" (
	"id" text PRIMARY KEY NOT NULL,
	"text" text NOT NULL,
	"image" text,
	"questionId" text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User" ("email");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "User_meta_key" ON "UserMeta" ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "Category_label_key" ON "Category" ("label");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "Measurement_unit_key" ON "Measurement" ("unit");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "Measurement_si_unit_key" ON "Measurement" ("si_unit");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "Ingredient_name_key" ON "Ingredient" ("name");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "Meal_name_key" ON "Meal" ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "_MealToRecipe_B_index" ON "_MealToRecipe" ("B");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "_MealToRecipe_AB_unique" ON "_MealToRecipe" ("A","B");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "_CategoryToMeal_AB_unique" ON "_CategoryToMeal" ("A","B");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "_CategoryToMeal_B_index" ON "_CategoryToMeal" ("B");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "TeamMember_email_key" ON "TeamMember" ("email");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "User" ADD CONSTRAINT "User_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."UserMeta"("user_id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Favourite" ADD CONSTRAINT "Favourite_mealId_fkey" FOREIGN KEY ("mealId") REFERENCES "public"."Meal"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Favourite" ADD CONSTRAINT "Favourite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("user_id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "RecipeIngredient" ADD CONSTRAINT "RecipeIngredient_measurementId_fkey" FOREIGN KEY ("measurementId") REFERENCES "public"."Measurement"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "RecipeIngredient" ADD CONSTRAINT "RecipeIngredient_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "public"."Ingredient"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "RecipeIngredient" ADD CONSTRAINT "RecipeIngredient_alternativeOfId_fkey" FOREIGN KEY ("alternativeOfId") REFERENCES "public"."RecipeIngredient"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "RecipeIngredient" ADD CONSTRAINT "RecipeIngredient_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "public"."Recipe"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "RecipeStep" ADD CONSTRAINT "RecipeStep_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "public"."Recipe"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "_MealToRecipe" ADD CONSTRAINT "_MealToRecipe_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Meal"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "_MealToRecipe" ADD CONSTRAINT "_MealToRecipe_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Recipe"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "_CategoryToMeal" ADD CONSTRAINT "_CategoryToMeal_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Category"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "_CategoryToMeal" ADD CONSTRAINT "_CategoryToMeal_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Meal"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "SessionOrg" ADD CONSTRAINT "SessionOrg_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."TeamMember"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "SessionCustomer" ADD CONSTRAINT "SessionCustomer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("user_id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "QuestionOption" ADD CONSTRAINT "QuestionOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."Question"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
