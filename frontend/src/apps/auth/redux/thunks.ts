import { createAsyncThunk } from "@reduxjs/toolkit";
import type { Credentials, TokenResponse } from "../service/types";
import api from "@shared/api";

export const loginThunk = createAsyncThunk(
  "auth/login",
  async (credentials: Credentials, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/obtain", credentials);
      console.log(response);
      
      return response.data as TokenResponse;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Authentication failed"
      );
    }
  }
);

export const refreshThunk = createAsyncThunk(
  "auth/refresh",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post<TokenResponse>("/auth/refresh");
      
      console.log(response);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Token refresh failed"
      );
    }
  }
);
