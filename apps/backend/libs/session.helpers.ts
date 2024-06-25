import { Effect, Either } from "effect";
import type { HTTPHeaderName } from "h3";
import { Session } from "~/layers/session";

export function getBearerToken(
	headers: Partial<Record<HTTPHeaderName, string>>,
) {
	const access_token = (headers?.authorization ?? "").split(" ")[1];
	return access_token ?? "";
}

export function getAuthUser(params: { token: string }) {
	return Effect.gen(function* (_) {
		const session = yield* Session;
		const data = yield* _(validateSession(params.token));
		const user = yield* session.getUser({ id: data.user.id });

		return user;
	});
}

export function validateSession(token: string) {
	return Effect.gen(function* (_) {
		const session = yield* Session;

		yield* _(Effect.logDebug(`Validating Token: ${token}`));
		const status = yield* session.validate(token);

		yield* _(Effect.logDebug(`Validation Status: ${status._tag}`));
		return yield* _(
			status.pipe(Either.mapLeft(() => new Error("Access denied"))),
		);
	});
}
