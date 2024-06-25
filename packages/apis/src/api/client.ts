import { Cause, Either } from "effect";
import { has, is } from "ramda";
import { ApiError, ApiErrors, ValidationError } from "./response-types";

export const resolveUrl = (
  url: string,
  queryParams: Record<string, string> = {},
  pathParams: Record<string, string> = {},
) => {
  let query = new URLSearchParams(queryParams).toString();
  if (query) query = `?${query}`;

  return url.replace(/\{\w*}/g, (key) => pathParams[key.slice(1, -1)]) + query;
};

export const resolveFetchResponse = <T>(
  response: T,
): Either.Either<T, ApiErrors> => {
  const hasError = has("error", response) && response.error === true;
  const hasMessage = has("msg", response);

  const messageIsStr = hasMessage && typeof response?.msg === "string";

  if (Array.isArray(response)) return Either.right(response);

  if (hasError && hasMessage && is(Object, response?.msg))
    return Either.left(new ValidationError(response?.msg));

  if (hasError && hasMessage && messageIsStr)
    return Either.left(
      new ApiError({
        message: response.msg as string,
        error: response.error,
      }),
    );

  if (response === undefined || response === null) {
    return Either.left(
      new Cause.UnknownException(response, "Something went wrong"),
    );
  }

  return Either.right(response);
};
