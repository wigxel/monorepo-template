import { Context, Effect } from "effect";
import { createMeasurement } from "~/controllers/measurement.controller";
import {
  MeasureRepo,
  MeasureRepository,
} from "~/repositories/measurement.repository";

export default defineEventHandler(async (event) => {
  return runPromise(
    event,
    Effect.provide(
      pipe(
        createMeasurement(await readBody(event)),
        Effect.map((result) => {
          return { message: "Measurement created", data: result };
        }),
      ),
      Context.empty().pipe(Context.add(MeasureRepo, new MeasureRepository())),
    ),
  );
});
