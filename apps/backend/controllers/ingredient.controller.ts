import { Effect } from "effect";
import { ValidationError } from "~/config/exceptions";
import { createIngredientSchema } from "~/dtos/ingredients.dto";
import { IngredientService } from "~/services/ingredients.service";

export const getAllIngredients = Effect.gen(function* (_) {
	const service = yield* _(IngredientService);

	return yield* _(service.findIngredientByQuery);
});

export const createIngredient = (body: { name: string }) =>
	Effect.gen(function* (_) {
		const service = yield* _(IngredientService);
		yield* validateZod(() => createIngredientSchema.safeParse(body));

		return yield* _(service.createIngredient(body));
	});
