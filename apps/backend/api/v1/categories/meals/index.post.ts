import { Effect } from "effect";
import { CategoryRepoLive } from "~/repositories/category.repository";
import { CategoryServiceImpl } from "~/services/category.service";

export default defineEventHandler(async (event) => {
  // Get all the categories a meal can be added.
  return runPromise(
    event,
    Effect.provide(
      CategoryServiceImpl.create(await readBody(event, { strict: true })),
      CategoryRepoLive,
    ),
  );
});
