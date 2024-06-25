import { drizzle } from "drizzle-orm/postgres-js";
import { Config, Context, Effect } from "effect";
import { TaggedError } from "effect/Data";
import postgres from "postgres";
import * as schema from "../migrations/schema";

const vbb = postgres(process.env?.DB_URL ?? "");

export const drizzleClient = drizzle(vbb, {
	schema,
});

export class DatabaseClient extends Context.Tag("Database")<
	DatabaseClient,
	DrizzlePgDatabase
>() {}

export type DrizzlePgDatabase = typeof drizzleClient;

// --- Resource ---
export interface DatabaseResource {
	readonly orm: DrizzlePgDatabase;
	readonly handler: ReturnType<typeof postgres>;
	readonly close: () => Promise<void>;
}

export const acquire = Effect.gen(function* (_) {
	const DB_URL = yield* Config.string("DB_URL");

	const postgres_instance = postgres(DB_URL);
	const drizzle_client = drizzle(postgres_instance, {
		schema,
	});

	return {
		orm: drizzle_client,
		handler: postgres_instance,
		async close() {
			await postgres_instance.end({ timeout: 5 });
		},
	};
}).pipe(
	Effect.mapError((error) => {
		if (error._tag === "ConfigError") return error;
		return new DatabaseResourceError(error);
	}),
);

export class DatabaseResourceError extends TaggedError("DatabaseResource") {
	constructor(public error: unknown) {
		super();
	}

	toString() {
		return `DatabaseResourceError: ${this.error.toString()}`;
	}
}

export const release = (res: DatabaseResource) =>
	Effect.promise(() => res.close());

export const DatabaseResource = Effect.acquireRelease(acquire, release);
