import { count, eq, ilike, inArray } from "drizzle-orm";
import { Context, Effect, Layer } from "effect";
import { head } from "effect/Array";
import { UnknownException } from "effect/Cause";
import { QueryError } from "~/config/exceptions";
import { extractCount, notNil, runDrizzleQuery } from "~/libs/query.helpers";
import { category } from "~/migrations/schema";
import { Countable, SearchableRepo } from "~/utils/repo.types";
import { FilterQuery, PaginationQuery } from "~/utils/types";

export class CategoryRepository implements Countable, SearchableRepo {
  count() {
    return pipe(
      runDrizzleQuery((db) => {
        return db.select({ count: count() }).from(category);
      }),
      extractCount,
    );
  }

  create(data: { name: string }) {
    return Effect.gen(function* (_) {
      const item_exists = yield* runDrizzleQuery((db) =>
        db
          .select({ count: count() })
          .from(category)
          .where(eq(category.label, data.name)),
      ).pipe(extractCount);

      if (item_exists > 0) {
        return yield* new QueryError(`Category '${data.name}' already exist`);
      }

      return yield* _(
        runDrizzleQuery((db) => {
          return db.insert(category).values({ label: data.name }).returning();
        }),
        Effect.flatMap(head),
      );
    });
  }

  searchByQuery(query: PaginationQuery & FilterQuery) {
    return runDrizzleQuery((db) => {
      return db
        .select()
        .from(category)
        .where(ilike(category.label, `%${query.search}%`))
        .offset(query.pageNumber)
        .limit(query.pageSize);
    });
  }

  delete(input: { id: number }) {
    return runDrizzleQuery((db) =>
      db.delete(category).where(eq(category.id, input.id)).returning(),
    );
  }

  findFirstOrThrow(input: { id: number }) {
    return runDrizzleQuery(async (db) => {
      return db.query.category.findFirst({
        where: eq(category.id, input.id),
      });
    }).pipe(
      Effect.flatMap(notNil),
      Effect.mapError(
        (err) =>
          new UnknownException(
            err,
            `Category with \`${input.id}\` doesn't exist`,
          ),
      ),
    );
  }

  findMany(ids: number[]) {
    return runDrizzleQuery((db) => {
      return db.select().from(category).where(inArray(category.id, ids));
    });
  }
}

export class CategoryRepo extends Context.Tag("CategoryRepo")<
  CategoryRepo,
  CategoryRepository
>() {}

export const CategoryRepoLive = Layer.succeed(
  CategoryRepo,
  new CategoryRepository(),
);
