import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { meal } from "~/migrations/schema";

export interface Meal extends z.infer<typeof Meal> {}
export interface CreateMeal extends z.infer<typeof CreateMeal> {}

const selectMealSchema = createSelectSchema(meal);
export const Meal = selectMealSchema.merge(
	z.object({
		serial: z.number(),
		id: z.string().uuid(),
		name: z.string().min(1),
		description: z.string().min(10, { message: "Meal description too short" }),
		status: z.enum(["PUBLISHED", "DRAFT"]),
		updated_at: z.string().datetime(),
		created_at: z.string().datetime(),
		video_url: z.string().url(),
	}),
);

const createMealSchema = createInsertSchema(meal);
export const CreateMeal = createMealSchema
	.omit({
		serial: true,
		id: true,
		categoryId: true,
	})
	.merge(
		z.object({
			categories: z.array(z.coerce.number()),
		}),
	)
	.required()
	.default({
		status: "DRAFT",
	});
