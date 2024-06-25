import { Effect } from "effect";
import { Customer, context } from "~/services/onboarding.service";

export default defineEventHandler(async (event) => {
  const promise = Customer.getOnboardingQuestions().pipe(
    Effect.map((data) => ({ data })),
  );

  return runPromise(event, Effect.provide(promise, context));
});
