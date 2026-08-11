import { z } from "zod";

export const assistantMessageSchema = z.object({
  message: z.string().trim().min(1, "Message is required").max(1000, "Message is too long"),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "model"]),
        text: z.string().max(2000),
      })
    )
    .max(20)
    .optional()
    .default([]),
});

export type AssistantMessageInput = z.infer<typeof assistantMessageSchema>;