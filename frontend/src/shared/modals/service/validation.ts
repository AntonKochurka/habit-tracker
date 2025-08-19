import { z } from "zod";

export const folderCreateSchema = z.object({
  title: z.string(),
  color: z.string().default("#ffffff").nonoptional(),
});

export type FolderCreateValues = z.infer<typeof folderCreateSchema>;
