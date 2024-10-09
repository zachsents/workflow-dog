import { zodResolver } from "@hookform/resolvers/zod"
import { Portal as HoverCardPortal } from "@radix-ui/react-hover-card"
import useResizeObserver from "@react-hook/resize-observer"
import { IconActivity, IconAlertTriangle, IconBox, IconBracketsContain, IconChevronDown, IconDots, IconList, IconPlus, IconX } from "@tabler/icons-react"
import { Button } from "@ui/button"
import { Card } from "@ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@ui/dropdown-menu"
import { Form, FormControl, FormDescription, FormField, FormItem, FormMessage } from "@ui/form"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@ui/hover-card"
import { Input } from "@ui/input"
import { Label } from "@ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@ui/popover"
import TI from "@web/components/tabler-icon"
import { useDialogState } from "@web/lib/hooks"
import { cn, getOffsetRelativeTo } from "@web/lib/utils"
import React, { useEffect, useLayoutEffect, useMemo, useRef } from "react"
import { useForm } from "react-hook-form"
import { ClientValueTypes } from "workflow-packages/client"
import type { ValueTypeUsage } from "workflow-packages/lib/types"
import { useValueType, ValueDisplay } from "workflow-packages/lib/value-types.client"
import { z } from "zod"
import { useGraphBuilder, useNode, useNodeId, useRegisterHandle, type HandleState, type HandleType } from "./core"
import { getDefinitionPackageName } from "./utils"
import Markdown from "react-markdown"


// #region StandardNode
export function StandardNode({
    children = [],
    hidePackageBadge = false,
}: {
    children?: StandardNodeChild | StandardNodeChild[]
    hidePackageBadge?: boolean
}) {
    const gbx = useGraphBuilder()
    const id = useNodeId()
    const n = useNode()
    const def = gbx.getNodeDefinition(n.definitionId)

    if (!Array.isArray(children)) children = [children]
    const handleFilter = (handleType: HandleType) => (c: StandardNodeChild) =>
        c && validHandleComponents.includes(c.type.name)
        && (c.props as HandleProps | MultiHandleProps).type === handleType
    const inputs = children.filter(handleFilter("input"))
    const outputs = children.filter(handleFilter("output"))
    const configItems = children.filter(c => c && c.type.name === Config.name)
    const contentItems = children.filter(c => c && c.type.name === NodeContent.name)

    const isSelected = gbx.useStore(s => s.selection.has(id))
    const showSelectHoverOutline = gbx.useStore(s => !s.connection && !s.boxSelection)

    const packageDisplayName = getDefinitionPackageName(n.definitionId)

    const error = gbx.options.runErrors?.[id]

    return (
        <Card className={cn(
            "select-none outline-primary outline-2 outline-offset-2 flex flex-col items-stretch gap-4 py-1",
            n.highlightColor && `shadow-[0_0_0px_20px] shadow-${n.highlightColor}-400/40`,
            !gbx.options.readonly && (
                isSelected ? "outline" : (showSelectHoverOutline && "hover:outline-dashed")
            ),
        )}>
            <div
                className={cn(
                    "font-bold px-4 py-1 text-center text-white mx-1 rounded-t-lg rounded-b-sm flex justify-center items-center gap-2",
                    n.disabled && "opacity-50",
                )}
                style={{ backgroundColor: def.color }}
            >
                <def.icon />
                <span className={cn(
                    n.disabled && "line-through decoration-2",
                )}>
                    {def.name}
                </span>

                {!hidePackageBadge && packageDisplayName &&
                    <span className="bg-white/30 px-2 py-0.5 rounded-sm ml-3 text-xs font-medium leading-none">
                        {packageDisplayName}
                    </span>}
            </div>

            <div className="flex items-start justify-between gap-4 last:mb-3">
                <div className="flex flex-col items-stretch gap-2">
                    {inputs}
                </div>
                {contentItems.length > 0 &&
                    <div className="grow flex flex-col items-stretch">
                        {contentItems}
                    </div>}
                <div className="flex flex-col items-stretch gap-2">
                    {outputs}
                </div>
            </div>

            {configItems.length > 0 &&
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            size="compact" variant="ghost"
                            className="self-center gap-1 text-[0.65em] text-muted-foreground"
                        >
                            Configure {configItems.length} option{configItems.length > 1 && "s"}
                            <TI><IconChevronDown /></TI>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent
                        side="bottom" sideOffset={16}
                        className="px-2 py-4 flex flex-col items-stretch gap-4"
                    >
                        {configItems}
                    </PopoverContent>
                </Popover>}

            {error &&
                <div className="absolute bottom-full hack-center-x mb-2 px-4 py-2 rounded-md border-destructive border-2 shadow-md bg-white w-full z-[90] grid gap-1">
                    <div className="flex items-center gap-1 text-destructive text-xs font-bold">
                        <TI><IconAlertTriangle /></TI>
                        <p>Error</p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                        <Markdown components={{
                            code: props => <code {...props} className={cn("bg-gray-100 rounded-sm px-1", props.className)} />,
                        }}>{error}</Markdown>
                    </div>
                </div>}
        </Card>
    )
}

