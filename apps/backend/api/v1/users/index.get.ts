import { Effect } from "effect";
import { SearchServiceLive } from "~/services/search.service";
import { getAllUsers } from "~/services/user.service";

export default eventHandler((event) => {
  const searchParams = getQuery(event);

  return runPromise(
    event,
    Effect.provide(getAllUsers(), SearchServiceLive(searchParams)),
  );
});
