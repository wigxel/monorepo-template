import { Context, Effect, Layer } from "effect";
import {
	IngredientRepo,
	IngredientRepoLive,
} from "~/repositories/ingredient.repository";
import { searchByQueryRepo } from "~/services/search.service";

export const createIngredient = (input: { name: string }) => {
	return Effect.gen(function* (_) {
		const repo = yield* IngredientRepo;
		return yield* repo.create(input);
	});
};

export const findIngredientByQuery = Effect.gen(function* (_) {
	const repo = yield* IngredientRepo;
	return yield* searchByQueryRepo(repo);
});

export interface IngredientImpl {
	readonly createIngredient: typeof createIngredient;
	readonly findIngredientByQuery: typeof findIngredientByQuery;
}

export class IngredientService extends Context.Tag("IngredientService")<
	IngredientService,
	IngredientImpl
>() {}

export const IngredientImpl = IngredientService.of({
	createIngredient,
	findIngredientByQuery,
});

export const IngredientServiceLive = Layer.succeed(
	IngredientService,
	IngredientImpl,
).pipe(Layer.provideMerge(IngredientRepoLive));
