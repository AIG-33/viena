import { z } from "zod";

export const cartItemSchema = z.object({
  productId: z.string(),
  slug: z.string(),
  categoryId: z.string(),
  name: z.string(),
  catalogNumber: z.string().optional(),
  quantity: z.number().int().positive(),
  selectedOptions: z.record(z.string(), z.string()).optional(),
});

// Stable, locale-agnostic option keys. Display labels live in the message catalogs
// under `contacts.subjects.*`.
export const SUBJECT_OPTIONS = [
  "rfq",
  "service",
  "consultation",
  "partnership",
  "other",
] as const;
export type SubjectKey = (typeof SUBJECT_OPTIONS)[number];

// Builder so we can translate validation errors at call site (client and API).
export function buildContactSchema(messages: {
  nameMin: string;
  phoneMin: string;
  phoneFormat: string;
  emailInvalid: string;
  subjectRequired: string;
  messageMin: string;
}) {
  return z.object({
    name: z.string().min(2, messages.nameMin),
    company: z.string().optional(),
    phone: z
      .string()
      .min(7, messages.phoneMin)
      .regex(/^[+\d\s\-()]+$/, messages.phoneFormat),
    email: z.string().email(messages.emailInvalid),
    subject: z.string().min(1, messages.subjectRequired),
    message: z.string().min(10, messages.messageMin),
    items: z.array(cartItemSchema).optional(),
    website: z.string().optional(),
  });
}

// Server-side default schema (English fallback so logs stay readable).
export const contactSchema = buildContactSchema({
  nameMin: "Please enter your name (at least 2 characters)",
  phoneMin: "Please enter a valid phone number",
  phoneFormat: "Invalid phone format",
  emailInvalid: "Please enter a valid email",
  subjectRequired: "Please pick a subject",
  messageMin: "The message is too short (at least 10 characters)",
});

export type ContactFormData = z.infer<typeof contactSchema>;
export type CartItemPayload = z.infer<typeof cartItemSchema>;
