"use client"

import { useMutation } from "@tanstack/react-query"
import { Button } from "@web/components/ui/button"
import { useErrorRedirect } from "@web/lib/client/router"
import { useSupabaseBrowser } from "@web/lib/client/supabase"
import { TbBrandGoogleFilled, TbLoader3 } from "react-icons/tb"


export function GoogleSignIn() {

    const errorRedirect = useErrorRedirect()
    const supabase = useSupabaseBrowser()

    const googleSignInMutation = useMutation({
        mutationFn: async () => {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: location.protocol + '//' + location.host + "/login/callback",
                },
            })

            if (error)
                errorRedirect(error.message)
        },
    })

    const isLoading = googleSignInMutation.isPending || googleSignInMutation.isSuccess

    return (
        <Button
            variant="outline" type="button"
            onClick={() => googleSignInMutation.mutate()}
        >
            {isLoading
                ? <TbLoader3 className="animate-spin mr-2" />
                : <TbBrandGoogleFilled className="mr-2" />}
            Sign in with Google
        </Button>
    )
}