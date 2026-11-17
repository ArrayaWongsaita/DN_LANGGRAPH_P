import { z } from "zod";

export const userSchema = z.object({
  name: z.string().min(1),
  age: z.number().min(0),
});

export type User = z.infer<typeof userSchema>;
