import { safeObj } from "@repo/shared/src/data.helpers";
import { and, count, eq } from "drizzle-orm";
import { PgTableWithColumns, TableConfig } from "drizzle-orm/pg-core";
import { Console, Effect, Option } from "effect";
import { head } from "effect/Array";
import { UnknownException } from "effect/Cause";
import { is } from "ramda";
import { DrizzlePgDatabase, DatabaseClient } from "~/config/database";
import { QueryError } from "~/config/exceptions";

export const resolveQueryError = (err: unknown) => {
	if (typeof err === "string") return new Error(err);
	if (err instanceof Error) return err;
	if (is(Object, err) && "message" in err) {
		return new Error(err.message);
	}

	return new Error("Unknown error");
};

export function tryQuery<TValue>(fn: (a: unknown) => Promise<TValue>) {
	return Effect.tryPromise<TValue, UnknownException | QueryError>({
		try: fn,
		catch(err) {
			const error = resolveQueryError(err);

			if (error.message.includes("Can't reach database server"))
				return new QueryError("Can't establish connection with database");

			return new UnknownException(error, error.message);
		},
	});
}

export const notNil = <T>(e: T) =>
	e === null ? Effect.fail(new Error("Record not found")) : Effect.succeed(e);

export function tryQueryOption<TValue>(fn: (a: unknown) => Promise<TValue>) {
	return tryQuery(fn).pipe(Effect.flatMap(Option.fromNullable));
}

export const extractCount = <A extends { count: number }[]>(
	effect: Effect.Effect<A>,
) => {
	return pipe(
		effect,
		Effect.flatMap(head),
		Effect.map((e) => e.count),
	);
};

export function queryEqualMap<T extends TableConfig>(
	model: PgTableWithColumns<T>,
	where?: Record<string, unknown>,
) {
	const pairs = Object.entries(safeObj(where))
		.filter(([column]) => model[column])
		.map(([column, compareValue]) => {
			return eq(model[column], compareValue);
		});

	if (pairs.length < 1) return undefined;
	if (pairs.length === 1) return pairs[0] ?? undefined;
	return and(...pairs);
}

export function runDrizzleQuery<T>(fn: (a: DrizzlePgDatabase) => Promise<T>) {
	return DatabaseClient.pipe(
		Effect.flatMap((db) => tryQuery(() => fn(db))),
		Effect.map((a) => a as T),
	);
}

export function countWhere<T extends TableConfig>(
	table: PgTableWithColumns<T>,
	where?: Partial<Record<keyof T["columns"], unknown>>,
) {
	return runDrizzleQuery((db) => {
		return db
			.select({ count: count() })
			.from(table)
			.where(queryEqualMap(table, where));
	}).pipe(
		Effect.tap((v) =>
			Console.log(`What now?. where(${JSON.stringify(where)})`, v),
		),
		extractCount,
	);
}

export function findFirstOrThrow<T extends TableConfig>(
	table: PgTableWithColumns<T>,
	where?: Partial<Record<keyof T["columns"], unknown>>,
) {
	return runDrizzleQuery((db) => {
		return db
			.select({ count: count() })
			.from(table)
			.where(queryEqualMap(table, where));
	}).pipe(Effect.flatMap(notNil));
}

export function deleteWhere<T extends TableConfig>(
	table: PgTableWithColumns<T>,
	where?: Partial<Record<keyof T["columns"], unknown>>,
) {
	return runDrizzleQuery((db) => {
		return db.delete(table).where(queryEqualMap(table, where));
	});
}
