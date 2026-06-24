import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const docs = defineCollection({
  loader: glob({ pattern: ['**/*.md', '!README.md'], base: './src/content/docs' }),
  schema: z.object({
    title: z.string().optional(),
    parent: z.string().optional(),
    nav_order: z.number().optional(),
    description: z.string().optional(),
    has_children: z.boolean().optional(),
    permalink: z.string().optional()
  }).passthrough()
});

export const collections = { docs };
