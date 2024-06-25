import { Cause, Match, Option, pipe } from "effect";
import { UnknownException } from "effect/Cause";
import { isString } from "effect/String";
import { FetchError } from "ofetch";
import { ApiError, type ApiErrors } from "./response-types";

function tagFetchErrorByStatus(error: FetchError) {
  const status = resolveErrorStatusCode(error) ?? 400;

  if (status === 404)
    return new ApiError({ message: "404: Resource not found", error: error });

  if (status === 401) {
    return new ApiError({
      message: "Unable to process request. You're unauthorized",
      error: error,
    });
  }

  if (status === 403) {
    return new ApiError({
      message: "You do not have permission to perform this operation",
      error: error,
    });
  }

  if ((status >= 400 && status < 500) || (status >= 500 && status <= 599))
    return new ApiError({
      message: `[${status}] Unable to complete request`,
      error: error,
    });

  function resolveErrorStatusCode(err: FetchError) {
    return err instanceof FetchError ? err.status : null;
  }
}

export function resolveUntaggedError(error: unknown): ApiErrors {
  const reason_for_failure = guessErrorMessage(error);

  if (error instanceof FetchError) {
    const match = tagFetchErrorByStatus(error);
    if (match) return match;
  }

  return pipe(
    reason_for_failure,
    Option.map((message) => {
      return message.includes("<no response>")
        ? "Something new wrong. Server didn't respond"
        : message;
    }),
    Option.getOrElse(() => "An unexpected error occurred"),
    (message) => new UnknownException(error, message),
  );

  function guessErrorMessage(err: unknown) {
    // @ts-expect-error
    const message = err?.data?.message || err?.message;
    if (isString(message)) return Option.some(message);

    return Option.none();
  }
}

export function defineErrorMessageResolver(config: {
  handleUnresolvedErrorType: (err: ApiErrors) => string;
}) {
  return pipe(
    Match.type<ApiErrors | Cause.UnknownException>(),
    Match.tag("ApiError", (data) => data.message),
    Match.tag("ValidationError", (data) =>
      Object.values(data.messages).join(", "),
    ),
    Match.tag("UnknownException", (data) => data.message),
    Match.tag("TimeoutException", (data) => data.message),
    // Note: Never modify this part. Instead, wrap the Error in the above category
    Match.orElse((err) => {
      return config.handleUnresolvedErrorType(err);
    }),
  );
}

export function extendErrorTagResolver(config: {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  resolver?: (error: any) => ApiErrors | undefined;
}) {
  return function resolveErrorType(reason: unknown): ApiErrors {
    const error = config.resolver(reason) ?? reason;
    const sameError = () => error;

    // @ts-expect-error
    return pipe(
      Match.value(error),
      Match.when({ _tag: "UnknownException" }, sameError),
      Match.when({ _tag: "ValidationError" }, sameError),
      Match.when({ _tag: "ApiError" }, sameError),
      Match.when({ _tag: "TimeoutException" }, sameError),
      Match.orElse(() => resolveUntaggedError(reason)),
    );
  };
}
