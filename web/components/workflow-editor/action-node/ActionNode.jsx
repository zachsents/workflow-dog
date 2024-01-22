import { useDefinition, useDisabled, useNodeColors, useUpdateInternals } from "@web/modules/workflow-editor/graph/nodes"
import classNames from "classnames"
import { forwardRef, useEffect, useMemo } from "react"
import { useNodeId, useStore } from "reactflow"
import ActionNodeHandle from "../ActionNodeHandle"
// import CheckableMenuItem from "./CheckableMenuItem"
import NodeModifierWrapper from "../NodeModifierWrapper"
// import ConfigureNodeModal from "./config-modal/ConfigureNodeModal"
import { Button, Card, CardHeader, Tooltip } from "@nextui-org/react"
import { plural } from "@web/modules/grammar"
import { stringHash } from "@web/modules/util"
import _ from "lodash"
import Group from "../../layout/Group"
import ActionNodeHeader from "./ActionNodeHeader"
import ActionNodeModal, { ConfigComponent } from "./ActionNodeModal"


export default function ActionNode({ id, data, selected }) {

    const definition = useDefinition()

    // const hasValidationErrors = useNodeHasValidationErrors(id)

    const shownInputs = useMemo(() => data.inputs?.filter(
        input => input.mode == "handle" &&
            !input.hidden
    ), [data.inputs])

    const shownOutputs = useMemo(() => data.outputs?.filter(
        output => !output.hidden
    ), [data.outputs])

    const [_disabled, upstreamDisabled, , disabledMessage] = useDisabled(id)
    const disabled = upstreamDisabled || _disabled

    const selectedRun = useStore(s => s.selectedRun)
    const runErrors = selectedRun?.errors?.filter(error => error.node == id)
    const hasRunErrors = runErrors?.length > 0

    const nodeColors = useNodeColors(undefined, "css")

    useUpdateInternalsWhenNecessary()

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
                            "outline outline-2 outline-primary-300 outline-offset-2 scale-105": selected,
                            "hover:outline hover:outline-2 hover:outline-primary-200 hover:outline-offset-2": !selected,
                            "opacity-40": disabled,
                        })}
                    >
                        <NodeModifierWrapper>
                            <Card className={classNames("!transition rounded-xl border border-gray-800 overflow-visible min-w-[12rem] max-w-[20rem]",
                                selected ? "shadow-xl" : "shadow-md",
                            )}>
                                <CardHeader className="p-0 rounded-t-xl bg-[var(--dark-color)]">
                                    <ActionNodeHeader withSettings />
                                </CardHeader>
                                <Group
                                    className="justify-between items-stretch flex-nowrap py-unit-xs"
                                >
                                    <Group className="flex-1 flex-col justify-center !items-start gap-2 -ml-2">
                                        {shownInputs?.map(input =>
                                            <ActionNodeHandle {...input} type="target" key={input.id} />
                                        )}
                                    </Group>

                                    <div className="grow px-4">
                                        {definition.renderBody &&
                                            <definition.renderBody id={id} />}

                                        {Object.entries(definition.inputs).filter(([, inputDef]) => inputDef.renderInBody).map(([inputDefId, inputDef]) =>
                                            <div key={inputDefId}>
                                                <p className="font-bold text-xs">
                                                    {inputDef.name}
                                                </p>
                                                <ConfigComponent
                                                    input={data.inputs.find(i => i.definition == inputDefId)}
                                                    definition={inputDef}
                                                />
                                            </div>
                                        )}

                                    </div>

                                    <Group className="flex-1 flex-col justify-center !items-end gap-2 -mr-2">
                                        {shownOutputs?.map(output =>
                                            <ActionNodeHandle {...output} type="source" key={output.id} />
                                        )}
                                    </Group>
                                </Group>
                            </Card>
                        </NodeModifierWrapper>

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
                <Fallback />}
        </div>
    )
}


function Fallback() {
    return (
        <p className="w-40 shadow-sm bg-gray-100 rounded p-xs" ta="center">
            This node is having problems.
        </p>
    )
}


function useUpdateInternalsWhenNecessary() {
    const nodeId = useNodeId()

    const updateInternals = useUpdateInternals()

    const handlesHash = useStore(s => {
        const node = s.nodeInternals.get(nodeId)
        return stringHash([
            node.data.inputs?.map(input => _.pick(input, ["id", "hidden", "mode"])),
            node.data.outputs?.map(output => _.pick(output, ["id", "hidden"])),
            node.data.modifier?.id,
        ])
    })

    useEffect(() => {
        updateInternals()
    }, [handlesHash])

    const selected = useStore(s => s.nodeInternals.get(nodeId)?.selected)

    useEffect(() => {
        const intervalId = setInterval(() => {
            updateInternals()
        }, 75)

        const cleanup = () => clearInterval(intervalId)
        setTimeout(cleanup, 400)
        return cleanup
    }, [selected])
}


const ToolbarIcon = forwardRef(({ icon: Icon, className, ...props }, ref) =>
    <Button
        size="sm" variant="light" isIconOnly
        className={classNames("nodrag text-white", className)}
        {...props}
        ref={ref}
    >
        <Icon />
    </Button>
)
ToolbarIcon.displayName = "ToolbarIcon"