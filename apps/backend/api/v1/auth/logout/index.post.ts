import { Effect } from "effect";
import { getBearerToken } from "~/libs/session.helpers";

import { CustomerLive } from "~/layers/customer";
import { logout } from "~/services/auth.service";

export default defineEventHandler(async (event) => {
	const access_token = getBearerToken(getHeaders(event));

	return runPromise(
		event,
		Effect.provide(logout({ access_token }), CustomerLive),
	);
});
