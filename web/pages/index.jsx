import { Button } from "@nextui-org/react"
import { useMustBeSignedIn } from "@web/modules/auth"
import { supabase } from "@web/modules/supabase"


export default function IndexPage() {

    useMustBeSignedIn()

    return (
        <>
            <Button onClick={() => supabase.auth.signOut()}>
                Sign Out
            </Button>
        </>
    )
}
