import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { type Folder } from "../services/types";

export const FOLDERS_REDUX_KEY = "folders"

const foldersAdapter = createEntityAdapter<Folder, number>({
    selectId: (folder: Folder) => folder.id,
    sortComparer: (x, y) => x.title.localeCompare(y.title)
});

const foldersSlice = createSlice({
    name: FOLDERS_REDUX_KEY,
    initialState: foldersAdapter.getInitialState(),
    reducers: {

    },
    // extraReducers: (builder) => {
    //     builder.addCase()
    // }
})


export const foldersReducer = foldersSlice.reducer;