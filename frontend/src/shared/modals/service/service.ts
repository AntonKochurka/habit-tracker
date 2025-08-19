import { store } from "@shared/store";
import { nanoid } from "nanoid";
import { openModal } from "../redux";
import type { ModalKey } from "./types";

type ModalPromiseResult =
  | { id: string; ok: true; result?: any }
  | { id: string; ok: false };

const modalPromises = new Map<
  string,
  {
    resolve: (v: ModalPromiseResult) => void;
    reject: (e?: any) => void;
  }
>();

export function showModal(key: ModalKey, props?: Record<string, any>) {
  const id = nanoid();
  const p = new Promise<ModalPromiseResult>((resolve, reject) => {
    modalPromises.set(id, { resolve, reject });
    store.dispatch(openModal({ id, key, props }));
  });

  (p as any).id = id;
  return p as Promise<ModalPromiseResult> & { id: ModalKey };
}

export function resolveModalPromise(id: ModalKey, payload: ModalPromiseResult) {
  const entry = modalPromises.get(id);
  if (!entry) return;
  entry.resolve(payload);
  modalPromises.delete(id);
}

export function rejectModalPromise(id: ModalKey, err?: any) {
  const entry = modalPromises.get(id);
  if (!entry) return;
  entry.reject(err);
  modalPromises.delete(id);
}
