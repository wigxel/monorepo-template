import { count, eq, ilike, or } from "drizzle-orm";
import { Context, Effect, Layer } from "effect";
import { QueryError } from "~/config/exceptions";
import { NewMeasureInterface } from "~/dtos/measurement.dto";
import { extractCount, runDrizzleQuery } from "~/libs/query.helpers";
import { measurement } from "~/migrations/schema";
import { FilterQuery, PaginationQuery } from "~/utils/types";

export class MeasureRepository {
	create(data: NewMeasureInterface) {
		return Effect.gen(function* (_) {
			const item_exists = yield* runDrizzleQuery((db) => {
				return db
					.select({ count: count() })
					.from(measurement)
					.where(
						or(
							eq(measurement.unit, data.unit),
							eq(measurement.siUnit, data.si_unit),
						),
					);
			}).pipe(extractCount);

			if (item_exists > 0) {
				yield* new QueryError(
					`Ingredient '${data.unit}' or '${data.si_unit}' already exist`,
				);
			}

			return yield* runDrizzleQuery((db) =>
				db
					.insert(measurement)
					.values({
						...data,
						siUnit: data.si_unit,
						siUnitPlural: data.si_unit_plural,
						unitPlural: data.unit_plural,
					})
					.returning(),
			);
		});
	}

	searchByQuery(query: PaginationQuery & FilterQuery) {
		return runDrizzleQuery((db) => {
			return db.query.measurement.findMany({
				where: or(
					ilike(measurement.unit, `%${query.search}%`),
					ilike(measurement.siUnit, `%${query.search}%`),
				),
				offset: query.pageNumber,
				limit: query.pageSize,
			});
		});
	}
}

export class MeasureRepo extends Context.Tag("IngredientService")<
	MeasureRepo,
	MeasureRepository
>() {}

export const MeasureRepoLive = Layer.succeed(
	MeasureRepo,
	new MeasureRepository(),
);
