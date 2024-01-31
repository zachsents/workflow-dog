import { Button, Card, Tooltip } from "@nextui-org/react"
import { plural } from "@web/modules/grammar"
import { useDefinition, useDisabled, useNodeColors } from "@web/modules/workflow-editor/graph/nodes"
import classNames from "classnames"
import _ from "lodash"
import { useNodeId, useReactFlow, useStore } from "reactflow"
import ActionNodeModal from "./ActionNodeModal"


export default function ActionNodeShell({ children }) {

    const rf = useReactFlow()
    const nodeId = useNodeId()

    const definition = useDefinition()
    const nodeColors = useNodeColors(undefined, "css")

    const isSelected = useStore(s => s.nodeInternals.get(nodeId).selected)

    const [disabled, upstreamDisabled, , disabledMessage] = useDisabled()
    const isDisabled = upstreamDisabled || disabled

    const runErrors = useStore(s => s.selectedRun?.errors?.filter(error => error.node == nodeId), _.isEqual)
    const hasRunErrors = runErrors?.length > 0

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
                        className={classNames("rounded-xl transition-transform", {
                            "outline outline-2 outline-primary-300 outline-offset-2 scale-105": isSelected,
                            "hover:outline hover:outline-2 hover:outline-primary-200 hover:outline-offset-2": !isSelected,
                            "opacity-40": isDisabled,
                        })}
                        onDoubleClick={() => rf.fitView({
                            nodes: [{ id: nodeId }],
                            padding: 2.5,
                            duration: 500,
                        })}
                    >
                        {children}

                        {hasRunErrors &&
                            <Tooltip placement="bottom" color="danger" closeDelay={0} content={
                                <div className="flex flex-col gap-1 items-stretch">
                                    {runErrors.map((error, i) =>
                                        <p className="text-white font-bold" key={i}>
                                            {error.message}
                                        </p>
                                    )}
                                </div>
                            }>
                                <div className="absolute left-1/2 top-full -translate-x-1/2 mt-xs ">
                                    <Button
                                        className="border-solid border-1 border-red"
                                        color="red" size="sm" compact variant="light"
                                    >
                                        {runErrors.length} {plural("error", runErrors.length)}
                                    </Button>
                                </div>
                            </Tooltip>}
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