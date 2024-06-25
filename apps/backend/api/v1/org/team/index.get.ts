import { Effect, Layer } from "effect";
import { TeamRepo } from "~/repositories/team-member.repository";
import {
	SearchServiceLive,
	searchByQueryRepo,
} from "~/services/search.service";

export default defineEventHandler(async (event) => {
	const program = Effect.gen(function* (_) {
		const repo = yield* _(TeamRepo.Tag);
		return yield* searchByQueryRepo(repo);
	});

	return runPromise(
		event,
		Effect.provide(
			program,
			TeamRepo.Live.pipe(
				Layer.provideMerge(SearchServiceLive(getQuery(event))),
			),
		),
	);
});
