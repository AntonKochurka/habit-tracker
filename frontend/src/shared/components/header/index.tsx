import { Link, useNavigate } from "react-router-dom";
import ThemeToggle from "./theme_toggle";
import { showModal } from "@shared/modals/service/service";
import { ModalKeys } from "@shared/modals/service/types";

export default function Header() {
  const navigate = useNavigate();

  const navItems = [
    { title: "Home", onClick: () => {navigate("/about")} },
    { title: "Folders", onClick: () => {
      showModal(
        ModalKeys.CREATE_FOLDER, 
        {
          title: "Create Folder"
        }
      )
    } },
    { title: "Pricing", onClick: () => {navigate("/pricing")} },
    { title: "Contact", onClick: () => {navigate("/contact")} },
  ];

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="mx-auto flex h-16 max-w-screen-xl items-center gap-8 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-gradient-to-r from-sky-500 to-blue-600 dark:from-sky-600 dark:to-blue-700 w-8 h-8 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">H</span>
          </div>
          <span className="text-xl font-bold text-gradient">
            HabitTracker
          </span>
        </Link>

        <div className="flex flex-1 items-center justify-end gap-6">
          <nav className="hidden md:block">
            <ul className="flex items-center gap-6">
              {navItems.map((item, index) => (
                <li key={index}>
                  <button
                    onClick={item.onClick}
                    className="text-gray-600  hover:text-sky-500 dark:text-gray-300 dark:hover:text-sky-400 transition-colors font-medium text-sm"
                  >
                    {item.title}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              to="/auth/signin"
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/auth/signup"
              className="btn-primary"
            >
              Sign Up
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}