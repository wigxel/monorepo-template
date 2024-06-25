import { and, count, eq, isNull } from "drizzle-orm";
import { Context, Effect, Layer } from "effect";
import { head } from "effect/Array";
import { QueryError } from "~/config/exceptions";
import {
  extractCount,
  queryEqualMap,
  runDrizzleQuery,
} from "~/libs/drizzle.helpers";
import { teamMember } from "~/migrations/schema";
import { Countable, SearchableRepo } from "~/utils/repo.types";
import { FilterQuery, PaginationQuery } from "~/utils/types";

export class TeamMemberRepoLiveImpl implements Countable, SearchableRepo {
  count(where?: { id: string }) {
    return runDrizzleQuery((db) => {
      return db
        .select({ count: count() })
        .from(teamMember)
        .where(
          and(queryEqualMap(teamMember, where), isNull(teamMember.deletedAt)),
        )
        .limit(1);
    }).pipe(extractCount);
  }

  create(input) {
    return Effect.gen(function* (_) {
      const { categories, ...data } = input;

      const item_exists = yield* runDrizzleQuery((db) =>
        db
          .select({ count: count() })
          .from(teamMember)
          .where(eq(teamMember.firstName, data.firstName)),
      ).pipe(extractCount);

      if (item_exists > 0) {
        yield* new QueryError(
          `Team member with name '${data.firstName}' already exist`,
        );
      }

      return runDrizzleQuery((db) => {
        return db
          .insert(teamMember)
          .values(data)
          .returning()
          .then((e) => {});
      });
    });
  }

  delete(input: { id: string }) {
    return runDrizzleQuery((db) => {
      return db
        .delete(teamMember)
        .where(and(eq(teamMember.id, input.id), isNull(teamMember.deletedAt)));
    });
  }

  findFirstOrThrow(input: Partial<{ id: string; email: string }>) {
    return runDrizzleQuery((db) =>
      db
        .select()
        .from(teamMember)
        .where(
          and(
            eq(teamMember.id, input.id),
            eq(teamMember.email, input.email ?? null),
            isNull(teamMember.deletedAt),
          ),
        ),
    ).pipe(Effect.flatMap(head));
  }

  searchByQuery(params: Partial<PaginationQuery & FilterQuery>) {
    return runDrizzleQuery((db) => {
      return db.query.teamMember.findMany({
        where: (cols, ops) => {
          const sub_string = `%${params.search}%`;
          return ops.and(
            ops.or(
              ops.ilike(cols.firstName, sub_string),
              ops.like(cols.lastName, sub_string),
              ops.like(cols.email, sub_string),
            ),
            ops.isNull(cols.deletedAt),
          );
        },
        offset: params.pageNumber,
        limit: params.pageSize,
      });
    });
  }

  update(id: string, { deleted_at }: Partial<{ deleted_at: Date }>) {
    return runDrizzleQuery((db) =>
      db
        .update(teamMember)
        .set({
          deletedAt: deleted_at?.toISOString?.() ?? null,
        })
        .where(eq(teamMember.id, id)),
    );
  }
}

export class TeamMemberTag extends Context.Tag("TeamMemberRepository")<
  TeamMemberTag,
  TeamMemberRepoLiveImpl
>() {}

export const TeamRepo = {
  Tag: TeamMemberTag,
  Live: Layer.succeed(TeamMemberTag, new TeamMemberRepoLiveImpl()),
};
