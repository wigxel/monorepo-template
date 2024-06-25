import { z } from "zod";

export type CreateQuestion = z.infer<typeof CreateQuestionSchema>;
export type UpdateQuestion = z.infer<typeof UpdateQuestionSchema>;

const QuestionOptions = z
  .object({
    id: z.string({ required_error: "Option ID required" }).min(1),
    text: z.string({ required_error: "Option text required" }).min(1),
    image: z.string().url().optional(),
  })
  .strict();

export const QuestionSchema = z.object({
  question: z.string().min(1),
  type: z.enum(["single", "multiple"]).default("single"),
  status: z.enum(["PUBLISHED", "UNPUBLISHED"]),
  options: z.array(QuestionOptions.omit({ id: true })),
});

export const CreateQuestionSchema = QuestionSchema;

export const UpdateQuestionSchema = CreateQuestionSchema.merge(
  z.object({
    options: z.array(QuestionOptions),
  }),
).partial();
