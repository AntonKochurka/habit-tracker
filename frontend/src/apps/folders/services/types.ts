import type { Model } from "@shared/types";

export interface Folder extends Model {
    title: string;
    color: string;
    author_id: number;

    habit_ids: number[]
}
