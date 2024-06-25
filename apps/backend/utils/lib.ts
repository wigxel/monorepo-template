import { Console, Effect, flow } from "effect";
import { pipe } from "effect/Function";
// @ts-expect-error
import { H3Event } from "h3";
import { is, tap } from "ramda";
import { SafeParseReturnType } from "zod";
import { AppLive } from "~/config/app";
import { ValidationError } from "~/config/exceptions";
import { InferRequirements } from "~/contexts/effect.util";
import { resolveErrorResponse } from "~/libs/response";

export { safeNum, safeStr } from "@repo/shared/src/data.helpers";

export { pipe } from "effect/Function";

export const resolveError = (err: unknown) => {
	if (typeof err === "string") return new Error(err);
	if (err instanceof Error) return err;
	if (is(Object, err) && "message" in err) {
		return Error(err.message);
	}

	return new Error("Unknown error");
};

export const runPromise = <
	A extends Record<string, unknown>,
	E,
	R extends InferRequirements<typeof AppLive>,
	TEvent extends H3Event<unknown>,
>(
	event: TEvent,
	effect: Effect.Effect<A, E, R>,
) => {
	const program = effect as Effect.Effect<
		A,
		E,
		InferRequirements<typeof AppLive>
	>;

	return Effect.runPromise(
		Effect.scoped(
			Effect.provide(
				program.pipe(
					Effect.tapError((reason) => Effect.logDebug("RequestError", reason)),
					Effect.match({
						onSuccess: (d) => d as A,
						onFailure: resolveErrorResponse(event),
					}),
				),
				AppLive,
			),
		),
	);
};

export function validateZod<TSuccess>(
	fn: () =>
		| SafeParseReturnType<TSuccess, unknown>
		| Promise<SafeParseReturnType<TSuccess, unknown>>,
	option?: { failureMessage?: string },
) {
	return pipe(
		Effect.tryPromise(() => Promise.resolve(fn())),
		Effect.flatMap((result) => {
			if (result.success === false) {
				return new ValidationError(result, option?.failureMessage);
			}
			return Effect.succeed(result.data as TSuccess);
		}),
	);
}

export const debugPipeline = flow(
	Effect.tap((v) => Console.log("Succeed", v)),
	Effect.tapError((v) => Console.error("Error", v)),
);
