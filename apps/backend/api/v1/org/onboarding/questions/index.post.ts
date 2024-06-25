import { Effect } from "effect";
import { Org, context } from "~/services/onboarding.service";

export default eventHandler(async (event) => {
  const body = await readBody(event);

  return runPromise(
    event,
    Effect.provide(
      pipe(
        Org.createQuestion(body),
        Effect.map((data) => ({ message: "Question created", data })),
      ),
      context,
    ),
  );
});
