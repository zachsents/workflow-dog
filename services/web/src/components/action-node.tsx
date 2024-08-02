import { zodResolver } from "@hookform/resolvers/zod"
import { Portal as HoverCardPortal } from "@radix-ui/react-hover-card"
import { IconBracketsContain, IconDots, IconList, IconPlus, IconX } from "@tabler/icons-react"
import { Button } from "@ui/button"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@ui/dropdown-menu"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormMessage
} from "@ui/form"
import { Card } from "@web/components/ui/card"
import { useGraphBuilder, useNode, useNodeId, useRegisterHandle, type HandleState, type HandleType, type Node } from "@web/lib/graph-builder"
import { useDialogState, useElementChangeRef, useStateChange } from "@web/lib/hooks"
import { cn, getOffsetRelativeTo, type RequiredExcept } from "@web/lib/utils"
import React, { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { useValueType, ValueTypeDefinitions, type ValueTypeUsage } from "workflow-types/react"
import { z } from "zod"
import TI from "./tabler-icon"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card"
import { Input } from "./ui/input"



type StandardNodeChild = React.ReactElement<HandleProps, typeof Handle>
    | React.ReactElement<MultiHandleProps, typeof MultiHandle>

// #region StandardNode
export function StandardNode({ children }: {
    children: StandardNodeChild | StandardNodeChild[]
}) {
    const gbx = useGraphBuilder()
    const id = useNodeId()
    const n = useNode()
    const def = gbx.getNodeDefinition(n.definitionId)

    if (!Array.isArray(children)) children = [children]
    const inputs = children
        .filter(c => validHandleComponents.has(c.type.name) && c.props.type === "input")
    const outputs = children
        .filter(c => validHandleComponents.has(c.type.name) && c.props.type === "output")

    const isSelected = gbx.useStore(s => s.selection.has(id))
    const showSelectHoverOutline = gbx.useStore(s => !s.connection && !s.boxSelection)

    return (
        <Card className={cn(
            "select-none outline-primary outline-2 outline-offset-2",
            isSelected
                ? "outline"
                : (showSelectHoverOutline && "hover:outline-dashed")
        )}>
            <div className="font-bold px-4 py-1 text-center bg-gray-600 text-white m-1 mb-4 rounded-t-lg rounded-b-sm flex justify-center items-center gap-2">
                <def.icon />
                <span>{def.name}</span>
            </div>

            <div className="flex items-start justify-between gap-4 pb-4">
                <div className="flex flex-col items-stretch gap-2">
                    {inputs}
                    {/* {Object.entries(def.inputs).map(([inputDefId, inputDef]) =>
                        inputDef.allowMultiple
                            ? <div className="flex flex-col items-stretch gap-1 py-1 pr-1 rounded-r-md border-y border-r" key={inputDefId}>
                                {Array(inputStates[inputDefId]?.amount ?? inputDef.min).fill(null).map((_, i) =>
                                    <Handle type="input" definition={inputDefId} index={i} key={i} />
                                )}
                            </div>
                            : <Handle type="input" definition={inputDefId} key={inputDefId} />
                    )} */}
                </div>
                <div className="flex flex-col items-stretch gap-2">
                    {outputs}
                    {/* {Object.entries(def.outputs).flatMap(([outputDefId, outputDef]) =>
                        outputDef.allowMultiple
                            ? <div className="flex flex-col items-stretch gap-1 py-1 pl-1 rounded-l-md border-y border-l" key={outputDefId}>
                                {Array(inputStates[outputDefId]?.amount ?? outputDef.min).fill(null).map((_, i) =>
                                    <Handle type="output" definition={outputDefId} index={i} key={i} />
                                )}
                            </div>
                            : <Handle type="output" definition={outputDefId} key={outputDefId} />
                    )} */}
                </div>
            </div>
        </Card>
    )
}

StandardNode.Handle = Handle
StandardNode.MultiHandle = MultiHandle

const validHandleComponents = new Set([Handle.name, MultiHandle.name])


interface MultiHandleProps {
    type: HandleType
    name: string
    displayName?: string
    min?: number
    max?: number
    allowNaming?: boolean
    allowAdding?: boolean
    allowSingleMode?: boolean
    defaultSingleMode?: boolean
    itemDisplayName?: string
    itemValueType?: ValueTypeUsage
}

type MultiHandlePropsWithDefaults = RequiredExcept<MultiHandleProps, "itemValueType">

// #region MultiHandle
function MultiHandle(passedProps: MultiHandleProps) {

    const props: MultiHandlePropsWithDefaults = {
        min: 0,
        max: Infinity,
        allowNaming: false,
        allowAdding: true,
        allowSingleMode: true,
        defaultSingleMode: false,
        displayName: passedProps.name,
        itemDisplayName: passedProps.displayName ?? passedProps.name,
        ...passedProps,
    }

    const isInput = props.type === "input"

    const gbx = useGraphBuilder()
    const nodeId = useNodeId()
    const handleState: HandleState | undefined = gbx.useStore(
        s => s.nodes.get(nodeId)!.handleStates[props.name]
    )
    const { multi: multiState, listMode } = handleState ?? {}

    useEffect(() => {
        if (handleState) return
        gbx.mutateState(s => {
            s.nodes.get(nodeId)!.handleStates[props.name] = {
                listMode: props.defaultSingleMode ? "single" : "multi",
                multi: {
                    amount: props.min,
                    ...props.allowNaming && { names: Array(props.min).fill("") },
                },
            }
        })
    }, [handleState])

    return (
        <div className={cn(
            "flex flex-col items-stretch gap-1 py-1 border-y",
            isInput ? "rounded-r-md border-r pr-1" : "rounded-l-md border-l pl-1",
        )}>
            <div className={cn(
                "flex items-center justify-between gap-4 text-xs text-center text-muted-foreground",
                isInput ? "pl-2" : "px-1",
            )}>
                <div className="flex-center gap-1">
                    <TI><IconBracketsContain /></TI>
                    <span className="font-medium">{props.displayName}</span>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            size="sm" variant="ghost"
                            className="flex-center gap-1 h-[1.75em] px-0 aspect-square text-xs rounded-full"
                        >
                            <TI><IconDots /></TI>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="end"
                        onPointerDownCapture={e => e.stopPropagation()}
                    >
                        <DropdownMenuLabel className="text-center">
                            "{props.displayName}" Settings
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {listMode === "multi" &&
                            <DropdownMenuItem
                                className="flex items-center gap-4"
                                disabled={!props.allowSingleMode}
                                onSelect={() => gbx.mutateState(s => {
                                    s.nodes.get(nodeId)!.handleStates[props.name].listMode = "single"
                                    s.edges.forEach(e => {
                                        if (e[isInput ? "t" : "s"] !== nodeId)
                                            return
                                        if (e[isInput ? "th" : "sh"].split(".")[0] !== props.name)
                                            return
                                        s.edges.delete(e.id)
                                    })
                                })}
                            >
                                <TI className="text-muted-foreground"><IconBracketsContain /></TI>
                                <span>Provide entire list as input</span>
                            </DropdownMenuItem>}

                        {listMode === "single" &&
                            <DropdownMenuItem
                                className="flex items-center gap-4"
                                onSelect={() => gbx.mutateState(s => {
                                    s.nodes.get(nodeId)!.handleStates[props.name].listMode = "multi"
                                    s.edges.forEach(e => {
                                        if (e[isInput ? "t" : "s"] !== nodeId)
                                            return
                                        if (e[isInput ? "th" : "sh"] !== props.name)
                                            return
                                        s.edges.delete(e.id)
                                    })
                                })}
                            >
                                <TI className="text-muted-foreground"><IconList /></TI>
                                <span>Provide list items individually</span>
                            </DropdownMenuItem>}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {listMode === "multi" && multiState && <>
                {Array(multiState.amount).fill(null).map((_, i) =>
                    <MultiHandleItem key={`${props.name}.${i}`} {...props} index={i} />
                )}

                {props.allowAdding && multiState.amount < props.max &&
                    <Button
                        size="sm" variant="ghost"
                        onClick={() => gbx.mutateState(s => {
                            s.nodes.get(nodeId)!.handleStates[props.name].multi!.amount++
                        })}
                        className="flex-center gap-1 h-[1.75em] px-2 mx-2 text-xs"
                        onPointerDownCapture={e => e.stopPropagation()}
                    >
                        <span>
                            <TI><IconPlus /></TI>
                        </span> {props.itemDisplayName}
                    </Button>}
            </>}

            {listMode === "single" && props.allowSingleMode &&
                <Handle
                    name={props.name} type={props.type}
                    displayName={props.displayName}
                    valueType={useValueType("list", props.itemValueType && [props.itemValueType])}
                />}
        </div>
    )
}


function MultiHandleItem({
    type, name, index, displayName,
    min, max,
    allowNaming, allowAdding,
    itemDisplayName, itemValueType,
}: MultiHandlePropsWithDefaults & { index: number }) {

    const isInput = type === "input"
    const indexingId = `${name}.${index}`

    const gbx = useGraphBuilder()
    const nodeId = useNodeId()
    const multiState = gbx.useStore(s => s.nodes.get(nodeId)!.handleStates[name].multi!)
    const isConnecting = gbx.useStore(s => !!s.connection)

    const renameDialog = useDialogState()

    return (<>
        <div className={cn(
            "group flex items-center gap-1",
            isInput ? "flex-row" : "flex-row-reverse"
        )}>
            <div className="grow">
                <Handle
                    type={type} name={name} indexingId={indexingId}
                    displayName={allowNaming
                        ? (multiState.names?.[index] ?? "")
                        : `${itemDisplayName} ${index + 1}`}
                    valueType={itemValueType}
                    allowNaming={allowNaming} onNameClick={renameDialog.open}
                />
            </div>
            {allowAdding &&
                <Button
                    size="sm" variant="destructive"
                    className={cn(
                        "shrink-0 h-[1.5em] p-0 aspect-square flex-center rounded-full text-xs opacity-0 transition-opacity",
                        (isConnecting || multiState.amount <= min) ? "pointer-events-none" : "group-hover:opacity-100",
                    )}
                    onPointerDownCapture={e => e.stopPropagation()}
                    onClick={() => gbx.mutateState(s => {
                        const multiState = s.nodes.get(nodeId)!.handleStates[name].multi!
                        multiState.amount--
                        if (allowNaming)
                            multiState.names?.splice(index, 1)

                        s.edges.forEach(e => {
                            if (e.s !== nodeId && e.t !== nodeId)
                                return

                            const handleKey = e.s === nodeId ? "sh" : "th"
                            const indexedHandleMatch = e[handleKey].match(/^(.+)\.(\d)+$/)
                            if (!indexedHandleMatch || indexedHandleMatch[1] !== name)
                                return

                            const handleIndex = parseInt(indexedHandleMatch[2])

                            if (handleIndex > index)
                                e[handleKey] = `${name}.${handleIndex - 1}`
                            else if (handleIndex === index)
                                s.edges.delete(e.id)
                        })
                    })}
                >
                    <TI><IconX /></TI>
                </Button>}
        </div>
        {allowNaming &&
            <HandleRenameDialog
                handleName={name}
                handleIndex={index}
                handleItemDisplayName={itemDisplayName}
                handleType={type}
                {...renameDialog.dialogProps}
            />}
    </>)
}


const handleRenameFormSchema = z.object({
    handleName: z.string().min(1).max(300),
})

function HandleRenameDialog({ open, onOpenChange, handleName, handleIndex, handleType, handleItemDisplayName }: {
    open: boolean
    onOpenChange: (open: boolean) => void
    handleName: string
    handleIndex: number
    handleType: HandleType
    handleItemDisplayName: string
}) {
    const gbx = useGraphBuilder()
    const nodeId = useNodeId()

    const customName = gbx.useStore(s => s.nodes.get(nodeId)!.handleStates[handleName].multi!.names?.[handleIndex] ?? "")

    const form = useForm<z.infer<typeof handleRenameFormSchema>>({
        resolver: zodResolver(handleRenameFormSchema),
        values: { handleName: customName },
    })

    function close(reset = true) {
        onOpenChange(false)
        if (reset) form.reset()
    }

    function onSubmit(data: z.infer<typeof handleRenameFormSchema>) {
        gbx.mutateState(s => {
            s.nodes.get(nodeId)!.handleStates[handleName].multi!.names![handleIndex] = data.handleName
                .trim()
                .replaceAll(/\s{2,}/g, " ")
        })
        close()
    }

    const inputRef = useRef<HTMLInputElement>(null)
    useEffect(() => {
        if (open) {
            inputRef.current?.focus()
            inputRef.current?.select()
        }
    }, [open])

    return (
        <Dialog {...{ open, onOpenChange }}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Rename "{handleItemDisplayName}" {handleType}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="grid gap-4"
                    >
                        <FormField
                            control={form.control}
                            name="handleName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            type="text" placeholder={handleItemDisplayName} {...field}
                                            ref={inputRef}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Leading spaces, trailing spaces, and multiple consecutive spaces will be removed.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button variant="ghost" type="button" onClick={() => close()}>
                                Cancel
                            </Button>
                            <Button type="submit">
                                Save
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}


interface HandleProps {
    type: HandleType
    name: string
    valueType?: ValueTypeUsage
    indexingId?: string
    displayName?: string
    allowNaming?: boolean
    onNameClick?: (event: React.MouseEvent<HTMLSpanElement>) => void
}

// #region Handle
function Handle({
    type, name, indexingId = name, displayName = name, valueType,
    allowNaming, onNameClick,
}: HandleProps) {
    const isInput = type === "input"
    const gbx = useGraphBuilder()

    const nodeId = useNodeId()
    const nodeElement = gbx.useStore(s => s.nodes.get(nodeId)!._element)

    const childRef = useRef<HTMLDivElement>(null)
    const [handleX, setHandleX] = useState<number | undefined>()
    const [handleY, setHandleY] = useState<number | undefined>()

    function recalculateChildPosition() {
        if (!childRef.current || !nodeElement)
            return
        const { x, y } = getOffsetRelativeTo(childRef.current, nodeElement)
        setHandleX(x + (isInput ? 0 : childRef.current.offsetWidth))
        setHandleY(y)
    }

    const { current: observer } = useRef<ResizeObserver>(new ResizeObserver(() => {
        recalculateChildPosition()
    }))

    const parentRef = useElementChangeRef((prev, current) => {
        if (prev) observer.unobserve(prev)
        observer.observe(current)
    })

    useStateChange(nodeElement, (prev, current) => {
        if (prev) observer.unobserve(prev)
        if (current) {
            observer.observe(current)
            recalculateChildPosition()
        }
    })

    const {
        isConnectingAtAll, isConnectingToUs, canConnectToUs,
        onPointerDownCapture, ...eventHandlers
    } = useRegisterHandle(indexingId, { type, x: handleX, y: handleY })

    const valueTypeDef = valueType && ValueTypeDefinitions[valueType.typeDefinitionId]

    const displayNameComponent = <HandleDisplayName
        allowNaming={allowNaming}
        onClick={onNameClick}
        className="grow"
    >
        {displayName}
    </HandleDisplayName>

    return (
        <HoverCard
            openDelay={isConnectingAtAll ? 850 : 500}
            closeDelay={isConnectingAtAll ? 0 : 100}
        >
            <HoverCardTrigger asChild>
                <div
                    className={cn(
                        "relative bg-gray-200 text-xs px-3 py-0.5 transition-opacity flex items-center justify-between gap-2",
                        isInput ? "rounded-r-full" : "rounded-l-full",
                        isConnectingToUs && "outline-dashed outline-2 outline-yellow-500",
                        (isConnectingAtAll && !canConnectToUs) && "opacity-50 pointer-events-none",
                    )}
                    ref={parentRef}
                    {...eventHandlers}
                >
                    {displayNameComponent}
                    {valueTypeDef &&
                        <TI className="text-muted-foreground shrink-0">
                            <valueTypeDef.icon />
                        </TI>}
                    <div
                        className={cn(
                            "absolute hack-center-y rounded-full aspect-square p-2 transition-opacity",
                            isInput ? "left-0 -translate-x-1/2" : "right-0 translate-x-1/2",
                            !isConnectingAtAll && "hover:bg-blue-400/50 cursor-crosshair",
                            (isConnectingAtAll && !canConnectToUs) && "opacity-0",
                        )}
                        ref={childRef}
                        onPointerDownCapture={onPointerDownCapture}
                    >
                        <div className="rounded-full w-2 aspect-square bg-blue-500" />
                    </div>
                </div>
            </HoverCardTrigger>
            <HoverCardPortal>
                <HoverCardContent
                    side={isInput ? "left" : "right"} sideOffset={16}
                    className={cn(
                        "cursor-default",
                        isConnectingAtAll && "pointer-events-none",
                    )}
                    onPointerDownCapture={e => e.stopPropagation()}
                >
                    {displayNameComponent}
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <span className="mr-1">Type:</span>
                        {valueTypeDef &&
                            <TI><valueTypeDef.icon /></TI>}
                        <span>
                            {valueTypeDef?.name ?? "Any"}
                        </span>
                    </div>
                </HoverCardContent>
            </HoverCardPortal>
        </HoverCard>
    )
}

interface HandleDisplayNameProps extends React.ComponentProps<"span"> {
    children: string
    allowNaming?: boolean
}

function HandleDisplayName({ children, allowNaming, onClick, ...props }: HandleDisplayNameProps) {
    const gbx = useGraphBuilder()
    const isConnecting = gbx.useStore(s => !!s.connection)

    const canCurrentlyBeNamed = allowNaming && !isConnecting

    return (
        <span
            {...props}
            className={cn(
                canCurrentlyBeNamed && "cursor-text hover:bg-gray-600/15 rounded-sm",
                !children && "italic text-muted-foreground",
                props.className,
            )}
            onClick={canCurrentlyBeNamed ? onClick : undefined}
        >
            {children || "Unnamed"}
        </span>
    )
}

// #region Node
export function Node({ id, definitionId }: Node) {

    const gbx = useGraphBuilder()
    const def = gbx.getNodeDefinition(definitionId)
    const isSelected = gbx.useStore(s => s.selection.has(id))
    const isConnecting = gbx.useStore(s => !!s.connection)

    return (
        <Card className={cn(
            "select-none outline-primary outline-2 outline-offset-2",
            isSelected
                ? "outline"
                : isConnecting ? "" : "hover:outline-dashed"
        )}>
            <p className="font-bold px-4 py-1 text-center bg-gray-600 text-white m-1 mb-4 rounded-t-lg rounded-b-sm">
                {def.name}
            </p>
            <div className="flex items-start justify-between gap-4 pb-4">
                <div className="flex flex-col items-stretch gap-2">
                    {/* {Object.entries(def.inputs).map(([inputDefId, inputDef]) =>
                        inputDef.allowMultiple
                            ? <div className="flex flex-col items-stretch gap-1 py-1 pr-1 rounded-r-md border-y border-r" key={inputDefId}>
                                {Array(inputStates[inputDefId]?.amount ?? inputDef.min).fill(null).map((_, i) =>
                                    <Handle type="input" definition={inputDefId} index={i} key={i} />
                                )}
                            </div>
                            : <Handle type="input" definition={inputDefId} key={inputDefId} />
                    )} */}
                </div>
                <div className="flex flex-col items-stretch gap-2">
                    {/* {Object.entries(def.outputs).flatMap(([outputDefId, outputDef]) =>
                        outputDef.allowMultiple
                            ? <div className="flex flex-col items-stretch gap-1 py-1 pl-1 rounded-l-md border-y border-l" key={outputDefId}>
                                {Array(inputStates[outputDefId]?.amount ?? outputDef.min).fill(null).map((_, i) =>
                                    <Handle type="output" definition={outputDefId} index={i} key={i} />
                                )}
                            </div>
                            : <Handle type="output" definition={outputDefId} key={outputDefId} />
                    )} */}
                </div>
            </div>
        </Card>
    )
}
