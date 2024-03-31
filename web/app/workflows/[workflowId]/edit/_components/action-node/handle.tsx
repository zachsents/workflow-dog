import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@ui/dialog"
import { ScrollArea } from "@ui/scroll-area"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@ui/tooltip"
import { Button, ButtonProps } from "@web/components/ui/button"
import { Input } from "@web/components/ui/input"
import { useDialogState } from "@web/lib/client/hooks"
import { cn } from "@web/lib/utils"
import { useCreateActionNode, useIsHandleConnected } from "@web/modules/workflow-editor/graph/nodes"
import { useSelectedWorkflowRun } from "@web/modules/workflows"
import { produce } from "immer"
import type { WebNodeDefinitionOutput } from "packages/types"
import { DataTypeDefinitions, NodeDefinitions } from "packages/web"
import React, { forwardRef, useMemo, useRef, useState } from "react"
import { TbActivity, TbPencil, TbSparkles, TbX } from "react-icons/tb"
import { HandleType, Position, Handle as RFHandle, useNodeId, useReactFlow } from "reactflow"
import util from "util"
import PropertySelector from "./property-selector"


type Recommendation = {
    definition: string
    handle: string
    data?: Record<string, any>
}

interface ActionNodeHandleProps {
    id: string
    name?: string
    type: FlexibleHandleType
    definition: {
        type: string
        group?: boolean
        named?: boolean
        name: string
        bullet?: boolean
        recommendedNode?: Recommendation
    }
}

export default function ActionNodeHandle({
    id,
    name,
    type,
    definition,
}: ActionNodeHandleProps) {

    const isConnected = useIsHandleConnected(undefined, id)
    const ref = useRef<HTMLDivElement>(null)

    const nodeId = useNodeId()

    const displayName = name
        || (definition.named ? "<none>" : definition?.name)
        || <>&nbsp;</>

    const { data: selectedRun } = useSelectedWorkflowRun()
    const [hasRunValue, runValue] = useMemo(() => {
        const runState = selectedRun?.state as any
        const handleValues = runState?.outputs?.[nodeId!] ?? {}
        return [id in handleValues, handleValues[id]] as const
    }, [selectedRun, nodeId, id])

    const dataType = DataTypeDefinitions.get(definition.type)

    return (
        <div className="relative group/handle" ref={ref}>
            <RFHandle
                id={id}
                type={cleanHandleType(type)}
                position={isInput(type) ? Position.Left : Position.Right}
                className={cn(
                    "!relative !transform-none !inset-0 !w-auto !h-auto flex !rounded-md !border !border-solid transition-colors",
                    isConnected
                        ? "!bg-slate-100 !border-slate-400"
                        : "!bg-slate-50 hover:!bg-slate-100 !border-slate-300",
                )}
                isConnectable={!isConnected || isOutput(type)}
            >
                <div className="px-2 py-0.5 pointer-events-none w-24 text-center *:leading-none">
                    <p className="text-sm">
                        {displayName}
                    </p>
                    <p className="text-xs text-muted-foreground font-bold">
                        {dataType?.name}
                    </p>
                </div>

                {selectedRun && isInput(type) && hasRunValue &&
                    <div className="absolute top-1/2 -translate-y-1/2 nodrag left-full translate-x-2">
                        <TooltipProvider delayDuration={0}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button size="icon" className="rounded-full">
                                        <TbActivity />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent className="flex flex-col items-stretch gap-unit-xs max-w-[20rem]">
                                    <p className="text-xs text-default-500 text-center">
                                        Output From Selected Run
                                    </p>
                                    <ScrollArea className="h-[30rem] w-full rounded-md border p-4">
                                        {typeof runValue === "string" ?
                                            <p className="line-clamp-4">
                                                {runValue}
                                            </p> :
                                            <pre>
                                                {util.inspect(runValue)}
                                            </pre>}
                                    </ScrollArea>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>}
            </RFHandle>

            <div
                className={cn(
                    "absolute top-1/2 -translate-y-1/2 h-full flex center gap-1 nodrag nopan transition-opacity opacity-0 group-hover/handle:opacity-100 pointer-events-none group-hover/handle:pointer-events-auto",
                    isInput(type)
                        ? "right-full pr-1 pl-4"
                        : "left-full pl-0.5 pr-4",
                )}
                onClick={ev => ev.stopPropagation()}
            >
                {definition.named &&
                    <EditNamedHandleButton
                        handleId={id}
                        handleType={type}
                        handleName={name!}
                        dataTypeId={definition.type}
                    />}
                {definition.group &&
                    <DeleteGroupHandleButton handleId={id} handleType={type} />}

                {!isConnected && isOutput(type) &&
                    (definition as WebNodeDefinitionOutput).selectable &&
                    <PropertySelector dataTypeId={definition.type} />}

                {!isConnected && definition?.recommendedNode &&
                    <RecommendedNodeButton
                        handleId={id}
                        handleRef={ref}
                        handleType={type}
                        recommendation={definition.recommendedNode}
                    />}
            </div>
        </div >
    )
}


