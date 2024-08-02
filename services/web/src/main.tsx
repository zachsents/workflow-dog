import { StrictMode } from "react"
import ReactDOM from "react-dom/client"
import {
    RouterProvider
} from "react-router-dom"
import "./index.css"
import { router } from "./router"
import { enableMapSet } from "immer"

enableMapSet()

ReactDOM.createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>,
)
