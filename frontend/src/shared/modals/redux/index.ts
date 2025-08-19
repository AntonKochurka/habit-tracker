import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ModalEntry, ModalState } from "../service/types";

export const MODAL_REDUX_KEY = "modal";

const initialState: ModalState = { stack: [] };

const slice = createSlice({
  name: MODAL_REDUX_KEY,
  initialState,
  reducers: {
    openModal: (state, action: PayloadAction<ModalEntry>) => {
      state.stack.push(action.payload);
    },
    closeModal: (state, action: PayloadAction<{ id: string }>) => {
      state.stack = state.stack.filter((m) => m.id !== action.payload.id);
    },
    clearModals: (state) => {
      state.stack = [];
    },
  },
});

export const { openModal, closeModal, clearModals } = slice.actions;
export const modalReducer = slice.reducer;
