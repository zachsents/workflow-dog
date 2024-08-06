import { StrictMode } from "react"
import ReactDOM from "react-dom/client"
import { RouterProvider } from "react-router-dom"
import "./index.css"
import { router } from "./router"
import { enableMapSet } from "immer"
import { isMotionValue, motionValue, MotionValue } from "framer-motion"
import SuperJSON from "superjson"

// Enable Map and Set support in Immer
enableMapSet()

// Enable special types support in SuperJSON
SuperJSON.registerCustom<MotionValue, number | string>({
    isApplicable: isMotionValue,
    serialize: v => v.get(),
    deserialize: v => motionValue(v),
}, "framer-motion/MotionValue")


ReactDOM.createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>,
)
