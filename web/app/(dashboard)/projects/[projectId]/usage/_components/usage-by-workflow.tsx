import { Card } from "@web/components/ui/card"
import { Fragment } from "react"


export default async function UsageByWorkflow() {
    return (
        <Card className="p-6 flex-v items-stretch gap-8 shadow-lg h-full">
            <p className="font-bold text-lg">
                Usage by Workflow
            </p>

            <div className="grid grid-cols-[min-content_auto] gap-x-8 gap-y-2 items-center">
                {Array(8).fill(null).map((_, i) =>
                    <Fragment key={i}>
                        <div>
                            <p className="text-nowrap">
                                Workflow {i + 1}
                            </p>
                            <p className="text-muted-foreground text-sm text-nowrap">
                                {Math.floor(Math.random() * 100)} runs
                            </p>
                        </div>
                        <div
                            className="h-6 bg-violet-600 rounded-sm"
                            style={{
                                width: `${Math.floor(Math.random() * 100)}%`,
                                opacity: Math.max(0.25, 1 - i * 0.15),
                            }}
                        />
                    </Fragment>
                )}
            </div>
        </Card>
    )
}