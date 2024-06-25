import { z } from "zod";

import { ValidationError } from "~/config/exceptions";

test("Zod error to Validation Error response", () => {
	expect.hasAssertions();

	const result = z
		.object({
			name: z.string().min(3, { message: "Must provide a name" }),
			age: z.number().min(12),
		})
		.safeParse({ name: "" });

	if (result.success === false) {
		expect(new ValidationError(result)).toMatchInlineSnapshot(`
      {
        "_tag": "ValidationError",
        "errors": {
          "age": [
            "Required",
          ],
          "name": [
            "Must provide a name",
          ],
        },
        "message": "Must provide a name (and 1 more errors)",
      }
    `);
	}
});
