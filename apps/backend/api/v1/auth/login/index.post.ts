import { Effect, Layer } from "effect";
import { z } from "zod";
import { resolveErrorResponse } from "~/libs/response";

import { AppLive } from "~/config/app";
import { ValidationError } from "~/config/exceptions";
import { CustomerLive } from "~/layers/customer";
import { login } from "~/services/auth.service";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export default defineEventHandler(async (event) => {
  const result = await readValidatedBody(event, schema.safeParse);

  if (result.success === false) {
    return resolveErrorResponse(event)(new ValidationError(result));
  }

  const body = result.data as Required<typeof result.data>;
  const requirements = AppLive.pipe(Layer.provideMerge(CustomerLive));
  const program = login({ body });

  return runPromise(
    event,
    Effect.scoped(Effect.provide(program, requirements)),
  );
});
