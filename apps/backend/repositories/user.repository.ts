import { and, count, eq, like, or } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { Context, Effect, Layer } from "effect";
import { head } from "effect/Array";
import { z } from "zod";
import { User } from "~/dtos/user.dto";
import {
  extractCount,
  queryEqualMap,
  runDrizzleQuery,
} from "~/libs/query.helpers";
import { user } from "~/migrations/schema";
import { Countable, SearchableRepo } from "~/utils/repo.types";
import { FilterQuery, PaginationQuery } from "~/utils/types";

type SelectUserSchema = z.infer<typeof selectUserSchema>;
type CreateUserSchema = z.infer<typeof insertUserSchema>;
const selectUserSchema = createSelectSchema(user);
const insertUserSchema = createInsertSchema(user);

export class UserRepository implements Countable, SearchableRepo {
  count(attributes?: Record<string, unknown>) {
    return runDrizzleQuery((db) => {
      return db
        .select({ count: count() })
        .from(user)
        .where(queryEqualMap(user, attributes));
    }).pipe(extractCount);
  }

  create(data: CreateUserSchema) {
    return runDrizzleQuery((db) => {
      return db
        .insert(user)
        .values({
          firstName: data.firstName,
          lastName: data.lastName,
          password: data.password,
          email: data.email,
        })
        .returning();
    }).pipe(
      Effect.flatMap(head),
      Effect.map((d) => d),
    );
  }

  getUserById(id: string) {
    return runDrizzleQuery((db) => {
      return db.query.user.findFirst({
        where: eq(user.id, id),
      });
    }).pipe(Effect.map((d) => d));
  }

  findFirst(where: Partial<User>) {
    return runDrizzleQuery((db) => {
      return db.select().from(user).where(queryEqualMap(user, where));
    }).pipe(Effect.flatMap(head));
  }

  getUsers() {
    return runDrizzleQuery((db) => db.query.user.findMany()).pipe(
      Effect.map((d) => d as unknown as Array<SelectUserSchema>),
    );
  }

  searchByQuery(query: Partial<PaginationQuery & FilterQuery>) {
    return runDrizzleQuery((db) => {
      return db
        .select({
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          createdAt: user.createdAt,
        })
        .from(user)
        .where(
          or(
            like(user.firstName, `%${query.search}%`),
            like(user.lastName, `%${query.search}%`),
            like(user.email, `%${query.search}%`),
          ),
        )
        .offset(query.pageNumber)
        .limit(query.pageSize);
    }).pipe(Effect.map((e) => e as unknown));
  }
}

export class UserRepo extends Context.Tag("UserRepo")<
  UserRepo,
  UserRepository
>() {}

export const UserRepoLayer = {
  Tag: UserRepo,
  Repo: {
    Live: Layer.succeed(UserRepo, new UserRepository()),
  },
};
