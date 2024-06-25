import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { capitalize } from "effect/String";
import { z } from "zod";
import { measurement } from "~/migrations/schema";

const unit = z
	.string()
	.min(2, { message: "Measurement unit is too short" })
	.refine((e) => capitalize(e.toLowerCase()));

const si_unit = z
	.string({ required_error: "si unit required e.g kg, oz, ltr" })
	.min(1, { message: "Measurement si unit is too short" })
	.refine((e) => e.toLowerCase());

const createMeasureSchema = createInsertSchema(measurement);
const selectMeasureSchema = createSelectSchema(measurement);

export type MeasureInterface = z.infer<typeof selectMeasureSchema>;
export type NewMeasureInterface = z.infer<typeof createMeasureSchema>;

export const MeasureSchema = createMeasureSchema.merge(
	z.object({
		id: z.number().default(0),
		unit: unit,
		unit_plural: unit,
		si_unit: si_unit,
		si_unit_plural: si_unit,
	}),
);

export const CreateMeasureSchema = createMeasureSchema;
