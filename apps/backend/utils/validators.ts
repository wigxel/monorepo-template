import { z } from "zod";

export const querySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
});

export const searchSchema = z.object({
  search: z.string().optional(),
});
