// 1. Import utilities from `astro:content`
import { defineCollection, z } from 'astro:content'

// 2. Define a `type` and `schema` for each collection
const magnetCollection = defineCollection({
  type: 'data', // v2.5.0 and later
  schema: z.array(
    z.object({
      date: z.string(),
      size: z.string(),
      title: z.string(),
      magnet: z.string(),
    }),
  ),
})

// 3. Export a single `collections` object to register your collection(s)
export const collections = {
  magnet: magnetCollection,
}
