import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

// One Markdown file per project in src/content/projects/; the file name is the URL slug.
const projects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string(),
      stack: z.array(z.string()).min(1),
      repo: z.url(),
      cover: image(),
      coverAlt: z.string(),
      // Lower numbers are listed first on the home page.
      order: z.number().int(),
    }),
});

export const collections = { projects };
