import { Context, Effect, Either, Layer } from "effect";
import { UnknownException } from "effect/Cause";
import type { Session as LuciaSession, User as LuciaUser } from "lucia";
import { DatabaseClient } from "~/config/database";
import { TeamMember, User } from "~/dtos/user.dto";
import { runDrizzleQuery } from "~/libs/query.helpers";
import { customerAuth, teamAuth } from "~/services/auth.service";

type SessionError = UnknownException | Error;

interface SessionImpl {
	getUser(user: {
		id: string;
	}): Effect.Effect<TeamMember | User | null, SessionError, DatabaseClient>;

	create(
		user_id: string,
	): Effect.Effect<
		{ session_id: string; expires_at: Date },
		SessionError | DatabaseClient
	>;

	validate(
		token: string,
	): Effect.Effect<
		Either.Either<{ session: LuciaSession; user: LuciaUser }, string>,
		SessionError,
		DatabaseClient
	>;

	invalidate(token: string): Effect.Effect<void>;
}

export class Session extends Context.Tag("Session")<Session, SessionImpl>() {}

const CustomerLive: SessionImpl = {
	create(user_id: string) {
		return Effect.tryPromise({
			try: () => customerAuth.createSession(user_id),
			catch: () => new Error("Failed to create session"),
		});
	},

	validate(token: string) {
		return Effect.tryPromise(async () => {
			const { _tag, value } = await customerAuth.validateSession(token);
			return _tag === "Right" ? Either.right(value) : Either.left(value);
		});
	},

	getUser(user: { id: string }) {
		return runDrizzleQuery((db) =>
			db.query.user.findFirst({
				where: (cols, { eq }) => eq(cols.id, user.id),
			}),
		);
	},

	invalidate(session_id: string) {
		return Effect.promise(() => customerAuth.invalidateSession(session_id));
	},
};

const OrgSessionLive: SessionImpl = {
	create(user_id: string) {
		return Effect.logDebug(
			`Generating session for user. UserID(${user_id})`,
		).pipe(
			Effect.flatMap(() =>
				Effect.tryPromise({
					try: () => teamAuth.createSession(user_id),
					catch: () => new Error("Failed to create session"),
				}),
			),
		);
	},

	validate(token: string) {
		return Effect.promise(async () => {
			const { _tag, value } = await teamAuth.validateSession(token);
			return _tag === "Right" ? Either.right(value) : Either.left(value);
		});
	},

	getUser(user: { id: string }) {
		return runDrizzleQuery((db) => {
			return db.query.user.findFirst({
				where: (cols, op) => op.eq(cols.id, user.id),
			});
		});
	},

	invalidate(session_id: string) {
		return Effect.promise(() => teamAuth.invalidateSession(session_id));
	},
};

export const CustomerSessionLive = Layer.succeed(Session, CustomerLive);
export const TeamMemberSessionLive = Layer.succeed(Session, OrgSessionLive);
