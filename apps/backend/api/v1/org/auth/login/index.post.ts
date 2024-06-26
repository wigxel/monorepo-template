import { Effect } from "effect";
import { z } from "zod";
import { resolveErrorResponse } from "~/libs/response";

import { ValidationError } from "~/config/exceptions";
import { TeamMemberLive } from "~/layers/team";
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

  return runPromise(
    event,
    Effect.provide(Effect.scoped(login({ body })), TeamMemberLive),
  );
});
