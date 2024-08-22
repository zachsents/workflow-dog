import { useLocalStorageValue } from "@react-hookz/web"
import { IconArrowLeft, IconBrandGoogleFilled } from "@tabler/icons-react"
import { useMutation } from "@tanstack/react-query"
import { Button } from "@ui/button"
import SpinningLoader from "@web/components/spinning-loader"
import TI from "@web/components/tabler-icon"
import { getGoogleSignInUrl, useIsLoggedIn } from "@web/lib/auth"
import { useEffect } from "react"
import { Helmet } from "react-helmet"
import { useNavigate, useSearchParams } from "react-router-dom"


function LoginIndex() {

    const navigate = useNavigate()

    const { data: isLoggedIn, isSuccess: isSessionLoaded } = useIsLoggedIn()
    useEffect(() => {
        if (isLoggedIn === true)
            navigate("/projects", { replace: true })
    }, [isLoggedIn === true])

    const signIn = useMutation({
        mutationFn: async (email?: string) => {
            const url = await getGoogleSignInUrl(email)
            window.location.assign(url)
        },
    })

    const returnTo = useSearchParams()[0].get("return_to")
    useEffect(() => {
        if (returnTo) localStorage.setItem("login_return_to", returnTo)
        else localStorage.removeItem("login_return_to")
    }, [returnTo])

    const { value: lastLogin } = useLocalStorageValue<string>("last_google_login", {
        parse: s => s,
    })

    return <>
        <Helmet>
            <title>Sign In - WorkflowDog</title>
        </Helmet>
        <div className="w-screen h-screen grid grid-cols-2 p-4 bg-white bg-dots" style={{
            "--dots-color": "var(--color-gray-200)",
        } as any}>
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
                <form className="grid gap-2 max-w-sm">
                    <h1 className="text-2xl font-bold">
                        Welcome!
                    </h1>
                    <p className="text-sm text-muted-foreground mb-6">
                        If you don't have an account, one will be created for you. Google sign-in is the only supported option for now.
                    </p>

                    {(signIn.isPending || signIn.isSuccess || isLoggedIn || !isSessionLoaded)
                        ? <SpinningLoader />
                        : <>
                            <Button
                                variant="outline" type="button" className="gap-2"
                                onClick={() => void signIn.mutate(undefined)}
                            >
                                <TI><IconBrandGoogleFilled /></TI>
                                Sign in with Google
                            </Button>

                            {lastLogin && <Button
                                variant="ghost" type="button" className="gap-2"
                                onClick={() => void signIn.mutate(lastLogin)}
                            >
                                Sign in as {lastLogin}
                            </Button>}
                        </>}
                </form>

                <p className="text-xs text-muted-foreground absolute bottom-4 max-w-xs left-1/2 -translate-x-1/2 hover:[&_a]:underline">
                    By signing in, you agree to our <a href="/terms" target="_blank">Terms of Service</a> and <a href="/privacy" target="_blank">Privacy Policy</a>.
                </p>
            </div>
        </div>
    </>
}

const Login = { Index: LoginIndex }
export default Login