import { Effect, Layer } from "effect";
import { LogDebugLayer } from "~/config/logger";
import { QuestionSchema, UpdateQuestionSchema } from "~/dtos/onboarding.dto";
import {
	QuestionRepo,
	QuestionRepoLayerLive,
} from "~/repositories/question.repository";
import { validateZod } from "~/utils/lib";

export const Customer = {
	getOnboardingQuestions() {
		return Effect.gen(function* (_) {
			const repo = yield* QuestionRepo;

			return yield* _(
				pipe(
					repo.getForCustomer(),
					Effect.tapError((err) => Effect.logFatal(err.message)),
					Effect.mapError(
						() => new Error("Failed to fetch onboarding questions"),
					),
				),
			);
		});
	},
};

export const Org = {
	createQuestion(input: unknown) {
		return Effect.gen(function* (_) {
			const repo = yield* QuestionRepo;

			return yield* _(
				pipe(
					validateZod(() => QuestionSchema.strict().safeParse(input)),
					Effect.flatMap((data) => repo.create(data)),
				),
			);
		});
	},

	updateQuestion(input: { id: string; data: Record<string, unknown> }) {
		return Effect.gen(function* (_) {
			const repo = yield* QuestionRepo;
			yield* _(Effect.logDebug("Validating data"));
			const data = yield* validateZod(() =>
				UpdateQuestionSchema.safeParse(input.data),
			);
			yield* Effect.logDebug("Executing Update Query");
			return yield* repo.update({ id: input.id, data });
		});
	},

	getOnboardingQuestions() {
		return Effect.gen(function* (_) {
			const repo = yield* QuestionRepo;

			return yield* _(
				pipe(
					repo.getAll(),
					Effect.tapError((err) => Effect.logFatal(err.message)),
					Effect.mapError(
						() => new Error("Failed to fetch onboarding questions"),
					),
				),
			);
		});
	},
};

export const context = LogDebugLayer.pipe(
	Layer.provideMerge(QuestionRepoLayerLive),
);
