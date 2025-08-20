import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthState, TokenResponse } from "../service/types";
import { LoadingStatus } from "@shared/types";
import { loginThunk, refreshThunk } from "./thunks";


export const AUTH_REDUX_KEY = "auth"
const initialState: AuthState = {
  access: null,
  status: LoadingStatus.IDLE,
  error: null,
};

const authSlice = createSlice({
  name: AUTH_REDUX_KEY,
  initialState,
  reducers: {
    logout: (state) => {
      state.access = null;
      state.status = "idle";
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })

      .addCase(loginThunk.fulfilled, (state, action: PayloadAction<TokenResponse>) => {
        state.status = "succeeded";
        console.log("[ redux/auth ]: HERE");
        console.log(action)
        state.access = action.payload.access;
      })

      .addCase(loginThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      .addCase(refreshThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(refreshThunk.fulfilled, (state, action: PayloadAction<TokenResponse>) => {
        state.status = "succeeded";
        state.access = action.payload.access;
      })
      .addCase(refreshThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
        state.access = null;
      });
  },
});


export const { logout, clearError } = authSlice.actions;

export const selectAccessToken = (state: { auth: AuthState }) => state.auth.access;
export const selectAuthStatus = (state: { auth: AuthState }) => state.auth.status;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;

export const authReducer = authSlice.reducer;