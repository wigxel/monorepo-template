import { Effect } from "effect";
import { AuthLive } from "~/layers/auth-user";
import { createCustomer } from "~/services/user.service";
import userDto from "../../../dtos/user.dto";

export default eventHandler(async (event) => {
	const body = await readValidatedBody(event, userDto.createUser);

	const program = pipe(
		createCustomer({
			first_name: body.firstName,
			last_name: body.lastName,
			email: body.email,
		}),
		Effect.map((user) => ({
			message: "User created successfully",
			data: user,
		})),
	);

	return runPromise(event, Effect.scoped(Effect.provide(program, AuthLive)));
});
