import { Effect } from "effect";
import { omit } from "ramda";
import { TeamMember } from "~/dtos/user.dto";
import { TeamMemberLive } from "~/layers/team";
import { getAuthUser, getBearerToken } from "~/libs/session.helpers";

export default defineEventHandler((event) => {
	const token = getBearerToken(getHeaders(event));

	const program = getAuthUser({ token }).pipe(
		Effect.map((user: TeamMember) => {
			return {
				data: omit(["password", "createdAt", "updatedAt"], user),
			};
		}),
	);

	return runPromise(event, Effect.provide(program, TeamMemberLive));
});
