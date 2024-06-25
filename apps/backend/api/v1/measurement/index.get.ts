import { Effect, Layer } from "effect";
import { getMeasurements } from "~/controllers/measurement.controller";
import { MeasureRepoLive } from "~/repositories/measurement.repository";
import { SearchServiceLive } from "~/services/search.service";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  return runPromise(
    event,
    Effect.provide(
      getMeasurements(),
      Layer.merge(MeasureRepoLive, SearchServiceLive(query)),
    ),
  );
});
