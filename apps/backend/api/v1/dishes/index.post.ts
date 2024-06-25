import { Console, Effect, Layer } from "effect";
import { defineEventHandler } from "h3";
import { AppLive } from "~/config/app";
import { MealServiceImpl, MealServiceLive } from "~/services/meal.service";

/**
 * @description Create a meal
 */
export default defineEventHandler(async (event) => {
	const program = pipe(
		MealServiceImpl.create(await readBody(event)),
		Effect.map((e) => ({ message: "Meal created successfully", data: e })),
	);

	return runPromise(event, Effect.provide(program, Services));
});

const Services = AppLive.pipe(Layer.provideMerge(MealServiceLive));
