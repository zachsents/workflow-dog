import { Button } from "@ui/button"
import { getSession } from "@web/lib/server/auth"
import Logo from "@web/public/logo.svg"
import Link from "next/link"
import { redirect } from "next/navigation"
import { TbArrowLeft } from "react-icons/tb"
import { GoogleSignIn } from "./_components/google-signin"


export default async function LoginPage() {

    if (await getSession())
        return redirect("/projects")

    return (
        <div className="w-screen h-screen flex items-stretch p-4 bg-slate-200 bg-dots">
            <div className="w-1/2 bg-primary rounded-xl p-4 flex-v center relative">
                <Logo className="w-auto h-20" />

                <div className="absolute bottom-8">
                    <p className="text-primary-foreground text-center text-xl font-bold ">
                        WorkflowDog
                    </p>
                    <p className="text-primary-foreground text-center opacity-75">
                        Automation for power users
                    </p>
                </div>

                <Button
                    asChild variant="link"
                    className="absolute top-2 left-0 text-primary-foreground opacity-75 hover:opacity-100 transition-opacity text-xs"
                >
                    <Link href="https://workflow.dog">
                        <TbArrowLeft className="mr-2" />
                        Back to landing page
                    </Link>
                </Button>
            </div>
            <div className="flex-1 flex flex-col justify-center items-center p-12 relative">
                <form className="flex-v justify-center items-stretch gap-2 max-w-sm">
                    <h1 className="text-center text-2xl font-bold">
                        Welcome!
                    </h1>
                    <p className="text-center text-sm text-muted-foreground mb-6">
                        If you don't have an account, one will be created for you. Google sign-in is the only supported option for now.
                    </p>

                    {/* <Label className="sr-only" htmlFor="email">
                        Email
                    </Label>
                    <Input
                        id="email"
                        placeholder="name@example.com"
                        type="email"
                        autoCapitalize="none"
                        autoComplete="email"
                        autoCorrect="off"
                    //   disabled={isLoading}
                    /> */}

                    <GoogleSignIn />
                </form>

                <p className="text-center text-xs text-muted-foreground absolute bottom-4 max-w-xs left-1/2 -translate-x-1/2">
                    By signing in, you agree to our{" "}
                    <Link
                        href="https://workflow.dog/terms.html"
                        target="_blank"
                        className="hover:underline"
                    >
                        Terms of Service
                    </Link>
                    {" "}and{" "}
                    <Link
                        href="https://workflow.dog/privacy.html"
                        target="_blank"
                        className="hover:underline"
                    >
                        Privacy Policy
                    </Link>.
                </p>
            </div>
        </div>
    )
}