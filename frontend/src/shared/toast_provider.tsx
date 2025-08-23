import { useEffect, useState } from "react";
import { toastBus, type ToastPayload } from "./bus";

export default function ToastProvider() {
  const [toasts, setToasts] = useState<ToastPayload[]>([]);

  useEffect(() => {
    const unsub = toastBus.subscribe((payload) => {
      setToasts((prev) => [...prev, payload]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t !== payload));
      }, 3000);
    });
    return unsub;
  }, []);

  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50">
      {toasts.map((t, i) => (
        <div
          key={i}
          className={`rounded-lg px-4 py-3 shadow-lg text-white font-medium transform transition-all duration-300 ${
            t.type === "error"
              ? "bg-red-500 dark:bg-red-600"
              : t.type === "success"
              ? "bg-green-500 dark:bg-green-600"
              : "bg-blue-500 dark:bg-blue-600"
          }`}
          style={{
            animation: "toast-in 0.3s ease-out",
            maxWidth: "24rem"
          }}
        >
          {t.message}
        </div>
      ))}
      
      <style>{`
        @keyframes toast-in {
          from {
            opacity: 0;
            transform: translateY(1rem);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}