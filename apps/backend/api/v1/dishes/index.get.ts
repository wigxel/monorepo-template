import { Effect, Layer } from "effect";
import { MealRepoLive } from "~/repositories/meal.repository";
import { MealServiceImpl } from "~/services/meal.service";
import { SearchServiceLive } from "~/services/search.service";

export default defineEventHandler(async (event) => {
  return runPromise(
    event,
    Effect.provide(
      MealServiceImpl.searchByQuery,
      Layer.merge(SearchServiceLive(getQuery(event)), MealRepoLive),
    ),
  );
});
