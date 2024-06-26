import { Effect, Layer } from "effect";
import { DatabaseResource, DatabaseClient } from "~/config/database";

/* --------  Drizzle Database Context -------- */
export const DatabaseLive = DatabaseResource.pipe(
  Effect.map((resource) => {
    return Layer.succeed(DatabaseClient, resource.orm);
  }),
  Layer.unwrapEffect,
);
