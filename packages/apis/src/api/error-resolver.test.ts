import { Cause } from "effect";
import { FetchError } from "ofetch";
import { expect, it } from "vitest";
import {
  defineErrorMessageResolver,
  extendErrorTagResolver,
  resolveUntaggedError,
} from "./error-resolver";
import { ApiError, ValidationError } from "./response-types";

it("should retrieve formatted error message", () => {
  const getErrorMessage = defineErrorMessageResolver({
    handleUnresolvedErrorType: () => "Default error message",
  });

  expect(
    getErrorMessage(new ApiError({ message: "API Error" })),
  ).toMatchInlineSnapshot(`"API Error"`);

  expect(
    getErrorMessage(new Cause.TimeoutException("Timed out")),
  ).toMatchInlineSnapshot(`"Timed out"`);

  expect(
    getErrorMessage(
      new Cause.UnknownException(
        new FetchError("[400] Error"),
        "Request failure",
      ),
    ),
  ).toMatchInlineSnapshot(`"Request failure"`);

  expect(
    getErrorMessage(
      new ValidationError({
        firstName: "Required!",
        lastName: "Not last name provided",
      }),
    ),
  ).toMatchInlineSnapshot(`"Required!, Not last name provided"`);
});

it("should resolve unknown errors to UnknownException", () => {
  const res = resolveUntaggedError(new Error("NetworkError"));
  expect(res).toBeInstanceOf(Cause.UnknownException);
  expect(res).toMatchInlineSnapshot("[UnknownException: NetworkError]");

  const res1 = resolveUntaggedError({
    data: { message: "Message from Server" },
  });
  expect(res1).toBeInstanceOf(Cause.UnknownException);
  expect(res1).toMatchInlineSnapshot("[UnknownException: Message from Server]");
});

it("should tag error response", () => {
  const errorTagResolver = extendErrorTagResolver({
    resolver(err) {
      if (err.message.includes("NetworkError")) {
        return new ApiError({ message: "There seems to be network error" });
      }
    },
  });

  expect(errorTagResolver(new Error("NetworkError"))).toBeInstanceOf(ApiError);

  const fetch_error = new FetchError("[400] A fetch error");
  expect(errorTagResolver(fetch_error)).toBeInstanceOf(ApiError);

  const record = new Error("<no response>");
  expect(errorTagResolver(record).message).toMatchInlineSnapshot(
    `"Something new wrong. Server didn't respond"`,
  );

  expect(errorTagResolver(record).message).toMatchInlineSnapshot(
    `"Something new wrong. Server didn't respond"`,
  );
});
