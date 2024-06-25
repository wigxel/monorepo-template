import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { recipe } from "~/migrations/schema";

export interface Recipe extends Required<z.infer<typeof Recipe>> {}

const BaseRecipe = z.object({
	serial: z.number(),
	id: z.string().uuid(),
	serving: z.number().min(1),
	cooking_time: z.number().min(1), // cooking time in minutes
	created_at: z.string().datetime(),
	updated_at: z.string().datetime().optional(),
});

const createRecipeSchema = createInsertSchema(recipe);

export interface CreateRecipe extends z.infer<typeof createRecipeSchema> {}

export const Step = z.object({
	image: z.string().url(),
	order: z.coerce.number(),
	caption: z.string().min(1),
	paragraph: z.string().min(1),
	recipeId: z.string(),
});

const CreateStep = Step.omit({
	recipeId: true,
});

export const CreateRecipeIngredientSchema = z.object({
	measurement_id: z.coerce.number().min(1),
	ingredient_id: z.coerce.number().min(1),
	quantity: z.coerce.number(),
	alt: z.string().optional(),
});

export const CreateRecipe = z
	.object({
		meal_id: z.string().uuid(),
		steps: z.array(CreateStep),
		ingredients: z.array(CreateRecipeIngredientSchema).default([]),
	})
	.merge(
		BaseRecipe.omit({
			id: true,
			serial: true,
			updated_at: true,
			created_at: true,
		}),
	)
	.required()
	.default({});

export const Recipe = BaseRecipe;
