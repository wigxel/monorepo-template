import { Effect } from "effect";
import { UserRepoLayer, UserRepository } from "~/repositories/user.repository";
import { searchByQueryRepo } from "~/services/search.service";

const repo = new UserRepository();

export function getUser(id: string) {
  return Effect.gen(function* (_) {
    const repo = yield* UserRepoLayer.Tag;

    return yield* repo.getUserById(id);
  });
}

export function createCustomer(data: Record<string, unknown>) {
  return Effect.gen(function* (_) {
    const repo = yield* UserRepoLayer.Tag;

    return repo.create(data);
  });
}

export function getAllUsers() {
  return Effect.gen(function* (_) {
    const users = yield* searchByQueryRepo(repo);

    return {
      message: "Users fetched successfully",
      data: users,
    };
  });
}
