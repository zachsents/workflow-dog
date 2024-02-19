import { Checkbox, Snippet } from "@nextui-org/react"
import { useDatabaseMutation } from "@web/modules/db"
import _ from "lodash"
import { TbLink } from "react-icons/tb"
import colors from "tailwindcss/colors"


export default {
    icon: TbLink,
    color: colors.gray[800],
    renderConfig: ({ workflowId, workflow }) => {

        const updateWaitUntilFinished = useDatabaseMutation(
            (supa, value) => supa.from("workflows").update({
                trigger: _.merge({}, workflow?.trigger, {
                    config: {
                        waitUntilFinished: value,
                    }
                })
            }).eq("id", workflowId),
            {
                enabled: !!workflowId,
                invalidateKey: ["workflow", workflowId],
            }
        )

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
                        isSelected={workflow?.trigger?.config?.waitUntilFinished}
                        onValueChange={updateWaitUntilFinished.mutate}
                        isDisabled={updateWaitUntilFinished.isPending}
                    >
                        Wait until the workflow finishes running
                    </Checkbox>
                </div>
            </div>
        )
    },
}