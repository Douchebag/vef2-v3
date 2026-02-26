import { z } from 'zod';

const MAX_NAME = 100;
const MAX_EMAIL = 255;
const MAX_TITLE = 200;
const MAX_EXCERPT = 500;

export const authorCreateSchema = z.object({
  name: z.string().trim().min(1).max(MAX_NAME),
  email: z.email().max(MAX_EMAIL),
});

export const authorUpdateSchema = authorCreateSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be provided' }
);

export const newsCreateSchema = z.object({
  title: z.string().trim().min(1).max(MAX_TITLE),
  excerpt: z.string().trim().min(1).max(MAX_EXCERPT),
  content: z.string().trim().min(1),
  authorId: z.int().positive(),
  published: z.boolean(),
});

export const newsUpdateSchema = newsCreateSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be provided' }
);

export const pagingQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(10),
  offset: z.coerce.number().int().min(0).default(0),
});