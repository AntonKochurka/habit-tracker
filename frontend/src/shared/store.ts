import { AUTH_REDUX_KEY, authReducer } from "@app/auth/redux";
import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import { MODAL_REDUX_KEY, modalReducer } from "./modals/redux";
import { FOLDERS_REDUX_KEY, foldersReducer } from "@app/folders/redux";
import { HABITS_REDUX_KEY, habitsReducer } from "@app/habits/redux";

export const store = configureStore({
  reducer: {
    [AUTH_REDUX_KEY]: authReducer,
    [MODAL_REDUX_KEY]: modalReducer,
    [FOLDERS_REDUX_KEY]: foldersReducer,
    [HABITS_REDUX_KEY]: habitsReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;


export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()