StandardNode.Handle = Handle
StandardNode.MultiHandle = MultiHandle
StandardNode.Config = Config
StandardNode.Content = NodeContent


type ReactElementFromFn<T extends React.ElementType> = React.ReactElement<React.ComponentProps<T>, T>

type StandardNodeChild = ReactElementFromFn<typeof Handle>
    | ReactElementFromFn<typeof MultiHandle>
    | ReactElementFromFn<typeof Config>
    | ReactElementFromFn<typeof NodeContent>
    | undefined | null

const validHandleComponents = [Handle.name, MultiHandle.name]


interface MultiHandleProps {
    type: HandleType
    name: string
    displayName?: string
    min?: number
    max?: number
    defaultAmount?: number
    /**
     * Whether to allow naming the individual handles. On the backend, this will
     * cause the handle to be an object indexed by the name.
     * @default false
     */
    allowNaming?: boolean
    /**
     * Whether to allow adding/removing handles.
     * @default true
     */
    allowAdding?: boolean
    /** 
     * Allows a multi-handle to be changed to a single handle that takes in a list.
     * @default true
     */
    allowSingleMode?: boolean
    /**
     * When single mode is allowed, whether to default to single mode.
     * @default false 
     */
    defaultSingleMode?: boolean
    itemDisplayName?: string
    itemValueType?: ValueTypeUsage
}

type MultiHandlePropsWithDefaults = Required<MultiHandleProps>

