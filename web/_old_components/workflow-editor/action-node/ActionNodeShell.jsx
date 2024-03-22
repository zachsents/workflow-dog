import { Card, Chip, Tooltip } from "@nextui-org/react"
import { useDefinition, useDisabled, useNodeColors } from "@web/modules/workflow-editor/graph/nodes"
import { useSelectedWorkflowRun } from "@web/modules/workflows"
import classNames from "classnames"
import { useMemo } from "react"
import { useNodeId, useStore } from "reactflow"
import ActionNodeModal from "./ActionNodeModal"
import { TbExclamationCircle } from "react-icons/tb"


export default function ActionNodeShell({ children }) {

    const nodeId = useNodeId()

    const definition = useDefinition()
    const nodeColors = useNodeColors(undefined, "css")

    const isSelected = useStore(s => s.nodeInternals.get(nodeId).selected)

    const [disabled, upstreamDisabled, , disabledMessage] = useDisabled()
    const isDisabled = upstreamDisabled || disabled

    const { data: selectedRun } = useSelectedWorkflowRun()
    const [hasRunError, runError] = useMemo(() => {
        const errors = selectedRun?.state?.errors ?? {}
        return [nodeId in errors, errors[nodeId]]
    }, [selectedRun?.state?.errors, nodeId])

    return (
        <div
            className="relative"
            style={nodeColors}
        >
            {definition ? <>
                <Tooltip
                    content={disabledMessage} isDisabled={!disabledMessage} placement="bottom"
                    className="max-w-[16-rem]" closeDelay={0}
                >
                    <div
                        className={classNames("rounded-lg transition-transform", {
                            "outline outline-2 outline-primary-300 outline-offset-4 scale-105": isSelected,
                            "hover:outline hover:outline-2 hover:outline-primary-200 hover:outline-offset-4": !isSelected,
                            "opacity-40": isDisabled,
                        })}
                    >
                        {children}

                        {hasRunError &&
                            <div className="absolute left-1/2 top-full -translate-x-1/2 mt-unit-xs max-w-full">
                                <Tooltip
                                    closeDelay={0} content={runError} placement="bottom"
                                    classNames={{ content: "max-w-[20rem]" }}
                                >
                                    <Chip
                                        color="danger" size="sm" aria-multiline
                                        startContent={<TbExclamationCircle />}
                                        className="px-unit-sm pointer-events-auto cursor-default"
                                    >
                                        Hover to view error
                                    </Chip>
                                </Tooltip>
                            </div>}
                    </div >
                </Tooltip>
                <ActionNodeModal />
            </> :
                <Card>
                    <p className="w-40 shadow-sm bg-gray-100 rounded p-xs" ta="center">
                        This node is having problems.
                    </p>
                </Card>}
        </div>
    )
}