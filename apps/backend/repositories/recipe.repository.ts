import { safeArray } from "@repo/shared/src/data.helpers";
import { and, eq } from "drizzle-orm";
import { Context, Effect, Layer } from "effect";
import * as A from "effect/Array";
import { QueryError } from "~/config/exceptions";
import { CreateRecipe } from "~/dtos/recipe.dto";
import {
	countWhere,
	notNil,
	queryEqualMap,
	runDrizzleQuery,
} from "~/libs/query.helpers";
import {
	mealToRecipe,
	recipe,
	recipeIngredient,
	recipeStep,
} from "~/migrations/schema";
import { MealRepo, SelectMeal } from "~/repositories/meal.repository";
import { Countable, SearchableRepo } from "~/utils/repo.types";
import { PaginationQuery } from "~/utils/types";

export type RelationsMap = Partial<{
	Meal: boolean;
	RecipeStep: boolean;
}>;

export class RecipeRepository implements Countable, SearchableRepo {
	count() {
		return countWhere(recipe);
	}

	create(input: CreateRecipe) {
		return Effect.gen(function* (_) {
			const { steps, meal_id, ingredients, ...data } = input;
			const mealRepo = yield* MealRepo;

			const meal_exists = yield* mealRepo.count({ id: meal_id });

			if (meal_exists < 1) {
				return yield* new QueryError(
					`Meal doesn't exists. Error creating a Recipe without a Meal`,
				);
			}

			return yield* runDrizzleQuery(async (db) => {
				return db.transaction(async (trx) => {
					const { cooking_time, ...rest } = data;

					// Insert the recipe
					const newRecipe = await trx
						.insert(recipe)
						.values({
							...rest,
							cookingTime: data.cooking_time,
							updatedAt: new Date().toISOString(),
						})
						.returning();

					const recipeId = newRecipe[0].id;

					// Insert the recipe steps
					const stepsData = input.steps.map((step) => ({
						recipe_id: recipeId,
						image: step.image,
						order: step.order,
						caption: step.caption,
						paragraph: step.paragraph,
					}));

					await Promise.all([
						// link the Meal to Recipe
						trx
							.insert(mealToRecipe)
							.values({
								b: recipeId,
								a: meal_id,
							}),

						// Insert the recipe ingredients
						trx
							.insert(recipeIngredient)
							.values(
								ingredients.map((item) => ({
									recipeId: recipeId,
									ingredientId: item.ingredient_id,
									measurementId: item.measurement_id,
									quantity: item.quantity,
									alternativeOf: undefined,
								})),
							),
						trx.insert(recipeStep).values(stepsData),
					]);

					// Return the newly created recipe with related data
					return RecipeRepository.flattenRelations(
						await trx.query.recipe.findFirst({
							where: eq(recipe.id, recipeId),
							with: {
								MealToRecipe: {
									with: {
										Meal: true,
									},
								},
								RecipeIngredient: true,
								RecipeStep: true,
							},
						}),
					);
				});
			});
		});
	}

	static flattenRelations<
		T extends {
			MealToRecipe: Array<{ Meal: SelectMeal }>;
		},
	>({ MealToRecipe, ...recipe }: T) {
		return {
			...recipe,
			Meal: safeArray(MealToRecipe).map((e) => e.Meal),
		};
	}

	searchByQuery() {
		return Effect.fail(new Error("Search by query is missing implementation"));
	}

	delete(input: { id: string }) {
		return runDrizzleQuery((db) =>
			db.delete(recipe).where(eq(recipe.id, input.id)),
		);
	}

	findFirstOrThrow(input: { id: string }) {
		return runDrizzleQuery(async (db) => {
			db.query.recipe.findFirst({
				where: eq(recipe.id, input.id),
			});
		}).pipe(Effect.flatMap(notNil));
	}

	fullInfo(input: { id: string; omit?: RelationsMap }) {
		const { omit = {} } = input;

		return runDrizzleQuery(async (db) => {
			return RecipeRepository.flattenRelations(
				await db.query.recipe.findFirst({
					where: queryEqualMap(recipe, { id: input.id }),
					with: {
						MealToRecipe: {
							with: {
								Meal: true,
							},
						},
						RecipeStep: true,
						...toggleObjectValues(omit),
					},
				}),
			);
		});
	}

	all(params: { query: PaginationQuery; omit?: RelationsMap }) {
		const { omit = {}, query } = params;

		return runDrizzleQuery((db) => {
			return db.query.recipe.findMany({
				offset: query.pageNumber,
				limit: query.pageSize,
				with: {
					MealToRecipe: {
						with: {
							Meal: true,
						},
					},
					RecipeStep: true,
					...toggleObjectValues(omit),
				},
			});
		}).pipe(Effect.map(A.map(RecipeRepository.flattenRelations)));
	}
}

export class RecipeRepo extends Context.Tag("RecipeRepo")<
	RecipeRepo,
	RecipeRepository
>() {}

export const RecipeRepoLive = Layer.succeed(RecipeRepo, new RecipeRepository());

function toggleObjectValues(omit_flags: Record<string, boolean>) {
	return Object.fromEntries(
		Object.keys(omit_flags).map((key) => {
			return [key, !omit_flags[key]];
		}),
	);
}
