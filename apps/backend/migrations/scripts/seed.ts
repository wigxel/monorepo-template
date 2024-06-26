import "dotenv/config";
import { ConfigProvider, Console, Effect, Exit, Layer } from "effect";
import { AppLive } from "~/config/app";
import { DatabaseClient, DatabaseResource } from "~/config/database";
import { CategoryRepo } from "~/repositories/category.repository";

const seedCategories = Effect.gen(function* (_) {
  const categoryRepo = yield* CategoryRepo;
  const queries = [
    "Spicy",
    "Nigerian",
    "Italian",
    "Breakfast",
    "Snacks",
    "Fastfood",
  ].map((name) => categoryRepo.create({ name: name }));

  yield* Effect.all(queries);
});

const startMigration = Effect.gen(function* (_) {
  const { orm } = yield* DatabaseResource;

  return yield* Effect.try(() => {
    return orm.transaction(async (tx) => {
      const TxModelDatabase = Layer.succeed(DatabaseClient, tx);
      const runSeeds = Effect.all([seedCategories]);

      await Effect.runPromise(
        Effect.scoped(
          Effect.provide(
            runSeeds,
            AppLive.pipe(Layer.provideMerge(TxModelDatabase)),
          ),
        ),
      );
    });
  });
}).pipe(
  Effect.tapError((err) =>
    Console.error(`Transaction Rolled back. \nError: ${err.toString()}`),
  ),
);

const scopedEffect = Effect.scoped(
  Effect.provide(
    startMigration,
    Layer.setConfigProvider(ConfigProvider.fromEnv()),
  ),
);

Effect.runPromiseExit(scopedEffect).then((exit) => {
  exit.pipe(
    Exit.match({
      onSuccess: () => process.exit(0),
      onFailure: () => process.exit(1),
    }),
  );
});