// #region MultiHandle
function MultiHandle(passedProps: MultiHandleProps) {

    const props: MultiHandlePropsWithDefaults = {
        min: 0,
        max: Infinity,
        defaultAmount: passedProps.min ?? 0,
        allowNaming: false,
        allowAdding: true,
        allowSingleMode: true,
        defaultSingleMode: false,
        displayName: passedProps.name,
        itemDisplayName: passedProps.displayName ?? passedProps.name,
        itemValueType: useValueType("any"),
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
                    amount: props.defaultAmount,
                    ...props.allowNaming && { names: Array(props.defaultAmount).fill("") },
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
                    <TI>
                        {props.allowNaming ? <IconBox /> : <IconBracketsContain />}
                    </TI>
                    <span className="font-medium">{props.displayName}</span>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            size="icon" variant="ghost"
                            className="text-xs rounded-full"
                            disabled={gbx.options.readonly}
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
                                <TI className="text-muted-foreground">
                                    {props.allowNaming ? <IconBox /> : <IconBracketsContain />}
                                </TI>
                                <span>Provide entire {props.allowNaming ? "object" : "list"} as input</span>
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
                                <span>Provide items individually</span>
                            </DropdownMenuItem>}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {listMode === "multi" && multiState && <>
                {Array(multiState.amount).fill(null).map((_, i) =>
                    <MultiHandleItem key={`${props.name}.${i}`} {...props} index={i} />
                )}

                {props.allowAdding && multiState.amount < props.max && !gbx.options.readonly &&
                    <Button
                        size="compact" variant="ghost"
                        onClick={() => gbx.mutateState(s => {
                            s.nodes.get(nodeId)!.handleStates[props.name].multi!.amount++
                        })}
                        className="gap-1 mx-2 text-xs"
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
                    valueType={props.allowNaming
                        ? useValueType("object")
                        : useValueType("array", [props.itemValueType])}
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
                    allowNaming={allowNaming && !gbx.options.readonly} onNameClick={renameDialog.open}
                />
            </div>
            {allowAdding && !gbx.options.readonly &&
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
        {allowNaming && !gbx.options.readonly &&
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
    /** Handles are required by default. This option is ignored for outputs. */
    optional?: boolean
}

// #region Handle
function Handle({
    type, name, indexingId = name,
    displayName = name
        .replace(/^\w/, c => c.toUpperCase())
        .replaceAll(/(?<=[a-z])([A-Z])/g, " $1"),
    valueType = type === "input" ? useValueType("any") : useValueType("unknown"),
    allowNaming = false, onNameClick,
    optional = false,
}: HandleProps) {
    const isInput = type === "input"
    const gbx = useGraphBuilder()
    const nodeId = useNodeId()

    const {
        updateInternalHandlePosition,
        isConnectingAtAll, isConnectingToUs, canConnectToUs, isConnected,
        onPointerDownCapture, ...eventHandlers
    } = useRegisterHandle(indexingId, { type })

    const childRef = useRef<HTMLDivElement>(null)
    const parentRef = useRef<HTMLDivElement>(null)
    const nodeElement = gbx.useNodeState(nodeId, n => n._element)

    function recalculateChildPosition() {
        if (!childRef.current || !parentRef.current || !nodeElement)
            return
        const { x, y } = getOffsetRelativeTo(childRef.current, nodeElement)
        updateInternalHandlePosition(x + (isInput ? 0 : childRef.current.offsetWidth), y)
    }

    useResizeObserver(parentRef, recalculateChildPosition)
    useResizeObserver(nodeElement!, recalculateChildPosition)

    useLayoutEffect(() => {
        recalculateChildPosition()
    }, [nodeElement])

    const valueTypeDef = valueType && ClientValueTypes[valueType.typeDefinitionId]

    const displayNameComponent = <HandleDisplayName
        allowNaming={allowNaming}
        onClick={onNameClick}
        className="grow"
    >
        {displayName}
    </HandleDisplayName>

    const outputValue = useMemo(() => {
        const rawValue = gbx.options.runOutputs?.[nodeId]?.[indexingId]
        return rawValue
            ? JSON.parse(rawValue)
            : undefined
    }, [gbx.options.runOutputs?.[nodeId]?.[indexingId]])

    return (
        <div className="relative">
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
                        {...!gbx.options.readonly && eventHandlers}
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
                                !isConnectingAtAll && `${isInput
                                    ? isConnected
                                        ? "hover:bg-green-400/50"
                                        : optional ? "hover:bg-yellow-400/50" : "hover:bg-red-400/50"
                                    : "hover:bg-blue-400/50"
                                } cursor-crosshair`,
                                (isConnectingAtAll && !canConnectToUs) && "opacity-0",
                            )}
                            ref={childRef}
                            onPointerDownCapture={gbx.options.readonly ? undefined : onPointerDownCapture}
                        >
                            <div className={cn(
                                "rounded-full w-2 aspect-square transition-colors",
                                isInput
                                    ? isConnected
                                        ? "bg-green-600"
                                        : optional ? "bg-yellow-500" : "bg-red-500"
                                    : "bg-blue-500",
                            )} />
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
                        <p className="text-sm text-muted-foreground italic">
                            {isInput ? "Input" : "Output"}
                        </p>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <span className="mr-1">Type:</span>
                            {valueTypeDef
                                ? <>
                                    <TI><valueTypeDef.icon /></TI>
                                    <span>
                                        {valueTypeDef.specificName?.(...valueType.genericParams) ?? valueTypeDef.name}
                                    </span>
                                </>
                                : <span>Any</span>}
                        </div>
                    </HoverCardContent>
                </HoverCardPortal>
            </HoverCard>

            {outputValue !== undefined &&
                <Popover>
                    <PopoverTrigger asChild>
                        <Button size="compact" className="absolute left-full hack-center-y rounded-full gap-2 mx-2">
                            <TI className="shrink-0"><IconActivity /></TI>
                            <div className="flex-1 min-w-0">
                                <ValueDisplay encodedValue={outputValue} mode="preview" />
                            </div>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent
                        className="max-h-[500px] overflow-y-scroll"
                        onWheel={ev => ev.stopPropagation()}
                    >
                        <ValueDisplay encodedValue={outputValue} mode="full" />
                    </PopoverContent>
                </Popover>}
        </div>
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
// #endregion Handle


interface ConfigProps<T> {
    /** @default `value` */
    id?: string
    label: string
    children: React.ComponentType<{
        id: string
        value: T | undefined
        onChange: (value: T) => void
    }>
    defaultValue?: T
}

// #region Config
function Config<T = any>({ children: Child, id = "value", label, defaultValue }: ConfigProps<T>) {

    const gbx = useGraphBuilder()
    const nodeId = useNodeId()
    const value = gbx.useStore(s => s.nodes.get(nodeId)!.config[id] as T | undefined)
    const onChange = (newValue: T) => {
        gbx.mutateNodeState(nodeId, n => {
            n.config[id] = newValue
        })
    }

    useEffect(() => {
        if (value === undefined && defaultValue !== undefined)
            onChange(defaultValue)
    }, [value, defaultValue])

    const MemoizedChild = useMemo(() => Child, [id, gbx])
    const passedValue = value === undefined ? defaultValue : value

    return (
        <div className="flex flex-col items-stretch gap-2">
            <Label>{label}</Label>
            <MemoizedChild id={id} value={passedValue} onChange={onChange} />
        </div>
    )
}


interface NodeContentProps {
    children: React.ReactNode
}

// #region NodeContent
function NodeContent({
    children
}: NodeContentProps) {
    return children
}




/*
So tailwind loads all these colors for node highlights.
shadow-slate-400/40
shadow-gray-400/40
shadow-zinc-400/40
shadow-neutral-400/40
shadow-stone-400/40
shadow-red-400/40
shadow-orange-400/40
shadow-amber-400/40
shadow-yellow-400/40
shadow-lime-400/40
shadow-green-400/40
shadow-emerald-400/40
shadow-teal-400/40
shadow-cyan-400/40
shadow-sky-400/40
shadow-blue-400/40
shadow-indigo-400/40
shadow-violet-400/40
shadow-purple-400/40
shadow-fuchsia-400/40
shadow-pink-400/40
shadow-rose-400/40
 */