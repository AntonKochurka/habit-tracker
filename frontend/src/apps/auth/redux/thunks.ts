import { createAsyncThunk } from "@reduxjs/toolkit";
import type { AuthState, Credentials, TokenResponse } from "../service/types";
import api from "@shared/api";

export const loginThunk = createAsyncThunk(
  "auth/login",
  async (credentials: Credentials, { rejectWithValue }) => {
    try {
      const response = await api.post<TokenResponse>("/auth/obtain", credentials);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Authentication failed"
      );
    }
  }
);

export const refreshThunk = createAsyncThunk(
  "auth/refresh",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState() as { auth: AuthState };
      const response = await api.post<TokenResponse>("/auth/refresh", {
        refresh: auth.refreshToken,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Token refresh failed"
      );
    }
  }
);
