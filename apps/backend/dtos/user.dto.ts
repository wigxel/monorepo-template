import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { user } from "~/migrations/schema";

export default {
	createUser: z.object({
		firstName: z.string().min(3).max(20),
		lastName: z.string().min(3).max(20),
		email: z.string().email(),
	}).parse,
};

const selectUser = createSelectSchema(user);
const teamMember = createSelectSchema(user);

export interface User extends z.infer<typeof selectUser> {}
export interface TeamMember extends z.infer<typeof teamMember> {}
