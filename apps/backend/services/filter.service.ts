import { Context, Layer } from "effect";
import { isEmpty } from "effect/String";

export class FilterService extends Context.Tag("FilterService")<
  FilterService,
  { search: string }
>() {}

export const FilterImpl = (query?: Record<string, unknown>) => {
  const search_str = (query?.search as string) ?? "";

  return Layer.succeed(FilterService, {
    search: isEmpty(search_str) ? "" : search_str,
  });
};
