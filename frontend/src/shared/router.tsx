import { createBrowserRouter } from "react-router-dom";
import Layout from "./components/layout";
import SignUp from "@app/auth/pages/signup";
import SignIn from "@app/auth/pages/signin";
import SingleFolderPage from "@app/folders/page/single";
import HomePage from "@app/home/page";

export let router = createBrowserRouter([
    {
        path: "/",
        element: <Layout/>, 
        children: [
            {
                path: "auth",
                children: [
                    {path: "signup", element: <SignUp/>},
                    {path: "signin", element: <SignIn/>}
                ]
            },
            {
                path: "home",
                children: [
                    {index: true, element: <HomePage />},
                    {path: "folder/:id", element: <SingleFolderPage />},
                    // {path: "habit/:id", element: <SingleHabitPage />}
                ]
            }
        ]
    }
])