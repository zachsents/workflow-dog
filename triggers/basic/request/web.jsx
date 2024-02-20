import { Checkbox, Snippet } from "@nextui-org/react"
import { useApiMutation } from "@web/modules/api"
import { TbLink } from "react-icons/tb"
import colors from "tailwindcss/colors"
import { useState, useEffect } from "react"


export default {
    icon: TbLink,
    color: colors.gray[800],
    renderConfig: ({ workflowId, workflow }) => {

        const [waitUntilFinished, setWaitUntilFinished] = useState(workflow?.trigger?.config?.waitUntilFinished || false)

        const updateTriggerConfig = useApiMutation(`workflows/${workflowId}/trigger`, {
            method: "PATCH",
            invalidateQueries: ["workflow", workflowId],
        })

        useEffect(() => {
            if (updateTriggerConfig.isPending || workflow?.trigger?.config?.waitUntilFinished === waitUntilFinished)
                return

            const debugMessage = `Saving waitUntilFinished trigger setting: ${waitUntilFinished}`
            console.time(debugMessage)

            updateTriggerConfig.mutateAsync({
                config: {
                    waitUntilFinished
                },
            }).then(() => {
                console.timeEnd(debugMessage)
            })
        }, [waitUntilFinished])

        return (
            <div className="flex flex-col items-stretch gap-unit-lg mt-unit-md">
                <div className="flex flex-col gap-unit-xs">
                    <p className="font-bold">
                        Workflow URL:
                    </p>
                    <Snippet
                        size="sm"
                        symbol=""
                        tooltipProps={{
                            closeDelay: 0,
                        }}
                        classNames={{
                            base: "max-w-full",
                            pre: "text-ellipsis line-clamp-1",
                        }}
                    >
                        {`${process.env.NEXT_PUBLIC_API_URL}/workflows/${workflowId}/trigger/request`}
                    </Snippet>
                </div>

                <div className="flex flex-col gap-unit-xs">
                    <p className="font-bold">
                        Settings:
                    </p>
                    <Checkbox
                        size="sm"
                        isSelected={waitUntilFinished}
                        onValueChange={setWaitUntilFinished}
                    // isDisabled={updateTriggerConfig.isPending}
                    >
                        Wait until the workflow finishes running
                    </Checkbox>
                </div>
            </div>
        )
    },
}