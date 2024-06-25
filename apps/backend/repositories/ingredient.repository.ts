import { like, or } from "drizzle-orm";
import { Context, Effect, Layer } from "effect";
import { CreateIngredient } from "~/dtos/ingredients.dto";
import { countWhere, runDrizzleQuery } from "~/libs/query.helpers";
import { ingredient } from "~/migrations/schema";
import { Countable, SearchableRepo } from "~/utils/repo.types";
import { FilterQuery, PaginationQuery } from "~/utils/types";

export class IngredientRepository implements SearchableRepo, Countable {
	count() {
		return countWhere(ingredient);
	}

	create(data: CreateIngredient) {
		return Effect.gen(function* (_) {
			const item_exists = yield* countWhere(ingredient, { name: data.name });

			if (item_exists > 0) {
				throw new Error(`Ingredient '${data.name}' already exist`);
			}

			return yield* runDrizzleQuery((db) => {
				return db
					.insert(ingredient)
					.values({
						name: data.name,
					})
					.returning();
			});
		});
	}

	searchByQuery(query: PaginationQuery & FilterQuery) {
		return runDrizzleQuery((db) => {
			return db.query.ingredient.findMany({
				where: or(like(ingredient.name, `%${query.search}%`)),
				offset: query.pageNumber,
				limit: query.pageSize,
			});
		});
	}
}

export class IngredientRepo extends Context.Tag("IngredientRepo")<
	IngredientRepo,
	IngredientRepository
>() {}

export const IngredientRepoLive = Layer.succeed(
	IngredientRepo,
	new IngredientRepository(),
);
