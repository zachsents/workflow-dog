import { IconArrowLeft } from "@tabler/icons-react"
import { Button } from "@ui/button"
import TI from "@web/components/tabler-icon"
import { useIsLoggedIn } from "@web/lib/auth"
import { useEffect } from "react"
import { Outlet, useNavigate } from "react-router-dom"


export default function LoginRoot() {

    const navigate = useNavigate()

    const { data: isLoggedIn } = useIsLoggedIn()

    useEffect(() => {
        if (isLoggedIn === true)
            navigate("/projects", { replace: true })
    }, [isLoggedIn === true])

    return (
        <div className="w-screen h-screen grid grid-cols-2 p-4 bg-gray-200 bg-dots">
            <div className="bg-primary rounded-xl p-4 grid place-items-center relative">
                <img
                    className="w-auto h-20"
                    src="/logo.svg"
                />

                <div className="absolute bottom-8">
                    <p className="text-primary-foreground text-center text-xl font-bold ">
                        WorkflowDog
                    </p>
                    <p className="text-primary-foreground text-center opacity-75">
                        Automation for power users
                    </p>
                </div>

                <Button
                    variant="link" asChild
                    className="absolute top-2 left-0 text-primary-foreground opacity-75 hover:opacity-100 transition-opacity text-xs gap-2"
                >
                    <a href="/">
                        <TI><IconArrowLeft /></TI>
                        Back to landing page
                    </a>
                </Button>
            </div>
            <div className="grid place-items-center p-12 relative text-center">
                <Outlet />
            </div>
        </div>
    )
}