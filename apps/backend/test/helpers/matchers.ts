import { z } from "zod";

interface CustomMatchers<R = unknown> {
  toBePaginated: typeof toBePaginated;
}

declare module "vitest" {
  //  @ts-expect-error
  interface Assertion<T = unknown> extends CustomMatchers<T> {}
  // interface AsymmetricMatchersContaining extends CustomMatchers {}
}

interface MatcherResult {
  pass: boolean;
  message: () => string;
  // If you pass these, they will automatically appear inside a diff when
  // the matcher does not pass, so you don't need to print the diff yourself
  actual?: unknown;
  expected?: unknown;
}

function toBePaginated(received: unknown = undefined): MatcherResult {
  const schema = z.object({
    data: z.array(z.unknown()),
    meta: z.object({
      current_page: z.number(),
      per_page: z.number(),
    }),
  });

  const result = schema.safeParse(received);
  const serialized_response = JSON.stringify(received, null, 2);

  return {
    pass: result.success,
    message: () =>
      `expected ${
        this.isNot ? "no" : ""
      } Paginated response, but got: \n${serialized_response}`,
  };
}

expect.extend({
  toBePaginated: toBePaginated,
});
