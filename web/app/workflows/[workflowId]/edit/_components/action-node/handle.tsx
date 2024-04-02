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
import { DataTypeDefinitions, NodeDefinitions } from "packages/client"
import React, { forwardRef, useMemo, useRef, useState } from "react"
import { TbPencil, TbSparkles, TbX } from "react-icons/tb"
import { HandleType, Position, Handle as RFHandle, useNodeId, useReactFlow } from "reactflow"
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

    const { data: selectedRun, isSuccess: hasSelectedRun } = useSelectedWorkflowRun()
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

                {selectedRun && isOutput(type) && hasRunValue &&
                    <ValueDisplay runValue={runValue} dataTypeId={definition.type} />}
            </RFHandle>

            {!hasSelectedRun &&
                <div
                    className={cn(
                        "absolute top-1/2 -translate-y-1/2 h-full flex center gap-1 nodrag nopan transition-opacity opacity-0 group-hover/handle:opacity-100 pointer-events-none group-hover/handle:pointer-events-auto",
                        isInput(type)
                            ? "right-full pr-1 pl-4 flex-row-reverse"
                            : "left-full pl-0.5 pr-4 flex-row",
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
                </div>}
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

    // I don't thik this works how i originally thought 
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


function ValueDisplay({ runValue, dataTypeId }: { runValue: any, dataTypeId: string }) {

    const dataType = DataTypeDefinitions.get(dataTypeId)

    const shouldExpand = dataType?.shouldExpand?.(runValue) || false

    const dialog = useDialogState()

    return (
        <div
            className="absolute top-1/2 -translate-y-1/2 nodrag left-full translate-x-2"
        >
            <TooltipProvider delayDuration={0}>
                <Tooltip open>
                    <TooltipTrigger asChild>
                        {/* <Button
                            size="icon" className="rounded-full w-7 h-7"
                            onClick={() => {
                                if (shouldExpand)
                                    dialog.open()
                            }}
                        >
                            <TbActivity />
                        </Button> */}
                        <div />
                    </TooltipTrigger>
                    <TooltipContent
                        side="right" avoidCollisions={false}
                        className={cn(
                            "max-w-[12rem] max-h-[12rem] transition-opacity",
                            shouldExpand ? "cursor-pointer hover:opacity-90" : "cursor-default",
                        )}
                        onClick={() => {
                            if (shouldExpand)
                                dialog.open()
                        }}
                    >
                        {dataType?.renderPreview &&
                            <dataType.renderPreview value={runValue} />}

                        {shouldExpand &&
                            <p className="text-muted-foreground">
                                Click to expand
                            </p>}
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            {shouldExpand &&
                <Dialog {...dialog.dialogProps}>
                    <DialogContent className="max-h-[56rem] overflow-y-scroll">
                        <DialogHeader>
                            <DialogTitle>
                                Value from selected run
                            </DialogTitle>
                        </DialogHeader>

                        {dataType?.renderExpanded &&
                            <dataType.renderExpanded value={runValue} />}
                    </DialogContent>
                </Dialog>}
        </div>
    )
}