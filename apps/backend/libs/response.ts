import { Match } from "effect";
// @ts-expect-error
import { H3Event } from "h3";

export function resolveErrorResponse<TEvent extends H3Event<unknown>>(
	event: TEvent,
) {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	return (error: any) => {
		return pipe(
			Match.value(error),
			Match.tag("ValidationError", (validation_err) => {
				setResponseStatus(event, 422);
				return validation_err.toJSON();
			}),
			Match.orElse((unknown_err) => unknown_err),
		);
	};
}
