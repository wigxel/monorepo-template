import { Context, Effect, Layer } from "effect";
import { CategoryDto } from "~/dtos/category.dto";
import {
	CategoryRepo,
	CategoryRepoLive,
} from "~/repositories/category.repository";
import { searchByQueryRepo } from "~/services/search.service";

export const create = (input: { name: string }) => {
	return Effect.gen(function* (_) {
		const repo_ = yield* CategoryRepo; // useContext(CategoryRepo)

		yield* validateZod(() => CategoryDto.omit({ id: true }).safeParse(input), {
			failureMessage: "Unable to create Category",
		});

		return yield* repo_.create(input);
	});
};

function deleteCategory(input: { id: number }) {
	return Effect.gen(function* (_) {
		const repo_ = yield* CategoryRepo;

		yield* repo_.findFirstOrThrow(input);

		return yield* repo_.delete(input);
	});
}

export const searchByQuery = Effect.gen(function* (_) {
	const repo = yield* CategoryRepo;

	return yield* searchByQueryRepo(repo);
});

export interface CategoryServiceImpl {
	readonly create: typeof create;
	readonly searchByQuery: typeof searchByQuery;
	readonly delete: typeof deleteCategory;
}

export class CategoryService extends Context.Tag("CategoryService")<
	CategoryService,
	CategoryServiceImpl
>() {}

export const CategoryServiceImpl = CategoryService.of({
	create,
	searchByQuery,
	delete: deleteCategory,
});

export const CategoryServiceLive = Layer.merge(
	Layer.succeed(CategoryService, CategoryServiceImpl),
	CategoryRepoLive,
);
