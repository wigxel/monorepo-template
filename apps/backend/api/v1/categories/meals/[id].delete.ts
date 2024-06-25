import { Effect } from "effect";
import { z } from "zod";
import { CategoryServiceImpl } from "~/services/category.service";

const schema = z
	.object({
		id: z.coerce.number().min(0),
	})
	.required();

export default defineEventHandler(async (event) => {
	const result = await getValidatedRouterParams(event, schema.safeParse);

	if (!result.success)
		return createError({ message: "Provide a valid `id` parameter" });

	const program = pipe(
		CategoryServiceImpl.delete({
			id: result.data.id,
		}),
		Effect.map((data) => {
			return {
				message: "Category deleted successfully",
				data,
			};
		}),
	);

	// Get all the categories a meal can be added.
	return runPromise(event, program);
});
