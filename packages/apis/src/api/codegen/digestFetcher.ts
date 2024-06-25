import { resolveUrl } from "../client";
import { makeFetch } from "../event-driven-request";
import { DigestContext } from "./digestContext";

export type ErrorWrapper<TError> =
  | TError
  | { status: "unknown"; payload: string };

export type DigestFetcherOptions<TBody, THeaders, TQueryParams, TPathParams> = {
  url: string;
  method: string;
  body?: TBody;
  headers?: THeaders;
  queryParams?: TQueryParams;
  pathParams?: TPathParams;
  signal?: AbortSignal;
} & DigestContext["fetcherOptions"];

export async function digestFetch<
  TData,
  TError,
  TBody extends Record<string, unknown> | FormData | undefined | null,
  THeaders extends {},
  TQueryParams extends {},
  TPathParams extends {},
>(
  params: DigestFetcherOptions<TBody, THeaders, TQueryParams, TPathParams>,
): Promise<TData> {
  const { headers, url, queryParams, pathParams, ...REST_PARAMS } = params;

  const fetchConfig = {
    ...REST_PARAMS,
    url: resolveUrl(url, queryParams, pathParams),
    query: queryParams,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    } satisfies HeadersInit,
  };

  return (await makeFetch(fetchConfig)) as Promise<TData>;
}
