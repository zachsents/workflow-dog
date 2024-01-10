import { Button, Divider, Input, Link } from "@nextui-org/react"
import { useMutation } from "@tanstack/react-query"
import { useMustNotBeSignedIn } from "@web/modules/auth"
import { useForm } from "@web/modules/form"
import { useNotifications } from "@web/modules/notifications"
import { supabase } from "@web/modules/supabase"
import siteInfo from "@web/site-info.json"
import { useRouter } from "next/router"
import { useEffect } from "react"
import { FcGoogle } from "react-icons/fc"
import { TbAlertTriangle, TbArrowRight } from "react-icons/tb"


export default function LoginForm({ register = false }) {

    const router = useRouter()

    const { notify } = useNotifications()

    const form = useForm({
        initial: {
            email: "",
            password: "",
        },
        validate: {
            email: val => !val.trim() && "Email is required",
            password: val => !val.trim() && "Password is required",
        },
    })

    const onError = err => {
        notify({
            title: "There was a problem signing in.",
            message: err.message,
            classNames: {
                icon: "!bg-danger-500",
            },
            icon: <TbAlertTriangle />,
        })
    }

    const emailSignInMutation = useMutation({
        mutationFn: async ({ email, password }) => {
            const { error } = register ?
                await supabase.auth.signUp({ email, password }) :
                await supabase.auth.signInWithPassword({ email, password })

            if (error)
                throw new Error(error.message)
        },
        onSuccess: () => router.push(siteInfo.sendLoggedInUsersTo),
        onError,
    })

    const googleSignInMutation = useMutation({
        mutationFn: async () => {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: location.protocol + '//' + location.host + location.pathname,
                },
            })

            if (error)
                throw new Error(error.message)
        },
    })

    const isLoggingInWithGoogle = googleSignInMutation.isLoading || googleSignInMutation.isSuccess
    const isLoggingInWithEmail = emailSignInMutation.isLoading || emailSignInMutation.isSuccess
    useMustNotBeSignedIn(
        !isLoggingInWithGoogle &&
        !isLoggingInWithEmail &&
        siteInfo.sendLoggedInUsersTo
    )

    useEffect(() => {
        if (router.query?.error)
            onError({ message: router.query.error_description || router.query.error })
    }, [router.query])

    return (
        <>
            <h3 className="text-xl font-medium text-center">
                {register ? "Register for an account" : "Sign in to your account"}
            </h3>
            <p className="text-small text-center text-default-500">
                {register ? <>
                    Already have an account? <Link href="/login" className="text-small">Sign in.</Link>
                </> : <>
                    Don't have an account? <Link href="/register" className="text-small">Sign up now.</Link>
                </>}
            </p>

            <form
                onSubmit={form.submit(values => emailSignInMutation.mutate(values))}
                className="flex flex-col items-stretch gap-unit-md"
            >
                <Input
                    type="email" label="Email" size="sm" name="email"
                    {...form.inputProps("email", { required: true })}
                    isRequired={false}
                    isDisabled={googleSignInMutation.isLoading}
                />
                <Input
                    type="password" label="Password" size="sm" name="password" required
                    {...form.inputProps("password", { required: true })}
                    isRequired={false}
                    isDisabled={googleSignInMutation.isLoading}
                />

                {!register &&
                    <Link href="/forgot-password" className="text-small self-end">
                        Forgot password?
                    </Link>}

                <Button
                    className="group"
                    color="primary"
                    endContent={<TbArrowRight className="group-hover:translate-x-1 transition-transform" />}
                    isLoading={emailSignInMutation.isLoading}
                    isDisabled={googleSignInMutation.isLoading}
                    type="submit"
                >
                    {register ? "Sign Up" : "Sign In"}
                </Button>
            </form>

            <div className="flex items-center gap-unit-sm justify-between my-4">
                <Divider className="flex-1" />
                <p className="text-small text-default-500">
                    or continue with
                </p>
                <Divider className="flex-1" />
            </div>

            <Button
                variant="bordered" className="group"
                startContent={<FcGoogle />}
                onClick={googleSignInMutation.mutate}
                isLoading={googleSignInMutation.isLoading}
                isDisabled={emailSignInMutation.isLoading}
            >
                Sign In with Google
            </Button>
        </>
    )
}