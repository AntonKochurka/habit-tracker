import { createEntityAdapter, createSelector, createSlice, type EntityState, type PayloadAction } from "@reduxjs/toolkit";
import { LoadingStatus, type BaseState, type Pagination } from "@shared/types";
import type { Habit } from "../service/types";
import { getFoldersState } from "@app/folders/redux";

export const HABITS_REDUX_KEY = "habits";

const habitsAdapter = createEntityAdapter<Habit, number>({
  selectId: (habit) => habit.id,
  sortComparer: (a, b) => a.title.localeCompare(b.title),
});

export interface HabitsState extends EntityState<Habit, number>, BaseState, Pagination {
  current_day: string;
}

function normalizeDateISO(date: string | Date): string {
  const d = new Date(date);
  return d.toISOString().split("T")[0];
}

const initialState: HabitsState = habitsAdapter.getInitialState({
  status: LoadingStatus.IDLE,
  error: null,
  filters: {},
  page: 1,
  hasMore: true,
  current_day: normalizeDateISO(new Date())
});

const habitsSlice = createSlice({
  name: HABITS_REDUX_KEY,
  initialState,
  reducers: {
    addOne: habitsAdapter.addOne,
    addMany: habitsAdapter.addMany,
    upsertOne: habitsAdapter.upsertOne,
    upsertMany: habitsAdapter.upsertMany,
    removeOne: habitsAdapter.removeOne,
    removeMany: habitsAdapter.removeMany,
    setAll: habitsAdapter.setAll,
    setMany: habitsAdapter.setMany,
    setOne: habitsAdapter.setOne,
    setCurrentDay: (state, action: PayloadAction<string | Date>) => {
      state.current_day = normalizeDateISO(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
  },
});

export const habitsReducer = habitsSlice.reducer;
export const habitsActions = habitsSlice.actions;

export const getHabitsState = (state: { habits: HabitsState }) => state.habits;

export const selectHabitsByFolderId = (folderId: number) =>
  createSelector(
    [getHabitsState, getFoldersState],
    (habitsState, foldersState) => {
      const folder = foldersState.entities[folderId];
      if (!folder || !folder.habit_ids) return [];
      return folder.habit_ids
        .map((id: number) => habitsState.entities[id])
        .filter((habit): habit is NonNullable<typeof habit> => !!habit);
    }
  );
