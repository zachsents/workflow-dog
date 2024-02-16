import { Button, Tooltip } from "@nextui-org/react"
import { useCreateActionNode, useDefinition } from "@web/modules/workflow-editor/graph/nodes"
import { useSelectedWorkflowRun } from "@web/modules/workflows"
import classNames from "classnames"
import { object as nodeDefs } from "nodes/web"
import { useMemo, useRef, useState } from "react"
import { TbActivity, TbArrowLeftSquare, TbArrowRight, TbArrowRightSquare, TbSparkles } from "react-icons/tb"
import { Position, Handle as RFHandle, useNodeId, useReactFlow, useStore } from "reactflow"
import util from "util"
import Group from "../../layout/Group"


export default function ActionNodeHandle({ id, name, type, definition: passedDef }) {

    const rf = useReactFlow()
    const nodeId = useNodeId()
    const nodeDefinition = useDefinition()

    const ref = useRef()

    const isSource = type === "source"

    const passedString = typeof passedDef === "string"
    let definition = passedString ? undefined : passedDef
    if (passedString) {
        switch (type) {
            case "target":
                definition = nodeDefinition?.inputs?.[passedDef]
                break
            case "source":
                definition = nodeDefinition?.outputs?.[passedDef]
                break
        }
    }

    const displayName = definition?.bullet ?
        <>&bull;</> :
        (name || (definition.named ? null : definition?.name) || <>&nbsp;</>)

    const isConnected = useStore(s => s.edges.some(edge => edge.source == nodeId && edge.sourceHandle == id || edge.target == nodeId && edge.targetHandle == id))

    const { data: selectedRun } = useSelectedWorkflowRun()
    const [hasRunValue, runValue] = useMemo(() => {
        const handleValues = Object.fromEntries(Object.values(selectedRun?.state?.outputs ?? {}).flatMap(v => Object.entries(v)))
        return [id in handleValues, handleValues[id]]
    }, [selectedRun?.state?.outputs, id])

    const runValueNeedsExpansion = typeof runValue === "object" && Object.keys(runValue).length > 1 ||
        typeof runValue === "string" && runValue.length > 100

    const isNodeSelected = useStore(s => s.nodeInternals.get(nodeId).selected)

    const createNode = useCreateActionNode()
    const addRecommended = () => {
        const handleRect = ref.current.getBoundingClientRect()
        const newNodePos = rf.screenToFlowPosition({
            x: handleRect.left + handleRect.width / 2,
            y: handleRect.top + handleRect.height / 2 - rf.getNode(nodeId).height / 2,
        })
        newNodePos.x += isSource ? 200 : -500

        const { definition: newDef, ...newData } = definition.recommendedNode.data

        createNode({
            definition: newDef,
            position: newNodePos,
            data: newData,
            connect: [isSource ? {
                source: nodeId,
                sourceHandle: id,
                targetHandleType: definition.recommendedNode.handle,
            } : {
                target: nodeId,
                targetHandle: id,
                sourceHandleType: definition.recommendedNode.handle,
            }],
        })
    }

    const [isHovered, setIsHovered] = useState(false)

    return (
        <div
            className="relative group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            ref={ref}
        >
            <RFHandle
                id={id}
                type={type}
                position={type == "target" ? Position.Left : Position.Right}
                className={classNames(
                    "!relative !transform-none !inset-0 !w-auto !h-auto flex !rounded-full !border-solid !border-1 transition-colors hover:!text-[var(--dark-color)] hover:!bg-[var(--light-color)] hover:!border-[var(--dark-color)]",
                    isConnected ?
                        "!bg-[var(--light-color)] !border-[var(--dark-color)] !text-[var(--dark-color)]" :
                        "!bg-gray-50 !border-gray-300",
                )}
            >
                <Group
                    className={classNames("flex-nowrap w-full pointer-events-none gap-1 px-3", {
                        "flex-row-reverse": isSource,
                    })}
                >
                    {/* {definition.showHandleIcon && definition.icon &&
                                <definition.icon size="0.7rem" color="currentColor" />} */}

                    {isConnected && <TbArrowRight className={classNames(
                        "text-xs",
                        isSource ? "-mr-2" : "-ml-2",
                    )} />}

                    <p className="text-[0.625rem] text-current line-clamp-1">
                        {displayName}
                    </p>
                </Group>
                {selectedRun && isSource && hasRunValue &&
                    <div className="absolute top-1/2 -translate-y-1/2 nodrag left-full translate-x-2">
                        <Tooltip closeDelay={0} content={
                            <div className="flex flex-col items-stretch gap-unit-xs max-w-[20rem]">
                                <p className="text-xs text-default-500 text-center">
                                    Output From Selected Run
                                </p>
                                <p className="line-clamp-4">
                                    {typeof runValue === "string" ? runValue : <pre>{util.inspect(runValue)}</pre>}
                                </p>
                                {runValueNeedsExpansion &&
                                    <p className="text-xs text-default-500 text-center">
                                        Click to view full data
                                    </p>}
                            </div>
                        }>
                            <Button
                                isIconOnly radius="full" color="primary" size="sm"
                            // onPress={() => runValueNeedsExpansion && openDataViewerModal(`${nodeDisplayName} - ${displayName}`, runValue)}
                            >
                                <TbActivity />
                            </Button>
                        </Tooltip>
                    </div>}
            </RFHandle>

            {definition?.recommendedNode && !isConnected &&
                <div className={classNames(
                    "absolute top-1/2 -translate-y-1/2 nodrag flex justify-center items-center py-1 transition-opacity",
                    isSource ? "left-full pl-0.5 pr-4" : "right-full pr-0.5 pl-4",
                    (isNodeSelected || isHovered) ? "opacity-100" : "opacity-0",
                )}>
                    <Tooltip content={
                        <Group className={classNames("gap-unit-sm", { "flex-row-reverse": isSource })}>
                            {isSource ? <TbArrowRightSquare /> : <TbArrowLeftSquare />}
                            <span>Add <b className="text-primary-600">{nodeDefs[definition.recommendedNode.data.definition].name}</b> node</span>
                        </Group>
                    } closeDelay={0} placement={isSource ? "right" : "left"}>
                        <Button
                            size="sm" isIconOnly radius="full" color="primary"
                            onPress={addRecommended}
                            className="min-h-0 min-w-0 h-auto w-auto p-1 hover:scale-110"
                        >
                            <TbSparkles className="text-[0.8em]" />
                        </Button>
                    </Tooltip>
                </div>}

            {/* <Dropdown
                isOpen
                // isOpen={menuDisclosure.isOpen}
                onOpenChange={menuDisclosure.onOpenChange}
                placement={type == "target" ? "left" : "right"}
            >
                <DropdownTrigger>
                    <div className="absolute left-0 h-full w-0 top-0" />
                </DropdownTrigger>
                <DropdownMenu>
                    <DropdownItem startContent={<TbSparkles />} key="recommended">
                        Add recommended node
                    </DropdownItem>
                    <DropdownItem startContent={<TbSearch />} key="search">
                        Search nodes
                    </DropdownItem>
                </DropdownMenu>
            </Dropdown> */}
        </div >
    )
}


