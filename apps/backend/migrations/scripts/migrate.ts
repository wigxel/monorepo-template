import chalk from "chalk";
import "dotenv/config";
import { ConfigProvider, Console, Effect, Exit, Layer } from "effect";
import { AppLive } from "~/config/app";
import { DatabaseResource, NewModelDatabase } from "~/config/database";
import { CategoryRepo } from "~/repositories/category.repository";
import {
	MeasureRepo,
	MeasureRepoLive,
} from "~/repositories/measurement.repository";
import {
	QuestionRepo,
	QuestionRepoLayerLive,
} from "~/repositories/question.repository";
import { TeamRepo } from "~/repositories/team-member.repository";
import {
	IngredientService,
	IngredientServiceLive,
} from "~/services/ingredients.service";

const connectionString = process.env.DB_URL;

if (!connectionString) {
	console.log("\n\n");
	console.log(
		`${chalk.red("→ DB connection required")}\n${chalk.white(
			`Ensure ${chalk.blueBright("`DB_URL`")} is present in environment file`,
		)}`,
	);
	console.log("\n");
	process.exit(0);
}

const seedOrgOwner = Effect.gen(function* (_) {
	const teamMember = yield* TeamRepo.Tag;

	yield* teamMember.create({
		data: {
			first_name: "Joseph",
			last_name: "Owonvwon",
			password:
				"$argon2id$v=19$m=19456,t=2,p=1$4KmqjtSTFuUANlxHA+4Zxg$RXVfFWxe3Md4ZxtdMaz/lWRwsF9eM1eoWzgOerynlPM", // helloman
			email: "joseph.owonwo@gmail.com",
			role: "OWNER",
		},
	});
});

const seedCategories = Effect.gen(function* (_) {
	const categoryRepo = yield* CategoryRepo;
	const queries = [
		"Spicy",
		"Nigerian",
		"Italian",
		"Breakfast",
		"Snacks",
		"Fastfood",
	].map((name) => categoryRepo.create({ name: name }));

	yield* Effect.all(queries);
});

const seedIngredients = Effect.gen(function* (_) {
	const ingredientRepo = yield* IngredientService;

	const ingredients = [
		{ name: "Black Pepper" },
		{ name: "Onion" },
		{ name: "Salt" },
		{ name: "Flour" },
		{ name: "Tomatoes" },
		{ name: "Egusi" },
	];

	yield* Effect.all(
		ingredients.map(({ name }) =>
			ingredientRepo.createIngredient({
				name,
			}),
		),
	);
});

const seedMeasurements = Effect.gen(function* (_) {
	const mRepo = yield* MeasureRepo;
	const measures = [
		{ si_unit: "g", unit: "grams", si_unit_plural: "g", unit_plural: "grams" },
		{
			si_unit: "lt",
			unit: "litre",
			si_unit_plural: "lt",
			unit_plural: "litres",
		},
		{
			si_unit: "pc",
			unit: "piece",
			si_unit_plural: "pcs",
			unit_plural: "pieces",
		},
		{
			si_unit: "tsp",
			unit: "teaspoon",
			si_unit_plural: "tsp",
			unit_plural: "teaspoons",
		},
	];

	yield* Effect.all(measures.map((a) => mRepo.create(a)));
});

const seedQuestions = Effect.gen(function* (_) {
	const save_questions = [
		{
			question: "Do you have any allergy?",
			type: "multiple",
			options: ["Sea food", "Fish", "Egg", "Peanut", "Celery"],
		},
		{
			question: "Are you diabetic?",
			type: "single",
			options: ["Yes", "No"],
		},
	] as const;

	const questionRepo = yield* QuestionRepo;

	yield* Effect.all(
		save_questions.map((e) => {
			return questionRepo.create({
				question: e.question,
				type: e.type,
				options: e.options.map((text) => ({ text: text, image: undefined })),
			});
		}),
	);
});

const startMigration = Effect.gen(function* (_) {
	const { orm } = yield* DatabaseResource;

	return yield* Effect.try(() => {
		return orm.transaction(async (tx) => {
			const TxModelDatabase = Layer.succeed(NewModelDatabase, tx);
			const runSeeds = Effect.all([
				seedCategories,
				seedIngredients,
				seedMeasurements,
				seedOrgOwner,
				seedQuestions,
			]);

			await Effect.runPromise(
				Effect.scoped(
					Effect.provide(
						runSeeds,
						AppLive.pipe(
							Layer.provideMerge(TeamRepo.Live),
							Layer.provideMerge(IngredientServiceLive),
							Layer.provideMerge(MeasureRepoLive),
							Layer.provideMerge(QuestionRepoLayerLive),
							Layer.provideMerge(TxModelDatabase),
						),
					),
				),
			);
		});
	});
}).pipe(
	Effect.tapError((err) =>
		Console.error(`Transaction Rolled back. \nError: ${err.toString()}`),
	),
);

const scopedEffect = Effect.scoped(
	Effect.provide(
		startMigration,
		Layer.setConfigProvider(ConfigProvider.fromEnv()),
	),
);

Effect.runPromiseExit(scopedEffect).then((exit) => {
	exit.pipe(
		Exit.match({
			onSuccess: () => process.exit(0),
			onFailure: () => process.exit(1),
		}),
	);
});
