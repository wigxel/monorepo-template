ALTER TABLE "User" DROP CONSTRAINT "User_user_id_fkey";
--> statement-breakpoint
ALTER TABLE "Favourite" DROP CONSTRAINT "Favourite_mealId_fkey";
--> statement-breakpoint
ALTER TABLE "Favourite" DROP CONSTRAINT "Favourite_userId_fkey";
--> statement-breakpoint
ALTER TABLE "RecipeIngredient" DROP CONSTRAINT "RecipeIngredient_measurementId_fkey";
--> statement-breakpoint
ALTER TABLE "RecipeIngredient" DROP CONSTRAINT "RecipeIngredient_ingredientId_fkey";
--> statement-breakpoint
ALTER TABLE "RecipeIngredient" DROP CONSTRAINT "RecipeIngredient_recipeId_fkey";
--> statement-breakpoint
ALTER TABLE "RecipeIngredient" DROP CONSTRAINT "RecipeIngredient_alternativeOfId_fkey";
--> statement-breakpoint
ALTER TABLE "RecipeStep" DROP CONSTRAINT "RecipeStep_recipeId_fkey";
--> statement-breakpoint
ALTER TABLE "_MealToRecipe" DROP CONSTRAINT "_MealToRecipe_A_fkey";
--> statement-breakpoint
ALTER TABLE "_MealToRecipe" DROP CONSTRAINT "_MealToRecipe_B_fkey";
--> statement-breakpoint
ALTER TABLE "_CategoryToMeal" DROP CONSTRAINT "_CategoryToMeal_A_fkey";
--> statement-breakpoint
ALTER TABLE "_CategoryToMeal" DROP CONSTRAINT "_CategoryToMeal_B_fkey";
--> statement-breakpoint
ALTER TABLE "SessionOrg" DROP CONSTRAINT "SessionOrg_user_id_fkey";
--> statement-breakpoint
ALTER TABLE "SessionCustomer" DROP CONSTRAINT "SessionCustomer_userId_fkey";
--> statement-breakpoint
ALTER TABLE "QuestionOption" DROP CONSTRAINT "QuestionOption_questionId_fkey";
--> statement-breakpoint
ALTER TABLE "User" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "Recipe" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "Recipe" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "RecipeStep" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "Meal" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "Meal" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "TeamMember" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "User" ADD CONSTRAINT "User_user_id_UserMeta_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "UserMeta"("user_id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Favourite" ADD CONSTRAINT "Favourite_mealId_Meal_id_fk" FOREIGN KEY ("mealId") REFERENCES "Meal"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Favourite" ADD CONSTRAINT "Favourite_userId_User_user_id_fk" FOREIGN KEY ("userId") REFERENCES "User"("user_id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "RecipeIngredient" ADD CONSTRAINT "RecipeIngredient_measurementId_Measurement_id_fk" FOREIGN KEY ("measurementId") REFERENCES "Measurement"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "RecipeIngredient" ADD CONSTRAINT "RecipeIngredient_ingredientId_Ingredient_id_fk" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "RecipeIngredient" ADD CONSTRAINT "RecipeIngredient_recipeId_Recipe_id_fk" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "RecipeIngredient" ADD CONSTRAINT "RecipeIngredient_alternativeOfId_fkey" FOREIGN KEY ("alternativeOfId") REFERENCES "RecipeIngredient"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "RecipeStep" ADD CONSTRAINT "RecipeStep_recipeId_Recipe_id_fk" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "_MealToRecipe" ADD CONSTRAINT "_MealToRecipe_A_Meal_id_fk" FOREIGN KEY ("A") REFERENCES "Meal"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "_MealToRecipe" ADD CONSTRAINT "_MealToRecipe_B_Recipe_id_fk" FOREIGN KEY ("B") REFERENCES "Recipe"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "_CategoryToMeal" ADD CONSTRAINT "_CategoryToMeal_A_Category_id_fk" FOREIGN KEY ("A") REFERENCES "Category"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "_CategoryToMeal" ADD CONSTRAINT "_CategoryToMeal_B_Meal_id_fk" FOREIGN KEY ("B") REFERENCES "Meal"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "SessionOrg" ADD CONSTRAINT "SessionOrg_user_id_TeamMember_id_fk" FOREIGN KEY ("user_id") REFERENCES "TeamMember"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "SessionCustomer" ADD CONSTRAINT "SessionCustomer_userId_User_user_id_fk" FOREIGN KEY ("userId") REFERENCES "User"("user_id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "QuestionOption" ADD CONSTRAINT "QuestionOption_questionId_Question_id_fk" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "User" ADD CONSTRAINT "User_user_id_unique" UNIQUE("user_id");