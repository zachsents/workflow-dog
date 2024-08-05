import { useRouteError } from "react-router-dom"
import { Card } from "./ui/card"
import { Button } from "./ui/button"
import TI from "./tabler-icon"
import { IconArrowLeft } from "@tabler/icons-react"

export default function ErrorPage() {
    const error = useRouteError() as any
    console.error(error)

    return (
        <div className="bg-gray-200 w-screen h-screen flex flex-col items-center justify-center gap-4 text-center">
            <h1 className="text-2xl font-bold">Oops!</h1>
            <p>
                Looks like something went wrong.
            </p>
            <Card className="font-mono text-sm p-4 max-w-sm w-full text-red-700">
                {(error.statusText || error.data) && <>
                    <p className="font-semibold">
                        {error.statusText}
                    </p>
                    <p>
                        {error.data}
                    </p>
                </>}

                {error.message && <p>{error.message}</p>}
            </Card>
            <Button
                className="flex-center gap-2"
                onClick={() => void window.history.back()}
            >
                <TI>
                    <IconArrowLeft />
                </TI>
                <span>Go back</span>
            </Button>
        </div>
    )
}