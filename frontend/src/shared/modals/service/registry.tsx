// src/shared/modals/service/registry.tsx
import React from "react";
import { ModalKeys, type ModalKey } from "./types";

import FolderModal from "../components/folderModal";

const EmptyModal: React.FC<any> = () => null;

export const modalRegistry: Record<ModalKey, React.ComponentType<any>> = {
  [ModalKeys.CREATE_FOLDER]: FolderModal ?? EmptyModal,
  [ModalKeys.CHANGE_PASSWORD]: EmptyModal,
};
