import { z } from "zod";

export const eventSubmissionSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().min(20).max(1200),
  imageUrl: z.string().url(),
  danceStyle: z.enum(["salsa", "bachata", "salsa_bachata", "other"]),
  date: z.string().min(1),
  time: z.string().min(1),
  price: z.string().max(50),
  city: z.string().min(2).max(80),
  venue: z.string().min(2).max(120),
  organizerName: z.string().min(2).max(120),
  contactLink: z.string().url()
});

export type EventSubmissionValues = z.infer<typeof eventSubmissionSchema>;
