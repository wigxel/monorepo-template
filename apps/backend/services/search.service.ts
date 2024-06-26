import { Effect, Layer } from "effect";
import { InferEffectResult } from "~/contexts/effect.util";
import { Countable, SearchableRepo } from "~/utils/repo.types";
import { FilterImpl, FilterService } from "./filter.service";
import { PaginationImpl, PaginationService } from "./pagination.service";

export function SearchServiceLive(query: Record<string, unknown>) {
  return Layer.merge(PaginationImpl(query), FilterImpl(query));
}

interface QueryRepo extends Countable, SearchableRepo {}

export function searchByQueryRepo<TRepo extends QueryRepo>(repo: TRepo) {
  type ResolvedValue = InferEffectResult<TRepo["searchByQuery"]>;

  return Effect.gen(function* (_) {
    const filter = yield* _(FilterService);
    const pagination = yield* _(PaginationService);

    yield* _(
      Effect.logDebug(
        `searchByQuery:: Search(${filter.search}), Cursor(${pagination.query.pageNumber}), Limit(${pagination.query.pageSize})`,
      ),
    );

    const [total, data] = yield* _(
      Effect.all([
        repo.count(),
        repo.searchByQuery({
          search: filter.search,
          ...pagination.query,
        }),
      ]),
    );

    return {
      data: data as ResolvedValue,
      meta: {
        ...pagination.meta,
        total,
      },
    };
  });
}
