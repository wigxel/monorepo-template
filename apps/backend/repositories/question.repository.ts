import { and, count, eq } from "drizzle-orm";
import { Context, Layer } from "effect";
import { CreateQuestion, UpdateQuestion } from "~/dtos/onboarding.dto";
import {
	extractCount,
	queryEqualMap,
	runDrizzleQuery,
} from "~/libs/query.helpers";
import { question, questionOption } from "~/migrations/schema";
import { Countable } from "~/utils/repo.types";

class QuestionRepository implements Countable {
	count(attributes?: Record<string, unknown>) {
		return runDrizzleQuery((db) => {
			return db
				.select({ count: count() })
				.from(question)
				.where(queryEqualMap(question, attributes));
		}).pipe(extractCount);
	}

	create(data: CreateQuestion) {
		return runDrizzleQuery(async (tx) => {
			return tx.transaction(async (db) => {
				const createQuestion = await db
					.insert(question)
					.values({
						text: data.question,
						type: data.type,
						status: data.status,
					})
					.returning();

				const questionId = createQuestion[0].id;
				const optionsData = data.options.map((e) => ({
					questionId,
					text: e.text,
					image: undefined,
				}));

				await db.insert(questionOption).values(optionsData);

				return db.query.question.findFirst({
					where: eq(question.id, questionId),
					with: {
						options: true,
					},
				});
			});
		});
	}

	/** Gets all questions from the database */
	getAll() {
		return runDrizzleQuery((db) =>
			db.query.question.findMany({
				with: {
					options: true,
				},
			}),
		);
	}

	/** Gets all published questions from the database */
	getForCustomer() {
		return runDrizzleQuery((db) =>
			db.query.question.findMany({
				where: eq(question.status, "PUBLISHED"),
				with: {
					options: true,
				},
			}),
		);
	}

	update(params: { id: string; data: UpdateQuestion }) {
		const {
			options = [],
			question: question_ = undefined,
			...question_data
		} = params.data;

		return runDrizzleQuery((db_) => {
			return db_.transaction(async (db) => {
				await db
					.update(question)
					.set({
						...question_data,
						text: question_,
					})
					.where(eq(question.id, params.id))
					.catch(() => {
						throw new Error(`Error updating Question (id: ${params.id})`);
					});

				await Promise.all(
					options.map((option) =>
						db
							.update(questionOption)
							.set({
								image: option.image,
								text: option.text,
							})
							.where(eq(questionOption.id, option.id))
							.returning()
							.catch(() => {
								throw new Error(
									`Error updating option ${option.text} (Id:${option.id}) `,
								);
							}),
					),
				);

				return db.query.question.findFirst({
					where: eq(question.id, params.id),
					with: {
						options: true,
					},
				});
			});
		});
	}
}

export class QuestionRepo extends Context.Tag("QuestionRepo")<
	QuestionRepo,
	QuestionRepository
>() {}

export const QuestionRepoLayerLive = Layer.succeed(
	QuestionRepo,
	new QuestionRepository(),
);
