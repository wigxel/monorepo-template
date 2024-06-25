import { Effect, Layer, identity } from "effect";
import { DatabaseLive } from "~/layers/database";
import { TeamMemberLive } from "~/layers/team";
import { getBearerToken, validateSession } from "~/libs/session.helpers";

const requirements = DatabaseLive.pipe(Layer.provideMerge(TeamMemberLive));

export default defineEventHandler(async (event) => {
	const { pathname } = getRequestURL(event);

	// protect all /org endpoints except /org/auth
	if (pathname.includes("/org/") && !pathname.includes("/org/auth")) {
		const token = getBearerToken(getHeaders(event));

		const program = Effect.scoped(
			Effect.provide(validateSession(token), requirements),
		);

		const response = await Effect.runPromise(
			program.pipe(
				Effect.match({
					onSuccess: identity,
					onFailure: (cause) => {
						return createError({
							status: 401,
							statusMessage: "Unauthorized",
							message: cause.toString(),
						});
					},
				}),
			),
		);

		if (response instanceof Error) throw response;
	}
});
