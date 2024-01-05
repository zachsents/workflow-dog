import { Button } from "@nextui-org/react"
import { signOut, useMustBeSignedIn } from "@web/modules/firebase"


export default function IndexPage() {

    useMustBeSignedIn()

    return (
        <>
            <Button onClick={signOut}>
                Sign Out
            </Button>
        </>
    )
}
