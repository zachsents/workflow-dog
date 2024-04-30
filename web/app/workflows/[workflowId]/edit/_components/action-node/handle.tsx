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
import { useDialogState, useHover } from "@web/lib/client/hooks"
import { cn } from "@web/lib/utils"
import { useCreateActionNode, useHandleRect, useIsHandleConnectable, useIsHandleConnectableWhileConnecting, useIsHandleConnected, useIsHandleConnectedEdgeSelected } from "@web/modules/workflow-editor/graph/nodes"
import { useSelectedWorkflowRun } from "@web/modules/workflows"
import { produce } from "immer"
import { DataTypeDefinitions, NodeDefinitions } from "packages/client"
import React, { forwardRef, useMemo, useRef, useState } from "react"
import { TbPencil, TbSparkles, TbX } from "react-icons/tb"
import { EdgeLabelRenderer, HandleType, Position, Handle as RFHandle, useNodeId, useReactFlow, useStore } from "reactflow"
import PropertySelector from "./property-selector"
import stringifyObject from "stringify-object"
import { OmniPreview, OmniViewer } from "@web/components/omni-viewer"


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
    withBorder?: boolean
}

export default function ActionNodeHandle({
    id,
    name,
    type,
    definition,
    withBorder,
}: ActionNodeHandleProps) {

    const isConnected = useIsHandleConnected(undefined, id)
    const isConnectedEdgeSelected = useIsHandleConnectedEdgeSelected(undefined, id)
    const isConnectable = useIsHandleConnectable(undefined, id)
    const isConnectingAnywhere = useStore(s => !!s.connectionStartHandle)
    const isConnectableWhileConnecting = useIsHandleConnectableWhileConnecting(undefined, id)

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
    const isShowingRunValue = hasSelectedRun && isOutput(type) && hasRunValue

    const dataType = DataTypeDefinitions.get(definition.type)
    const isDataTypeSelectable = (dataType?.schema as any)?.shape != null

    const [hoverRef, isHovered] = useHover<HTMLDivElement>()

    const handleRect = useHandleRect(undefined, id)

    return (
        <div className="relative group/handle" ref={ref}>
            <RFHandle
                id={id}
                type={cleanHandleType(type)}
                position={isInput(type) ? Position.Left : Position.Right}
                className={cn(
                    "!relative !transform-none !inset-0 !w-auto !h-auto block !rounded-full transition-colors via-slate-200 via-[0.5rem] to-[1rem]",
                    isConnectedEdgeSelected ? "from-violet-400" : "from-neutral-400",
                    hasSelectedRun ? "!bg-slate-100" : [
                        isConnectable && "hover:outline hover:outline-yellow-500 hover:outline-2",
                        isConnectableWhileConnecting ? "!bg-amber-200" : "!bg-slate-100",
                        !isConnectingAnywhere && "!pointer-events-auto",
                    ],
                    withBorder
                        ? "!border !border-slate-300 shadow-sm"
                        : "!border-none",
                )}
                style={{
                    backgroundImage: isConnected
                        ? `radial-gradient(circle at ${isInput(type) ? "1%" : "98%"} 50%, var(--tw-gradient-stops))`
                        : "none",
                }}
                isConnectable={isConnectable}
                ref={hoverRef}
            >
                <div className="px-2 py-0.5 pointer-events-none text-center *:leading-none">
                    <p className="text-sm">
                        {displayName}
                    </p>
                    <p className="text-xs text-muted-foreground font-bold">
                        {dataType?.name}
                    </p>
                </div>

                {/* {selectedRun && isOutput(type) && hasRunValue &&
                    <ValueDisplay runValue={runValue} dataTypeId={definition.type} />} */}
            </RFHandle>

            {/* WILO: Moving the value display into an EdgeLabelRenderer as well */}

            <EdgeLabelRenderer>
                <div
                    className={cn(
                        "absolute -translate-y-1/2 flex center gap-1 z-[1002] nodrag nopan pointer-events-none transition-opacity hover:opacity-100 hover:pointer-events-auto p-2",
                        isInput(type) ? "-translate-x-full flex-row-reverse" : "translate-x-0",
                        ((isHovered && !isConnectingAnywhere) || isShowingRunValue)
                            ? "opacity-100 pointer-events-auto"
                            : "opacity-0",
                    )}
                    style={{
                        top: handleRect.y + handleRect.height / 2,
                        left: handleRect.x + (isInput(type) ? 0 : handleRect.width),
                    }}
                >
                    {hasSelectedRun
                        ? isShowingRunValue
                            ? <ValueDisplay runValue={runValue} dataTypeId={definition.type} />
                            : null
                        : <>
                            {definition.named &&
                                <EditNamedHandleButton
                                    handleId={id}
                                    handleType={type}
                                    handleName={name!}
                                    dataTypeId={definition.type}
                                />}
                            {definition.group &&
                                <DeleteGroupHandleButton handleId={id} handleType={type} />}
                            {isOutput(type) &&
                                // (definition as WebNodeDefinitionOutput).selectable &&
                                isDataTypeSelectable &&
                                <PropertySelector handleId={id} dataTypeId={definition.type} />}
                            {!isConnected && definition?.recommendedNode &&
                                <RecommendedNodeButton
                                    handleId={id}
                                    handleRef={ref}
                                    handleType={type}
                                    recommendation={definition.recommendedNode}
                                />}
                        </>}
                </div>
            </EdgeLabelRenderer>
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

    const dialog = useDialogState()

    return (
        <>
            <TooltipProvider delayDuration={0}>
                <Tooltip open>
                    <TooltipTrigger asChild>
                        <div />
                    </TooltipTrigger>
                    <TooltipContent
                        side="right" avoidCollisions={false}
                        className={cn(
                            "max-w-[12rem] max-h-[12rem] *:truncate transition-opacity cursor-pointer hover:opacity-90",
                        )}
                        onClick={dialog.open}
                    >
                        {dataType?.renderPreview
                            ? <dataType.renderPreview value={runValue} />
                            : <OmniPreview>{runValue}</OmniPreview>}
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <Dialog {...dialog.dialogProps}>
                <DialogContent className="max-h-[calc(100vh-6rem)] overflow-scroll !w-auto min-w-[32rem] max-w-[calc(100vw-10rem)]">
                    <DialogHeader>
                        <DialogTitle>
                            Value from selected run
                        </DialogTitle>
                    </DialogHeader>

                    {dataType?.renderExpanded
                        ? <dataType.renderExpanded value={runValue} />
                        : (dataType?.renderPreview && !dataType?.useNativeExpanded)
                            ? <dataType.renderPreview value={runValue} />
                            : <OmniViewer>{runValue}</OmniViewer>}
                </DialogContent>
            </Dialog>
        </>
    )
}