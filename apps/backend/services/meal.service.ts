import { Context, Effect, Layer } from "effect";
import { CreateMeal } from "~/dtos/meal.dto";
import {
	CategoryRepo,
	CategoryRepoLive,
} from "~/repositories/category.repository";
import { MealRepo, MealRepoLive } from "~/repositories/meal.repository";

import { ExpectedError } from "~/config/exceptions";
import { searchByQueryRepo } from "~/services/search.service";
import { validateZod } from "~/utils/lib";

export function create(input: Record<string, unknown>) {
	return Effect.gen(function* (_) {
		const repo = yield* MealRepo;
		const category_repo = yield* CategoryRepo;

		const body = yield* validateZod(() => CreateMeal.safeParse(input), {
			failureMessage: "Unable to create Meal",
		});

		const data = yield* category_repo.findMany(body.categories);

		if (data.length !== body.categories.length) {
			return yield* new ExpectedError(
				"One or more invalid categories provided",
			);
		}

		return yield* repo.create(body as CreateMeal);
	});
}

export const searchByQuery = Effect.gen(function* (_) {
	const repo = yield* _(MealRepo);

	return yield* _(searchByQueryRepo(repo));
});

export interface MealServiceImpl {
	readonly create: typeof create;
	readonly searchByQuery: typeof searchByQuery;
}

export class MealService extends Context.Tag("MealService")<
	MealService,
	MealServiceImpl
>() {}

export const MealServiceImpl = MealService.of({
	create,
	searchByQuery,
});

const Local = Layer.succeed(MealService, MealServiceImpl);

export const MealServiceLive = Local.pipe(
	Layer.provideMerge(MealRepoLive),
	Layer.provideMerge(CategoryRepoLive),
);
