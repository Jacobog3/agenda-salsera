import { z } from "zod";

export const eventSubmissionSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().max(1200).optional().or(z.literal("")),
  imageUrl: z.string().optional().or(z.literal("")),
  danceStyle: z.enum(["salsa", "bachata", "salsa_bachata", "other"]),
  date: z.string().min(1),
  time: z.string().min(1),
  price: z.string().max(50).optional().or(z.literal("")),
  city: z.string().min(2).max(80),
  venue: z.string().min(2).max(120),
  address: z.string().max(200).optional().or(z.literal("")),
  organizerName: z.string().max(120).optional().or(z.literal("")),
  contactLink: z.string().max(300).optional().or(z.literal(""))
});

export type EventSubmissionValues = z.infer<typeof eventSubmissionSchema>;
