import { Effect } from "effect";
import { AuthLive } from "~/layers/auth-user";
import { getUser } from "~/services/user.service";

export default defineEventHandler((event) => {
	const userId = getRouterParam(event, "userId");

	const effect = pipe(
		getUser(userId),
		Effect.map((user) => {
			return {
				success: true,
				message: "User fetched successfully",
				data: user,
			};
		}),
	);

	return runPromise(event, Effect.scoped(Effect.provide(effect, AuthLive)));
});
