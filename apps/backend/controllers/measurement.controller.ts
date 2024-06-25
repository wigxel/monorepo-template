import { Effect } from "effect";
import { ValidationError } from "~/config/exceptions";
import {
	CreateMeasureSchema,
	NewMeasureInterface,
} from "~/dtos/measurement.dto";
import { MeasureRepo } from "~/repositories/measurement.repository";
import { FilterService } from "~/services/filter.service";
import { PaginationService } from "~/services/pagination.service";

export function createMeasurement(input: NewMeasureInterface) {
	return Effect.gen(function* (_) {
		const repo = yield* _(MeasureRepo);

		const result = CreateMeasureSchema.safeParse(input);

		if (result.success === false) {
			return yield* _(Effect.fail(new ValidationError(result)));
		}

		return yield* repo.create(result.data as NewMeasureInterface);
	});
}

export function getMeasurements() {
	return Effect.gen(function* (_) {
		const repo = yield* _(MeasureRepo);
		const filter = yield* _(FilterService);
		const pagination = yield* _(PaginationService);

		const data = yield* repo.searchByQuery({
			...filter,
			...pagination.query,
		});

		return {
			data: data,
			meta: pagination.meta,
		};
	});
}
