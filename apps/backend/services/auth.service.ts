import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { Effect } from "effect";
import { Lucia } from "lucia";
import { Argon2id } from "oslo/password";
import uncrypto from "uncrypto";
import { drizzleClient } from "~/config/database";
import { AuthUser } from "~/layers/auth-user";
import { Session } from "~/layers/session";
import {
  sessionCustomer,
  sessionOrg,
  teamMember,
  user,
} from "~/migrations/schema";

// polyfill stable crypto global
Object.defineProperty(globalThis, "crypto", { value: uncrypto });

export const teamAuth = createAuthHelper(
  new DrizzlePostgreSQLAdapter(drizzleClient, sessionOrg, teamMember),
);
export const customerAuth = createAuthHelper(
  new DrizzlePostgreSQLAdapter(drizzleClient, sessionCustomer, user),
);

export function hashPassword(password: string) {
  return new Argon2id().hash(password);
}

export async function verifyPassword(password: string, hash: string) {
  try {
    const isMatch = await new Argon2id().verify(hash, password);
    if (isMatch) return { _tag: "Right", value: "Verification passed!" };
  } catch (err) {
    console.error("Verification failed", err);
  }

  return { _tag: "Left", value: "Verification failed" };
}

function createAuthHelper(adapter: DrizzlePostgreSQLAdapter) {
  const lucia = new Lucia(adapter, {
    sessionCookie: {
      attributes: {
        // set to `true` when using HTTPS
        secure: process.env.NODE_ENV === "production",
      },
    },
  });

  async function createSession(
    user_id: string,
  ): Promise<{ session_id: string; expires_at: Date }> {
    const session = await lucia.createSession(user_id, {});
    return {
      session_id: session.id,
      expires_at: session.expiresAt,
    };
  }

  async function validateSession(session_id: string) {
    try {
      const { session, user } = await lucia.validateSession(session_id);
      if (session === null)
        return { _tag: "Left" as const, value: "No session found" };
      return { _tag: "Right" as const, value: { session, user } };
    } catch (err) {
      console.error("Error validating session", err);
      return { _tag: "Left" as const, value: "No session found" };
    }
  }

  function invalidateSession(session_id: string) {
    return lucia.invalidateSession(session_id);
  }

  function invalidateUserSessions(user_id: string) {
    return lucia.invalidateUserSessions(user_id);
  }

  return {
    invalidateSession,
    validateSession,
    invalidateUserSessions,
    createSession,
    lucia,
  };
}

declare module "lucia" {
  interface Register {
    Lucia: typeof customerAuth.lucia | typeof teamAuth.lucia;
    DatabaseSessionAttributes: DatabaseSessionAttributes;
  }
  type DatabaseSessionAttributes = Record<string, never>;
}

export function logout({ access_token }: { access_token: string }) {
  return Effect.gen(function* (_) {
    const response = { message: "Session terminated" };

    const session = yield* Session;
    const data = yield* session.validate(access_token);

    if (data._tag === "Left") return response;

    yield* _(session.invalidate(access_token));

    return response;
  });
}

export function login({ body }: { body: { email: string; password: string } }) {
  return Effect.gen(function* (_) {
    const session = yield* Session;
    const auth_user = yield* AuthUser;

    const error = createError({
      message: "Invalid username or password provided",
      status: 422,
    });

    yield* _(Effect.logDebug("Getting authenticated User"));
    const user = yield* _(
      pipe(
        auth_user.getUserRecord({ email: body.email }),
        Effect.mapError(() => error),
      ),
    );

    yield* _(Effect.logDebug("Verify password"));
    const isMatch = yield* _(
      Effect.tryPromise(() =>
        verifyPassword(body.password, user?.password ?? ""),
      ),
    );

    if (isMatch._tag === "Left") {
      return yield* _(Effect.fail(error));
    }

    yield* _(Effect.logDebug("Creating session"));
    const { session_id, expires_at } = yield* _(
      session.create(user.user_id).pipe(Effect.mapError(() => error)),
    );

    yield* _(Effect.logDebug("Session created"));

    return {
      message: "Login successful",
      data: {
        access_token: session_id,
        expires: expires_at.toISOString(),
      },
    };
  });
}
