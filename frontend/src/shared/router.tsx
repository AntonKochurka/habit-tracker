import { createBrowserRouter } from "react-router-dom";
import Layout from "./components/layout";
import SignUp from "@app/auth/pages/signup";

export let router = createBrowserRouter([
    {
        path: "/",
        element: <Layout/>, 
        children: [
            {
                path: "auth",
                children: [
                    {path: "signup", element: <SignUp/>},
                    {path: "signin", element: <>Signin</>}
                ]
            }
        ]
    }
])