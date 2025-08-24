import { createAsyncThunk } from "@reduxjs/toolkit";
import type { Folder } from "../services/types";
import api from "@shared/api";
import type { PaginationResponse } from "@shared/types";
import { filters_to_query } from "@shared/utils";
import type { RootState } from "@shared/store";

export const fetchFoldersPage = createAsyncThunk<
  PaginationResponse<Folder>, 
  number,
  { rejectValue: string }
>("folders/fetchPage", async (page, { rejectWithValue, getState }) => {
  try {    
    const filters = (getState() as RootState).folders.filters;
    const res = await api.get(`/folders?page=${page}&${filters_to_query(filters)}`);
    console.log("RESPONSE: ", res);
    
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});