function RecommendedNodeButton({
    handleType,
    recommendation,
    handleId,
    handleRef,
}: {
    handleType: FlexibleHandleType
    recommendation: Recommendation
    handleId: string
    handleRef: React.RefObject<HTMLDivElement>
}) {
    const rf = useReactFlow()
    const nodeId = useNodeId()
    const definition = NodeDefinitions.get(recommendation.definition)

    const createNode = useCreateActionNode()
    const addRecommended = () => {
        const nodeHeight = rf.getNode(nodeId!)?.height ?? 0
        const handleBoundingRect = handleRef.current!.getBoundingClientRect()

        const newNodePos = rf.screenToFlowPosition({
            x: handleBoundingRect.left + handleBoundingRect.width / 2
                + (isInput(handleType) ? -500 : 200),
            y: handleBoundingRect.top + handleBoundingRect.height / 2 - nodeHeight / 2,
        })

        createNode({
            definition: recommendation.definition,
            position: newNodePos,
            data: recommendation.data || {},
            connect: [isInput(handleType) ? {
                target: nodeId!,
                targetHandle: handleId,
                sourceHandleType: recommendation.handle,
            } : {
                source: nodeId!,
                sourceHandle: handleId,
                targetHandleType: recommendation.handle,
            }],
        })
    }

    return (
        <HandleButton
            label={<>Add <b>{definition?.name}</b> node</>}
            onClick={addRecommended}
        >
            <TbSparkles className="mr-2" />
            {definition?.name}
        </HandleButton>
    )
}


function DeleteGroupHandleButton({
    handleId,
    handleType,
}: {
    handleId: string
    handleType: FlexibleHandleType
}) {
    const rf = useReactFlow()
    const nodeId = useNodeId()

    const deleteHandle = () => {
        rf.setNodes(produce(draft => {
            const node = draft.find(node => node.id === nodeId)
            if (!node) return

            const interfaces = node.data[isInput(handleType) ? "inputs" : "outputs"]
            const handleIndex = interfaces.findIndex(handle => handle.id === handleId)

            if (handleIndex !== -1)
                interfaces.splice(handleIndex, 1)
        }))
    }

    return (
        <HandleButton
            label={`Delete ${handleType}`}
            onClick={deleteHandle}
            onlyIcon variant="destructive"
        >
            <TbX />
        </HandleButton>
    )
}


function EditNamedHandleButton({
    handleId,
    handleType,
    handleName,
    dataTypeId,
}: {
    handleId: string
    handleName: string
    handleType: FlexibleHandleType
    dataTypeId: string
}) {
    const rf = useReactFlow()
    const nodeId = useNodeId()

    const editHandle = (newName: string) => {
        rf.setNodes(produce(draft => {
            const node = draft.find(node => node.id === nodeId)
            if (!node) return

            const interfaces = node.data[isInput(handleType) ? "inputs" : "outputs"]
            const handle = interfaces.find(handle => handle.id === handleId)

            if (handle)
                handle.name = newName
        }))
    }

    const [propertyName, setPropertyName] = useState(handleName)

    const dataType = DataTypeDefinitions.get(dataTypeId)
    const properties = Object.keys((dataType?.schema as any).shape ?? {})

    const dialog = useDialogState()

    return (
        <Dialog {...dialog.dialogProps}>
            <HandleButton
                label={`Edit ${handleType}`}
                onlyIcon variant="outline"
                wrapTrigger={WrapInDialogTrigger}
            >
                <TbPencil />
            </HandleButton>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Edit Handle
                    </DialogTitle>
                    <DialogDescription>
                        Edit the name of the handle.
                    </DialogDescription>
                </DialogHeader>

                <form
                    className="flex-v items-stretch gap-4"
                    onSubmit={ev => {
                        ev.preventDefault()
                        editHandle(new FormData(ev.currentTarget).get("propertyName") as string)
                        dialog.close()
                    }}
                >
                    <Input
                        name="propertyName"
                        placeholder="Type a property name"
                        value={propertyName}
                        onChange={ev => setPropertyName(ev.currentTarget.value)}
                    />

                    <div className="flex flex-wrap gap-1">
                        {properties.map(property => (
                            <Button
                                variant="secondary"
                                type="button"
                                onClick={() => setPropertyName(property)}
                            >
                                {property}
                            </Button>
                        ))}
                    </div>

                    <DialogFooter className="gap-2">
                        <DialogClose asChild>
                            <Button type="button" variant="ghost">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit">
                            Save
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}


interface HandleButtonProps extends ButtonProps {
    wrapTrigger?: JSX.ElementType
    label: any
    onlyIcon?: boolean
    children: any
}

function HandleButton({ label, onlyIcon, children, wrapTrigger: WrapTrigger, ...props }: HandleButtonProps) {

    const buttonComponent =
        <Button
            size="sm"
            className={cn(
                "rounded-full shrink-0 h-[1.9em]",
                onlyIcon && "w-auto aspect-square p-0",
            )}
            {...props}
        >
            {children}
        </Button>

    return (
        <TooltipProvider delayDuration={0}>
            <Tooltip>
                <TooltipTrigger asChild>
                    {WrapTrigger ?
                        <WrapTrigger>
                            {buttonComponent}
                        </WrapTrigger> :
                        buttonComponent}
                </TooltipTrigger>
                <TooltipContent>
                    <p className="text-xs">
                        {label}
                    </p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}


type FlexibleHandleType = "input" | "output" | HandleType

function cleanHandleType(handleType: FlexibleHandleType): HandleType {
    if (isInput(handleType))
        return "target"
    return "source"
}

function isInput(handleType: FlexibleHandleType) {
    return handleType === "input" || handleType === "target"
}

function isOutput(handleType: FlexibleHandleType) {
    return handleType === "output" || handleType === "source"
}


const WrapInDialogTrigger = forwardRef<React.ElementRef<typeof DialogTrigger>, React.ComponentProps<typeof DialogTrigger>>((props, ref) =>
    <DialogTrigger asChild {...props} ref={ref} />
)