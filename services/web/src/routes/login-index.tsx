import { IconBrandGoogleFilled, IconLoader3 } from "@tabler/icons-react"
import { useMutation } from "@tanstack/react-query"
import { Button } from "@ui/button"
import TI from "@web/components/tabler-icon"
import { getGoogleSignInUrl, useIsLoggedIn } from "@web/lib/auth"


export default function LoginIndex() {

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
                className="flex-center gap-2"
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