import { Context, Effect, Layer } from "effect";
import { CreateRecipe } from "~/dtos/recipe.dto";
import { CategoryRepoLive } from "~/repositories/category.repository";
import { MealRepoLive } from "~/repositories/meal.repository";
import { RecipeRepo, RelationsMap } from "~/repositories/recipe.repository";
import { PaginationService } from "./pagination.service";

export function createFreshRecipe(body: unknown) {
	return Effect.gen(function* (_) {
		const repo = yield* _(RecipeRepo);
		const formData = yield* validateZod(() => CreateRecipe.safeParse(body));
		const value = yield* repo.create(formData as CreateRecipe);

		return {
			message: "Recipe created",
			data: value,
		};
	});
}

export function getFullRecipeDetails(input: {
	id: string;
	omit?: RelationsMap;
}) {
	return Effect.gen(function* (_) {
		const recipeRepo = yield* _(RecipeRepo);

		return yield* recipeRepo.fullInfo(input);
	});
}

export function findRecipe() {
	return Effect.gen(function* (_) {
		const pagination = yield* _(PaginationService);
		const repo = yield* _(RecipeRepo);

		const [total, results] = yield* Effect.all([
			repo.count(),
			repo.all({
				omit: { RecipeStep: true },
				query: pagination.query,
			}),
		]);

		return {
			data: results.map(({ Meal: meals, ...rest }) => {
				return { ...rest, meals };
			}),
			meta: {
				...pagination.meta,
				total: total,
			},
		};
	});
}

export interface RecipeServiceImpl {
	readonly createFreshRecipe: typeof createFreshRecipe;
}

export class RecipeService extends Context.Tag("RecipeService")<
	RecipeService,
	RecipeServiceImpl
>() {}

export const RecipeServiceImpl = RecipeService.of({
	createFreshRecipe,
});

export const RecipeServiceLive = Layer.merge(
	Layer.merge(Layer.succeed(RecipeService, RecipeServiceImpl), MealRepoLive),
	CategoryRepoLive,
);
