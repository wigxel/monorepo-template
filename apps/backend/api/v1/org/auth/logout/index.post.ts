import { Effect } from "effect";
import { defineEventHandler } from "h3";
import { TeamMemberLive } from "~/layers/team";
import { getBearerToken } from "~/libs/session.helpers";
import { logout } from "~/services/auth.service";

export default defineEventHandler(async (event) => {
  const access_token = getBearerToken(getHeaders(event));

  return runPromise(
    event,
    Effect.provide(logout({ access_token }), TeamMemberLive),
  );
});
