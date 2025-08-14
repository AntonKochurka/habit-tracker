import { Provider } from "react-redux"
import { RouterProvider } from "react-router-dom"

import { router } from "@shared/router"
import { store } from "@shared/store"

function App() {
  return (
    <Provider store={store}>
      <RouterProvider router={router}/>
    </Provider>
  )
}

export default App
