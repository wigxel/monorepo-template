import { Effect, Layer } from "effect";
import { DatabaseResource, NewModelDatabase } from "~/config/database";

/* --------  Drizzle Database Context -------- */
export const DatabaseLive = DatabaseResource.pipe(
	Effect.map((resource) => {
		return Layer.succeed(NewModelDatabase, resource.orm);
	}),
	Layer.unwrapEffect,
);
