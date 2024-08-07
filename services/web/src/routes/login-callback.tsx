import { IconLoader3 } from "@tabler/icons-react"
import TI from "@web/components/tabler-icon"
import { handleGoogleCallback } from "@web/lib/auth"
import { useOnceEffect } from "@web/lib/hooks"


export default function LoginCallback() {

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
                <TI>
                    <IconLoader3 className="animate-spin" />
                </TI>
            </div>
        </div>
    )
}