import { Effect, Layer } from "effect";
import { createIngredient } from "~/controllers/ingredient.controller";
import { CategoryRepoLive } from "~/repositories/category.repository";
import { IngredientRepoLive } from "~/repositories/ingredient.repository";
import { IngredientServiceLive } from "~/services/ingredients.service";
import { SearchServiceLive } from "~/services/search.service";

export default eventHandler(async (event) => {
	const program = pipe(
		createIngredient(await readBody(event)),
		Effect.map((result) => {
			return {
				message: "Ingredient created",
				data: result,
			};
		}),
	);

	return runPromise(
		event,
		Effect.provide(
			program,
			Services.pipe(
				Layer.provideMerge(SearchServiceLive(await getQuery(event))),
			),
		),
	);
});

const Services = IngredientServiceLive.pipe(
	Layer.provideMerge(CategoryRepoLive),
	Layer.provideMerge(IngredientRepoLive),
);
