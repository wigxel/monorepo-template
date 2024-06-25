import { safeObj } from "@repo/shared/src/data.helpers";
import { and, count, eq } from "drizzle-orm";
import type { PgTableWithColumns, TableConfig } from "drizzle-orm/pg-core";
import { Effect, Layer, pipe } from "effect";
import { head } from "effect/Array";
import { isUndefined } from "effect/Predicate";
import { DrizzlePgDatabase, DatabaseClient } from "~/config/database";
import { notNil, tryQuery } from "~/libs/query.helpers";

export const extractCount = <A extends { count: number }[], E, R>(
  effect: Effect.Effect<A, E, R>,
) => {
  return pipe(
    effect,
    Effect.flatMap(head),
    Effect.map((e) => e.count),
  );
};

export function queryEqualMap<T extends TableConfig>(
  model: PgTableWithColumns<T>,
  where?: InferWhereQuery<T>,
) {
  const pairs = Object.entries(safeObj(where))
    .filter(([column, value]) => model[column] && !isUndefined(value))
    .map(([column, newValue]) => {
      return eq(model[column], newValue);
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
  where?: InferWhereQuery<T>,
) {
  return runDrizzleQuery((db) => {
    return db
      .select({ count: count() })
      .from(table)
      .where(queryEqualMap(table, where));
  }).pipe((e) => extractCount(e));
}

export function findFirstOrThrow<T extends TableConfig>(
  table: PgTableWithColumns<T>,
  where?: InferWhereQuery<T>,
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
  where?: InferWhereQuery<T>,
) {
  return runDrizzleQuery((db) => {
    return db.delete(table).where(queryEqualMap(table, where));
  });
}

export type InferWhereQuery<T> = T extends PgTableWithColumns<infer R>
  ? Partial<Record<keyof R["columns"], unknown>>
  : T extends TableConfig
    ? Partial<Record<keyof T["columns"], unknown>>
    : Partial<Record<string, unknown>>;

export function startTransaction<A, E, R, ROut, E2, RIn>(
  effect: Effect.Effect<A, E, R>,
  requirements: Layer.Layer<ROut, E2, RIn>,
) {
  return runDrizzleQuery((db) => {
    return db.transaction((tx) => {
      const TxModelDatabase = Layer.succeed(DatabaseClient, tx);
      const requirements_ = Layer.merge(requirements, TxModelDatabase);

      const program = Effect.provide(effect, requirements_);

      // @ts-expect-error Battle for another day
      return Effect.runPromise(program);
    });
  });
}
