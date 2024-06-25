import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { ingredient } from "~/migrations/schema";

export const IngredientSchema = z
	.object({
		id: z.string().uuid(),
		name: z.string().min(2, { message: "Ingredient name missing" }),
	})
	.required();

export const createIngredientSchema = createInsertSchema(ingredient);

export interface Ingredient
	extends Required<z.infer<typeof IngredientSchema>> {}

export interface CreateIngredient
	extends z.infer<typeof createIngredientSchema> {}
