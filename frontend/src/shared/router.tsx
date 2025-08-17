import { createBrowserRouter } from "react-router-dom";
import Layout from "./components/layout";

export let router = createBrowserRouter([
    {
        path: "/",
        element: <Layout/>, 
        children: [
            {
                path: "auth",
                children: [
                    {path: "signup", element: <>Signup</>},
                    {path: "signin", element: <>Signin</>}
                ]
            }
        ]
    }
])