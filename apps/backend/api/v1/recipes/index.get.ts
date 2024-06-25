import { Effect, Layer } from "effect";
import { RecipeRepoLive } from "~/repositories/recipe.repository";
import { findRecipe } from "~/services/recipe.service";
import { SearchServiceLive } from "~/services/search.service";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  return runPromise(
    event,
    Effect.provide(
      findRecipe(),
      Layer.merge(RecipeRepoLive, SearchServiceLive(query)),
    ),
  );
});
