export type HabitType = "default" | "timer" | "counter";

export interface Habit {
  id: number;
  title: string;
  habit_type: HabitType;
  target_value: number | null;
  description: string | null;
  record: {
    type: HabitType;
    is_completed: boolean;
    current_value: number | null;
    value_achieved: number | null;
    completed_at: string;   
  } | null
}