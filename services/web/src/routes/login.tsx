import { IconArrowLeft, IconBrandGoogleFilled, IconLoader3 } from "@tabler/icons-react"
import { useMutation } from "@tanstack/react-query"
import { Button } from "@ui/button"
import TI from "@web/components/tabler-icon"
import { getGoogleSignInUrl, handleGoogleCallback, useIsLoggedIn } from "@web/lib/auth"
import { useOnceEffect } from "@web/lib/hooks"
import { useEffect } from "react"
import { Outlet, useNavigate } from "react-router-dom"
import { Helmet } from "react-helmet"


// #region Layout
function Layout() {

    const navigate = useNavigate()

    const { data: isLoggedIn } = useIsLoggedIn()

    useEffect(() => {
        if (isLoggedIn === true)
            navigate("/projects", { replace: true })
    }, [isLoggedIn === true])

    return (<>
        <Helmet>
            <title>Sign In - WorkflowDog</title>
        </Helmet>
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
    </>)
}


// #region Index
function Index() {

    const { data: isLoggedIn, isSuccess: isSessionLoaded } = useIsLoggedIn()

    const signIn = useMutation({
        mutationFn: async () => {
            const url = await getGoogleSignInUrl()
            window.location.assign(url)
        },
    })

    return (<>
        <form className="flex flex-col justify-center items-stretch gap-2 max-w-sm">
            <h1 className="text-2xl font-bold">
                Welcome!
            </h1>
            <p className="text-sm text-muted-foreground mb-6">
                If you don't have an account, one will be created for you. Google sign-in is the only supported option for now.
            </p>

            <Button
                variant="outline" type="button"
                disabled={
                    signIn.isPending
                    || signIn.isSuccess
                    || isLoggedIn
                    || !isSessionLoaded
                }
                onClick={() => void signIn.mutate()}
                className="gap-2"
            >
                <TI>
                    {(signIn.isPending || signIn.isSuccess)
                        ? <IconLoader3 className="animate-spin" />
                        : <IconBrandGoogleFilled />}
                </TI>
                Sign in with Google
            </Button>
        </form>

        <p className="text-xs text-muted-foreground absolute bottom-4 max-w-xs left-1/2 -translate-x-1/2">
            By signing in, you agree to our{" "}
            <a
                href="/terms"
                target="_blank"
                className="hover:underline"
            >
                Terms of Service
            </a>
            {" "}and{" "}
            <a
                href="/privacy"
                target="_blank"
                className="hover:underline"
            >
                Privacy Policy
            </a>.
        </p>
    </>)
}


// #region Callback
function Callback() {

    useOnceEffect(() => {
        handleGoogleCallback()
            .then(async user => {
                console.debug("User signed in:", user.emails[0], user)
                window.location.replace("/app")
            })
            .catch(err => {
                console.error(err)
                window.location.replace(
                    err.message ? `/login?tm=${err.message}` : "/login"
                )
            })
    })

    return (
        <div className="grid place-items-center gap-4">
            <p>
                Signing you in...
            </p>
            <div className="text-xl">
                <TI><IconLoader3 className="animate-spin" /></TI>
            </div>
        </div>
    )
}


const Login = { Index, Callback, Layout }
export default Login