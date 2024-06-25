import { Effect } from "effect";
import { UnknownException } from "effect/Cause";
import { NewModelDatabase } from "~/config/database";
import { FilterQuery, PaginationQuery } from "~/utils/types";

type QueryErrors = UnknownException | Error;

export interface SearchableRepo<TSearch = unknown> {
	searchByQuery: (
		params: Partial<PaginationQuery & FilterQuery>,
	) => Effect.Effect<TSearch, QueryErrors, NewModelDatabase>;
}

export interface Countable {
	count(
		attributes?: Record<string, unknown>,
	): Effect.Effect<number, QueryErrors, NewModelDatabase>;
}
