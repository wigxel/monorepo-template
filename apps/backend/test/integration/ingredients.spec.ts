import { Context, Effect, Layer } from "effect";
import {
  createIngredient,
  getAllIngredients,
} from "~/controllers/ingredient.controller";
import { FilterService } from "~/services/filter.service";
import { IngredientService } from "~/services/ingredients.service";
import { SearchServiceLive } from "~/services/search.service";
import { overwriteImpl } from "../helpers/context";

const overwrite = overwriteImpl(
  IngredientService.of({
    createIngredient: () =>
      Effect.succeed({ name: "Spoon", id: 1, recipeId: null }),

    findIngredientByQuery: Effect.gen(function* (_) {
      const filter = yield* _(FilterService);
      const meta = { current_page: 1, total: 2, per_page: 25 };

      if (!filter.search)
        return { data: [{ name: "Spoon", id: 1, recipeId: null }], meta };

      return {
        data: [
          { name: "Knig", id: 1, recipeId: null },
          { name: "Onion", id: 2, recipeId: null },
        ],
        meta,
      };
    }),
  }),
);

describe("get all ingredients", () => {
  function setup(params?: { searchParams: Record<string, unknown> }) {
    const { searchParams: query = {} } = params ?? {};

    return Effect.runPromise(
      Effect.provide(
        getAllIngredients,
        Layer.succeed(IngredientService, overwrite()).pipe(
          Layer.provideMerge(SearchServiceLive(query)),
        ),
      ),
    );
  }

  test("user can all ingredients", async () => {
    const response = await setup();

    expect(response).toMatchInlineSnapshot(`
      {
        "data": [
          {
            "id": 1,
            "name": "Spoon",
            "recipeId": null,
          },
        ],
        "meta": {
          "current_page": 1,
          "per_page": 25,
          "total": 2,
        },
      }
    `);
  });

  test("user can search for an ingredient", async () => {
    const response = await setup({ searchParams: { search: "anything" } });

    expect(response).toBePaginated();
    expect(response).toMatchInlineSnapshot(`
      {
        "data": [
          {
            "id": 1,
            "name": "Knig",
            "recipeId": null,
          },
          {
            "id": 2,
            "name": "Onion",
            "recipeId": null,
          },
        ],
        "meta": {
          "current_page": 1,
          "per_page": 25,
          "total": 2,
        },
      }
    `);
  });
});

describe("create ingredients", () => {
  function setup(params?: { body: { name: string } }) {
    const ingredientImpl = overwrite({
      createIngredient: () =>
        Effect.succeed({
          id: 1,
          name: params.body.name,
          recipeId: null,
        }),
    });

    return Effect.runPromise(
      Effect.provide(
        createIngredient(params.body),
        Context.empty().pipe(Context.add(IngredientService, ingredientImpl)),
      ),
    );
  }

  test("user can add an ingredient", async () => {
    const response = await setup({ body: { name: "Bike" } });

    expect(response).toMatchInlineSnapshot(`
      {
        "id": 1,
        "name": "Bike",
        "recipeId": null,
      }
    `);
  });

  test.fails("should fail when name isn't present", async () => {
    await setup({ body: { name: "" } });
  });
});
