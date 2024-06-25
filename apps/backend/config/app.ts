import { Layer } from "effect";
import { LogDebugLayer } from "~/config/logger";
import { DatabaseLive } from "~/layers/database";
import { CategoryRepoLive } from "~/repositories/category.repository";

export const AppLive = Layer.empty.pipe(
	Layer.provideMerge(DatabaseLive),
	Layer.provideMerge(CategoryRepoLive),
	Layer.provideMerge(LogDebugLayer),
);
