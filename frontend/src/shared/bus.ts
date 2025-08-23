type ToastType = "success" | "error" | "info" | "warning";

export interface ToastPayload {
  message: string;
  type?: ToastType;
}

type Listener = (payload: ToastPayload) => void;

class ToastBus {
  private listeners: Listener[] = [];

  subscribe(listener: Listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  emit(payload: ToastPayload) {
    this.listeners.forEach((listener) => listener(payload));
  }
}

export const toastBus = new ToastBus();
