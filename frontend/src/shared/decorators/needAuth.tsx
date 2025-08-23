import { toastBus } from "@shared/bus";
import { useAppSelector } from "@shared/store";
import { LoadingStatus } from "@shared/types";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function NeedAuth() {
  const navigate = useNavigate();
  const { status } = useAppSelector((state) => state.auth);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (status === LoadingStatus.IDLE) {
      timer = setTimeout(() => {
        toastBus.emit({ message: "Please, you need the auth.", type: "warning" });
        navigate("/auth/signin", { replace: true });
      }, 1000);
    }

    if (status === LoadingStatus.LOADING) {
      timer = setTimeout(() => {
        toastBus.emit({ message: "Loading too long. Please sign in.", type: "warning" });
        navigate("/auth/signin", { replace: true });
      }, 2000);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [status, navigate]);

  return null;
}
