export const ModalKeys = {
  CHANGE_PASSWORD: "change_password",
  CREATE_FOLDER:  "create_folder",
  CREATE_HABIT: "create_habit"
}

export type ModalKey = typeof ModalKeys[keyof typeof ModalKeys];

export type ModalEntry = {
  id: string;
  key: ModalKey;
  props?: Record<string, any>;
};

export interface ModalState {
  stack: ModalEntry[]; 
}

