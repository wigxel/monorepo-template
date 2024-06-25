import { Effect } from "effect";
import { TeamRepo } from "~/repositories/team-member.repository";

export default defineEventHandler(async (event) => {
	const { id } = getRouterParams(event);

	const program = Effect.gen(function* (_) {
		const repo = yield* _(TeamRepo.Tag);

		const count = yield* repo.count({ id: id });

		if (count === 0) {
			return yield* _(
				Effect.fail(
					createError({
						status: 422,
						message: "Removal failed. Member doesn't exist",
					}),
				),
			);
		}

		const result = yield* repo.update(id, { deleted_at: new Date() });

		if (!result) {
			return yield* _(
				Effect.fail(
					createError({
						status: 422,
						message: "Removal failed. Database update unsuccessful",
					}),
				),
			);
		}

		return {
			message: "Team member removed!",
		};
	});

	return runPromise(event, Effect.provide(program, TeamRepo.Live));
});