// function openDataViewerModal(title, value) {
//     // modals.open({
//     //     title,
//     //     size: "lg",
//     //     children: typeof value === "string" ?
//     //         <Text className={classNames({
//     //             "font-mono": true,
//     //             "text-sm": value.length > 500,
//     //             "text-xs": value.length > 1000,
//     //         })}>
//     //             {value}
//     //         </Text> :
//     //         typeof value === "object" ?
//     //             <ObjectViewer object={value} /> :
//     //             <pre>
//     //                 {util.inspect(value)}
//     //             </pre>
//     // })
// }


function ObjectViewer({ object }) {

    return (
        <Table withColumnBorders highlightOnHover>
            <tbody>
                {Object.entries(object).map(([key, value]) => {
                    return (
                        <tr className="group" key={key}>
                            <td className="w-0 text-right font-bold font-mono">
                                {key}
                            </td>
                            <td className="text-gray group-hover:text-dark">
                                {typeof value === "string" ?
                                    value :
                                    typeof value === "object" ?
                                        <ObjectViewer object={value} /> :
                                        <Group>
                                            <p className="font-mono">{util.inspect(value)}</p>
                                            <p className="font-mono text-default-500 hidden group-hover:block">{value === null ? "null" : typeof value}</p>
                                        </Group>}
                            </td>
                        </tr>
                    )
                })}
            </tbody>
        </Table>
    )
}