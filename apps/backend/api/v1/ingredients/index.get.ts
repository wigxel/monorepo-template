import { Effect, Layer } from "effect";
import { getAllIngredients } from "~/controllers/ingredient.controller";
import { IngredientRepoLive } from "~/repositories/ingredient.repository";
import { IngredientServiceLive } from "~/services/ingredients.service";
import { SearchServiceLive } from "~/services/search.service";
import { querySchema, searchSchema } from "~/utils/validators";

const schema = querySchema.merge(searchSchema);

export default defineCachedEventHandler(
	async (event) => {
		const query = await getValidatedQuery(event, schema.parse);

		return runPromise(
			event,
			Effect.provide(
				getAllIngredients,
				requirements.pipe(Layer.provideMerge(SearchServiceLive(query))),
			),
		);
	},
	{ maxAge: 60 * 60 },
);

const requirements = IngredientServiceLive.pipe(
	Layer.provideMerge(IngredientRepoLive),
);
