import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { category } from "~/migrations/schema";

const selectCategorySchema = createSelectSchema(category);

export type SelectCategory = z.infer<typeof selectCategorySchema>;
export type CreateCategory = Omit<z.infer<typeof CategoryDto>, "id">;

export const CategoryDto = z.object({
  id: z.number(),
  name: z.string().min(2, { message: "Category name is too short" }),
});
