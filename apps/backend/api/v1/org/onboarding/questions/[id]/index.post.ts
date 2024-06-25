import { Effect } from "effect";
import { Org, context } from "~/services/onboarding.service";

export default eventHandler(async (event) => {
  const params = getRouterParams(event);
  const body = await readBody(event);

  return runPromise(
    event,
    Effect.provide(
      Org.updateQuestion({ id: params.id, data: body }).pipe(
        Effect.map((e) => ({ message: "Update successful", data: e })),
      ),
      context,
    ),
  );
});
