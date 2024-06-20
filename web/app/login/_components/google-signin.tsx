"use client"

import { useMutation } from "@tanstack/react-query"
import { Button } from "@ui/button"
import { signIn } from "next-auth/react"
import { TbBrandGoogleFilled, TbLoader3 } from "react-icons/tb"

export function GoogleSignIn() {

    const { mutate: startGoogleSignIn, isPending, isSuccess } = useMutation({
        mutationFn: () => signIn("google", { callbackUrl: "/projects" }),
    })

    return (
        <Button
            variant="outline" type="button"
            onClick={() => void startGoogleSignIn()}
            className="flex center gap-2"
        >
            {(isPending || isSuccess)
                ? <TbLoader3 className="animate-spin" />
                : <TbBrandGoogleFilled />}
            Sign in with Google
        </Button>
    )
}
