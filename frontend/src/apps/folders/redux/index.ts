import { createEntityAdapter, createSlice, type EntityState, type PayloadAction } from "@reduxjs/toolkit";
import { type Folder } from "../services/types";
import { LoadingStatus, type BaseState, type Pagination } from "@shared/types";
import { fetchFoldersPage } from "./thunks";

export const FOLDERS_REDUX_KEY = "folders"

const foldersAdapter = createEntityAdapter<Folder, number>({
    selectId: (folder: Folder) => folder.id,
    sortComparer: (x, y) => x.title.localeCompare(y.title)
});

export interface FoldersState extends EntityState<Folder, number>, BaseState, Pagination {}

const initialState: FoldersState = foldersAdapter.getInitialState({
  status: LoadingStatus.IDLE,
  error: null,
  filters: {},
  page: 1,
  hasMore: true,
});

const foldersSlice = createSlice({
    name: FOLDERS_REDUX_KEY,
    initialState: initialState,
    reducers: {
        addOne: foldersAdapter.addOne,
        addMany: foldersAdapter.addMany,
        reset: () => initialState,
        setFilters: (state, action: PayloadAction<Record<string, any>>) => {
            state.filters = action.payload;
            state.page = 1;
            foldersAdapter.removeAll(state);
        },
        updateFilters: (state, action: PayloadAction<Record<string, any>>) => {
            state.filters = { ...state.filters, ...action.payload };
            state.page = 1;
            foldersAdapter.removeAll(state);
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchFoldersPage.pending, (state) => {
                state.error = null;
                state.status = LoadingStatus.LOADING
            })
            .addCase(fetchFoldersPage.fulfilled, (state, action) => {
                foldersAdapter.addMany(state, action.payload.items);
                state.status = LoadingStatus.SUCCEEDED

                const hasMore = action.payload.page < action.payload.pages
                state.hasMore = hasMore

                if (hasMore) state.page += 1; 
            })
            .addCase(fetchFoldersPage.rejected, (state, action) => {
                state.error = action.payload ?? "Unknown error"
                state.status = LoadingStatus.FAILED
            })
    }
})


export const foldersReducer = foldersSlice.reducer;
export const foldersActions = foldersSlice.actions;

export const folderSelector = foldersAdapter.getSelectors((state: { folders: FoldersState}) => state.folders)
export const getFoldersState = (state: { folders: FoldersState}) => state.folders;