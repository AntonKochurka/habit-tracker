import { createEntityAdapter, createSlice, type EntityState } from "@reduxjs/toolkit";
import { LoadingStatus, type BaseState, type Pagination } from "@shared/types";
import type { Habit } from "../service/types";

export const HABITS_REDUX_KEY = "habits";

const habitsAdapter = createEntityAdapter<Habit, number>({
  selectId: (habit) => habit.id,
  sortComparer: (a, b) => a.title.localeCompare(b.title),
});

export interface HabitsState extends EntityState<Habit, number>, BaseState, Pagination {}

const initialState: HabitsState = habitsAdapter.getInitialState({
  status: LoadingStatus.IDLE,
  error: null,
  filters: {},
  page: 1,
  hasMore: true,
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
  },
  extraReducers: (builder) => {
    builder
  },
});

export const habitsReducer = habitsSlice.reducer;
export const habitsActions = habitsSlice.actions;

export const getHabits = (state: { habits: HabitsState }) => state.habits.entities;
export const getHabitsState = (state: { habits: HabitsState }) => state.habits;
