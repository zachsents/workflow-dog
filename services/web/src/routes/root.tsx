import { Toaster } from "@ui/sonner"
import ParamToaster from "@web/components/param-toaster"
import { Providers } from "@web/components/providers"
import { Outlet, useNavigate, type NavigateFunction, type NavigateOptions } from "react-router-dom"

declare global {
    interface Window {
        rr: {
            redirect: (url: string, opts?: NavigateOptions) => Promise<void>
            replace: (url: string, opts?: NavigateOptions) => Promise<void>
        }
    }
}

let _resolveNavigate: () => void
const _navigateReady = new Promise<void>(resolve => {
    _resolveNavigate = resolve
})
let _navigate: NavigateFunction

window.rr = {
    redirect: async (url, opts) => {
        await _navigateReady
        _navigate(url, opts)
    },
    replace: async (url, opts) => {
        await _navigateReady
        _navigate(url, { ...opts, replace: true })
    },
}

export default function Root() {
    _navigate = useNavigate()
    _resolveNavigate()

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