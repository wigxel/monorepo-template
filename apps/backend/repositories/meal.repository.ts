import { count, eq, ilike } from "drizzle-orm";
import { Context, Effect, Layer } from "effect";
import { QueryError } from "~/config/exceptions";
import { CreateMeal } from "~/dtos/meal.dto";
import {
	countWhere,
	deleteWhere,
	extractCount,
	findFirstOrThrow,
	runDrizzleQuery,
} from "~/libs/query.helpers";
import { categoryToMeal, meal } from "~/migrations/schema";
import { Countable, SearchableRepo } from "~/utils/repo.types";
import { FilterQuery, PaginationQuery } from "~/utils/types";

import { safeArray } from "@repo/shared/src/data.helpers";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { map } from "effect/Array";
import { z } from "zod";
import { SelectCategory } from "~/dtos/category.dto";

const selectMealSchema = createSelectSchema(meal);
export type SelectMeal = z.infer<typeof selectMealSchema>;

const createMealSchema = createInsertSchema(meal);
export type CreateMealModel = z.infer<typeof createMealSchema>;

export class MealRepository implements Countable, SearchableRepo {
	count(where: { id?: string } = {}) {
		return countWhere(meal, where);
	}

	create(input: CreateMeal) {
		return Effect.gen(function* (_) {
			const { categories, ...data } = input;

			const item_exists = yield* runDrizzleQuery((db) => {
				return db
					.select({ count: count() })
					.from(meal)
					.where(ilike(meal.name, `%${data.name}%`));
			}).pipe(extractCount);

			if (item_exists > 0) {
				return yield* new QueryError(
					`Meal with name '${data.name}' already exist`,
				);
			}

			return yield* runDrizzleQuery((db) =>
				db.transaction(async (trx) => {
					// Create the meal with categories connected
					const newMeal = await trx
						.insert(meal)
						.values({
							...data,
							createdAt: data.created_at,
							videoUrl: data.video_url,
						})
						.returning();

					const mealId = newMeal[0].id;

					// Connect categories to the meal
					const categoriesConnections = categories.map((id) => ({
						a: id,
						b: mealId,
					}));

					await trx.insert(categoryToMeal).values(categoriesConnections);

					// Retrieve the created meal with included categories
					return MealRepository.flattenRelations(
						await trx.query.meal.findFirst({
							where: eq(meal.id, mealId),
							with: {
								CategoryToMeal: {
									with: {
										Category: true,
									},
								},
							},
						}),
					);
				}),
			);
		});
	}

	searchByQuery(options: FilterQuery & PaginationQuery) {
		return runDrizzleQuery((db) =>
			db.query.meal.findMany({
				where: ilike(meal.name, `%${options.search}%`),
				offset: options.pageNumber,
				limit: options.pageSize,
				with: {
					CategoryToMeal: {
						with: {
							Category: true,
						},
					},
				},
			}),
		).pipe(Effect.map(map(MealRepository.flattenRelations)));
	}

	delete(input: { id: string }) {
		return deleteWhere(meal, { id: input.id });
	}

	findFirstOrThrow(input: { id: string }) {
		return findFirstOrThrow(meal, { id: input.id });
	}

	static flattenRelations<
		T extends { CategoryToMeal: Array<{ Category: SelectCategory }> },
	>(data: T) {
		const { CategoryToMeal, ...rest } = data;

		return {
			...rest,
			categories: safeArray(CategoryToMeal).map((e) => e.Category),
		};
	}
}

export class MealRepo extends Context.Tag("MealRepo")<
	MealRepo,
	MealRepository
>() {}

export const MealRepoLive = Layer.succeed(MealRepo, new MealRepository());
