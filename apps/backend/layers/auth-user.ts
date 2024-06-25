import { Context, Effect, Layer, Scope } from "effect";
import { UnknownException } from "effect/Cause";
import { InferLayerError, InferLayerScope } from "~/contexts/effect.util";
import { DatabaseLive } from "~/layers/database";
import { notNil } from "~/libs/query.helpers";
import { TeamRepo } from "~/repositories/team-member.repository";
import { UserRepo, UserRepoLayer } from "~/repositories/user.repository";

type AuthError = UnknownException | Error | InferLayerError<typeof AuthLive>;
type Scopes = InferLayerScope<typeof AuthLive>;

interface AuthUserImpl {
  getUserRecord: (body: {
    email: string;
  }) => Effect.Effect<{ user_id: string; password: string }, AuthError, Scopes>;
}

export class AuthUser extends Context.Tag("AuthUser")<
  AuthUser,
  AuthUserImpl
>() { }

export const AuthCustomerLive = Layer.succeed(
  AuthUser,
  AuthUser.of({
    getUserRecord: ({ email }) => {
      return Effect.suspend(() => {
        return Effect.scoped(
          Effect.provide(
            Effect.gen(function*(_) {
              const repo = yield* _(UserRepo);
              yield* Effect.logDebug("CustomerAuth: Getting user record");

              const user = yield* pipe(
                repo.findFirst({ email }),
                Effect.flatMap(notNil),
              );

              yield* Effect.logDebug(
                `CustomerAuth: Sending user record ${user?.id}`,
              );

              return { user_id: String(user.id), password: user.password };
            }),
            AuthLive,
          ),
        );
      });
    },
  }),
);

export const AuthTeamMemberLive = Layer.succeed(
  AuthUser,
  AuthUser.of({
    getUserRecord: ({ email }) => {
      return Effect.provide(
        Effect.gen(function*(_) {
          const repo = yield* _(TeamRepo.Tag);
          yield* _(Effect.logDebug("TeamMemberAuth: Getting user record"));
          const user = yield* repo.findFirstOrThrow({ email });

          yield* _(
            Effect.logDebug(`TeamMemberAuth: Sending user record ${user?.id}`),
          );

          return { user_id: user.id, password: user.password };
        }),
        AuthLive,
      );
    },
  }),
);

export const AuthLive = Layer.empty.pipe(
  Layer.provideMerge(DatabaseLive),
  Layer.provideMerge(TeamRepo.Live),
  Layer.provideMerge(UserRepoLayer.Repo.Live),
);
