// src/shared/modals/service/registry.tsx
import React from "react";
import { ModalKeys, type ModalKey } from "./types";

import FolderModal from "../components/folderModal";
import ChangePasswordModal from "../components/changePasswordModal";
import HabitModal from "../components/habitModal";

const EmptyModal: React.FC<any> = () => null;

export const modalRegistry: Record<ModalKey, React.ComponentType<any>> = {
  [ModalKeys.CREATE_FOLDER]: FolderModal ?? EmptyModal,
  [ModalKeys.CHANGE_PASSWORD]: ChangePasswordModal ?? EmptyModal,
  [ModalKeys.CREATE_HABIT]: HabitModal ?? EmptyModal,
};
