import { Button, Tooltip } from "@nextui-org/react"
import { useDefinition } from "@web/modules/workflow-editor/graph/nodes"
import classNames from "classnames"
import { TbActivity } from "react-icons/tb"
import { Position, Handle as RFHandle, useStore, useNodeId } from "reactflow"
import util from "util"
import Group from "../layout/Group"


export default function ActionNodeHandle({ id, name, type, definition: passedDef }) {

    const nodeId = useNodeId()
    const nodeDefinition = useDefinition()

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

    const displayName = definition?.bullet ? <>&bull;</> : (name || definition?.name || <>&nbsp;</>)

    const isConnected = useStore(s => s.edges.some(edge => edge.source == nodeId && edge.sourceHandle == id || edge.target == nodeId && edge.targetHandle == id))

    const selectedRun = useStore(s => s.selectedRun)
    const hasRunValue = id in (selectedRun?.outputs ?? {})
    const runValue = selectedRun?.outputs?.[id]

    const runValueNeedsExpansion = typeof runValue === "object" && Object.keys(runValue).length > 1 ||
        typeof runValue === "string" && runValue.length > 100

    return (
        <div>
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
                        "flex-row-reverse": type == "source",
                    })}
                >
                    {/* {definition.showHandleIcon && definition.icon &&
                        <definition.icon size="0.7rem" color="currentColor" />} */}

                    <p className="text-[0.625rem] text-current line-clamp-1">
                        {displayName}
                    </p>
                </Group>

                {selectedRun && type == "source" && hasRunValue &&
                    <div className="absolute top-1/2 -translate-y-1/2 nodrag left-full translate-x-2">
                        <Tooltip content={
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
        </div>
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