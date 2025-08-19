import { Outlet } from "react-router-dom";
import Header from "../header";
import GlobalModal from "../../modals/components/globalModal";

export default function Layout() {
    return (
        <div>
            <Header />
            <Outlet />
            <GlobalModal />
        </div>
    )
}