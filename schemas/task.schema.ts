import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(1),
  content: z.string().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  completed: z.boolean().optional(),
});
