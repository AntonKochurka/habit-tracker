import { Outlet } from "react-router-dom";
import Header from "../header";
import GlobalModal from "../../modals/components/globalModal";
import ToastProvider from "@shared/toast_provider";

export default function Layout() {
    return (
        <div>
            <Header />
            <Outlet />
            <GlobalModal />
            <ToastProvider />
        </div>
    )
}