import { Toaster } from "@ui/sonner"
import ParamToaster from "@web/components/param-toaster"
import { Providers } from "@web/components/providers"
import { Outlet } from "react-router-dom"

export default function Root() {
    return (<>
        <Providers>
            <Outlet />
        </Providers>
        <Toaster toastOptions={{
            descriptionClassName: "text-muted-foreground",
            duration: 3000,
        }} />
        <ParamToaster />
    </>)
}