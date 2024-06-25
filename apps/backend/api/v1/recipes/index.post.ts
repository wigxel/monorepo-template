import { Effect, Layer } from "effect";
import { MealRepoLive } from "~/repositories/meal.repository";
import { RecipeRepoLive } from "~/repositories/recipe.repository";
import { createFreshRecipe } from "~/services/recipe.service";

export default defineEventHandler(async (event) => {
	const body = await readBody(event);

	return runPromise(
		event,
		Effect.provide(
			createFreshRecipe(body),
			Layer.merge(MealRepoLive, RecipeRepoLive),
		),
	);
});
