import { Effect } from "effect";
import { Org, context } from "~/services/onboarding.service";

export default defineEventHandler(async (event) => {
  const promise = Org.getOnboardingQuestions().pipe(
    Effect.map((data) => ({ data })),
  );

  return runPromise(event, Effect.provide(promise, context));
});
