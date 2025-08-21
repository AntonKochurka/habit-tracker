import { createAsyncThunk } from "@reduxjs/toolkit";
import type { Folder } from "../services/types";
import api from "@shared/api";
import type { PaginationResponse } from "@shared/types";

export const fetchFoldersPage = createAsyncThunk<
  PaginationResponse<Folder>, 
  number,
  { rejectValue: string }
>("folders/fetchPage", async (page, { rejectWithValue }) => {
  try {
    const res = await api.get(`/folders?page=${page}`);
    
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});