import { Effect } from "effect";
import type { ApiErrors } from "./response-types";

export type ResponseValidator = {
  validate: (data: unknown) => boolean;
  respond: <T>(data: T) => ApiErrors;
};

export function resolveEffect(resolver: ResponseValidator) {
  return function responseToEffect<T>(response: T) {
    return Effect.suspend(() => {
      if (resolver.validate(response)) return Effect.succeed(response);
      return Effect.fail(resolver.respond(response));
    });
  };
}

export function resolvePromise(resolver: ResponseValidator) {
  return function responseToPromise<T>(response: T) {
    if (resolver.validate(response)) return Promise.resolve(response);
    return Promise.reject(resolver.respond(response));
  };
}
