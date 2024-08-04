import { zodResolver } from "@hookform/resolvers/zod"
import { Portal as HoverCardPortal } from "@radix-ui/react-hover-card"
import { IconBracketsContain, IconChevronDown, IconDots, IconList, IconPlus, IconX } from "@tabler/icons-react"
import { Button } from "@ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@ui/dropdown-menu"
import { Form, FormControl, FormDescription, FormField, FormItem, FormMessage } from "@ui/form"
import { Card } from "@web/components/ui/card"
import { getDefinitionPackageName, useGraphBuilder, useNode, useNodeId, useRegisterHandle, type HandleState, type HandleType } from "@web/lib/graph-builder"
import { useDialogState, useElementChangeRef, useStateChange } from "@web/lib/hooks"
import { cn, getOffsetRelativeTo, type RequiredExcept } from "@web/lib/utils"
import React, { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { useValueType, ValueTypeDefinitions, type ValueTypeUsage } from "workflow-types/react"
import { z } from "zod"
import TI from "./tabler-icon"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"



// #region StandardNode
export function StandardNode({
    children = [],
    withPackageBadge = true,
}: {
    children?: StandardNodeChild | StandardNodeChild[]
    withPackageBadge?: boolean
}) {
    const gbx = useGraphBuilder()
    const id = useNodeId()
    const n = useNode()
    const def = gbx.getNodeDefinition(n.definitionId)

    if (!Array.isArray(children)) children = [children]
    const handleFilter = (handleType: HandleType) => (c: StandardNodeChild) =>
        validHandleComponents.includes(c.type.name)
        && (c.props as HandleProps | MultiHandleProps).type === handleType
    const inputs = children.filter(handleFilter("input"))
    const outputs = children.filter(handleFilter("output"))
    const configItems = children.filter(c => c.type.name === Config.name)
    const contentItems = children.filter(c => c.type.name === NodeContent.name)

    const isSelected = gbx.useStore(s => s.selection.has(id))
    const showSelectHoverOutline = gbx.useStore(s => !s.connection && !s.boxSelection)

    const packageDisplayName = getDefinitionPackageName(n.definitionId)
    const isColorHexCode = def.color.startsWith("#")

    return (
        <Card className={cn(
            "select-none outline-primary outline-2 outline-offset-2 flex flex-col items-stretch gap-4 py-1",
            isSelected
                ? "outline"
                : (showSelectHoverOutline && "hover:outline-dashed")
        )}>
            <div
                className={cn(
                    "font-bold px-4 py-1 text-center text-white mx-1 rounded-t-lg rounded-b-sm flex justify-center items-center gap-2",
                    !isColorHexCode && `bg-${def.color}-600`,
                )}
                style={isColorHexCode ? { backgroundColor: def.color } : undefined}
            >
                <def.icon />
                <span>{def.name}</span>

                {withPackageBadge && packageDisplayName &&
                    <span className="bg-white/30 px-2 py-0.5 rounded-sm ml-3 text-xs font-medium leading-none">
                        {packageDisplayName}
                    </span>}
            </div>

            <div className="flex items-start justify-between gap-4 last:mb-3">
                <div className="flex flex-col items-stretch gap-2">
                    {inputs}
                </div>
                {contentItems.length > 0 &&
                    <div>
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
                            size="sm" variant="ghost"
                            className="self-center h-auto py-0.5 rounded-sm flex-center gap-1 text-muted-foreground text-[0.5rem]"
                        >
                            Configure {configItems.length} option{configItems.length > 1 && "s"}
                            <TI><IconChevronDown /></TI>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent
                        side="bottom" sideOffset={16}
                        className="px-2 py-4 flex flex-col items-stretch gap-2"
                    >
                        {configItems}
                    </PopoverContent>
                </Popover>}
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

type MultiHandlePropsWithDefaults = RequiredExcept<MultiHandleProps, "itemValueType">

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
    /** Handles are required by default. This option is ignored for outputs. */
    optional?: boolean
}

// #region Handle
function Handle({
    type, name, indexingId = name,
    displayName = name.replaceAll(/(?<!\w)[a-z]/g, c => c.toUpperCase()),
    valueType,
    allowNaming = false, onNameClick,
    optional = false,
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
        isConnectingAtAll, isConnectingToUs, canConnectToUs, isConnected,
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
                            !isConnectingAtAll && `${isInput
                                ? isConnected
                                    ? "hover:bg-green-400/50"
                                    : optional ? "hover:bg-yellow-400/50" : "hover:bg-red-400/50"
                                : "hover:bg-blue-400/50"
                            } cursor-crosshair`,
                            (isConnectingAtAll && !canConnectToUs) && "opacity-0",
                        )}
                        ref={childRef}
                        onPointerDownCapture={onPointerDownCapture}
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


interface ConfigProps {
    /** @default `value` */
    id?: string
    label: string
    children: React.ComponentType<{
        id: string
        value: any
        onChange: (value: any) => void
    }>
    defaultValue?: any
}

// #region Config
function Config({ children: Child, id = "value", label, defaultValue }: ConfigProps) {

    const gbx = useGraphBuilder()
    const nodeId = useNodeId()
    const value = gbx.useStore(s => {
        const val = s.nodes.get(nodeId)!.config[id]
        return val === undefined ? defaultValue : val
    })
    const onChange = (newValue: any) => {
        gbx.mutateNodeState(nodeId, n => {
            n.config[id] = newValue
        })
    }

    useEffect(() => {
        if (value === undefined && defaultValue !== undefined)
            onChange(defaultValue)
    }, [value, defaultValue])

    return (
        <div className="flex flex-col items-stretch gap-2">
            <Label>{label}</Label>
            <Child
                id={id}
                value={value}
                onChange={onChange}
            />
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

So tailwind loads these colors:

bg-slate-600
bg-gray-600
bg-zinc-600
bg-neutral-600
bg-stone-600
bg-red-600
bg-orange-600
bg-amber-600
bg-yellow-600
bg-lime-600
bg-green-600
bg-emerald-600
bg-teal-600
bg-cyan-600
bg-sky-600
bg-blue-600
bg-indigo-600
bg-violet-600
bg-purple-600
bg-fuchsia-600
bg-pink-600
bg-rose-600

*/