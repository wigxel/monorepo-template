import { Effect } from "effect";
import { UnknownException } from "effect/Cause";
import { DatabaseClient } from "~/config/database";
import { FilterQuery, PaginationQuery } from "~/utils/types";

type QueryErrors = UnknownException | Error;

export interface SearchableRepo<TSearch = unknown> {
	searchByQuery: (
		params: Partial<PaginationQuery & FilterQuery>,
	) => Effect.Effect<TSearch, QueryErrors, DatabaseClient>;
}

export interface Countable {
	count(
		attributes?: Record<string, unknown>,
	): Effect.Effect<number, QueryErrors, DatabaseClient>;
}
