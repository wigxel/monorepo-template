import { Cause, Match } from "effect";
import { TaggedError } from "effect/Data";

export class ApiError extends TaggedError("ApiError") {
  message: string;
  error: unknown;

  constructor(data: { message: string; error?: unknown }) {
    super();
    this.message = data.message;
    this.error = data.error;
  }
}

export class ValidationError extends TaggedError("ValidationError") {
  constructor(public messages: Record<string, string>) {
    super();
  }
}

export type ApiErrors =
  | ValidationError
  | ApiError
  | Cause.TimeoutException
  | Cause.UnknownException;

export const ResponseType = Match.type<ApiErrors>();
