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
            <Card className="font-mono text-sm p-4 max-w-xl w-full text-red-700">
                {(error.statusText || error.data) && <>
                    <p className="font-semibold">
                        {error.statusText}
                    </p>
                    {typeof error.data === "string"
                        ? <p>{error.data}</p>
                        : <p className="whitespace-pre-wrap text-left">
                            {JSON.stringify(error.data, null, 2)}
                        </p>}
                </>}

                {error.message && <p>{error.message}</p>}
            </Card>
            <Button
                className="gap-2"
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