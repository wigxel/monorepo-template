import { Effect } from "effect";
import { RecipeRepoLive } from "~/repositories/recipe.repository";
import { getFullRecipeDetails } from "~/services/recipe.service";

export default defineEventHandler(async (event) => {
  const query = getRouterParams(event);

  const program = getFullRecipeDetails({
    id: query.id,
  });

  return runPromise(
    event,
    Effect.provide(
      program.pipe(
        Effect.map(({ Meal, RecipeStep, ...data }) => {
          return {
            data: {
              ...data,
              meals: Meal,
              recipes: RecipeStep,
            },
          };
        }),
      ),
      RecipeRepoLive,
    ),
  );
});
