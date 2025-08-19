import { AUTH_REDUX_KEY, authReducer } from "@app/auth/redux";
import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import { MODAL_REDUX_KEY, modalReducer } from "./modals/redux";

export const store = configureStore({
  reducer: {
    [AUTH_REDUX_KEY]: authReducer,
    [MODAL_REDUX_KEY]: modalReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;


export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()