import { Effect } from "effect";
import { CategoryServiceImpl } from "~/services/category.service";
import { SearchServiceLive } from "~/services/search.service";
import { runPromise } from "~/utils/lib";

export default defineEventHandler(async (event) => {
	const query = getQuery(event);

	// Get all the categories a meal can be added.
	return runPromise(
		event,
		Effect.provide(CategoryServiceImpl.searchByQuery, SearchServiceLive(query)),
	);
});
