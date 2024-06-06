"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useClickOutside } from "@react-hookz/web"
import { Button } from "@ui/button"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@ui/dropdown-menu"
import { Form, FormControl, FormField, FormItem } from "@ui/form"
import { Input } from "@ui/input"
import Loader from "@web/components/loader"
import SimpleTooltip from "@web/components/simple-tooltip"
import { useBooleanState, useCurrentProjectId, useCurrentWorkflowId } from "@web/lib/client/hooks"
import { trpc } from "@web/lib/client/trpc"
import { cn } from "@web/lib/utils"
import { useEditorSettings } from "@web/modules/workflow-editor/settings"
import { useEditorStore } from "@web/modules/workflow-editor/store"
import { useWorkflow } from "@web/modules/workflows"
import { toPng } from "html-to-image"
import Link from "next/link"
import { useRef } from "react"
import { useForm } from "react-hook-form"
import { TbArrowLeft, TbBellRinging, TbDots, TbExternalLink, TbGridPattern, TbHeart, TbMap, TbPhoto, TbRun, TbVectorBezier2 } from "react-icons/tb"
import { toast } from "sonner"
import colors from "tailwindcss/colors"
import { z } from "zod"
import { MostRecentRun, PastRuns } from "./run-controls/run-controls"
import TriggerControl from "./trigger-control"
import WorkflowStatusBadge from "./workflow-status-badge"


const headerBoxClassnames = "text-primary-foreground bg-slate-900/80 backdrop-blur-sm py-1 rounded-md shadow-lg pointer-events-auto"


export default function EditWorkflowHeader() {
    const projectId = useCurrentProjectId("workflow")

    return (
        <div className="w-screen flex justify-between items-stretch gap-2 p-2 flex-nowrap">
            <div className={cn(headerBoxClassnames, "px-1")} >
                <SimpleTooltip
                    tooltip="Back to project dashboard"
                    triggerProps={{ asChild: true }}
                    contentProps={{
                        side: "bottom", align: "start",
                        sideOffset: 10, alignOffset: -4
                    }}
                >
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={projectId ? `/projects/${projectId}/workflows` : "#"}>
                            <TbArrowLeft />
                        </Link>
                    </Button>
                </SimpleTooltip>
            </div>

            <div className={cn(
                headerBoxClassnames,
                "grow pl-4 pr-2 flex justify-between items-center gap-4",
            )}>
                <div className="flex center gap-2 grow">
                    <TbVectorBezier2 className="text-lg" />
                    <EditableTitle />
                </div>
                <div className="flex center gap-4">
                    <SavingIndicator />
                    <WorkflowStatusBadge />
                    <HeaderMenu />
                </div>
            </div>

            <div className={cn(headerBoxClassnames, "flex center gap-2 pl-4 pr-2")}>
                <TbBellRinging className="text-lg" />
                <TriggerControl />
            </div>


            <div className={cn(headerBoxClassnames, "flex center gap-2 pl-4 pr-2")}>
                <TbRun className="text-lg" />
                {/* <RunManually /> */}
                <MostRecentRun />
                <PastRuns />
            </div>

            {/* TODO: Implement UsersOnline component with Supabase Realtime */}
            {/* <UsersOnline /> */}
        </div >
    )
}


function SavingIndicator() {
    const isSaving = useEditorStore(s => s.saving)

    return (
        <p className="w-20 text-xs opacity-50 text-center">
            {isSaving ? "Saving..." : "Saved"}
        </p>
    )
}


function HeaderMenu() {

    const {
        data: workflow,
        isSuccess: hasWorkflowLoaded,
    } = useWorkflow()

    const [settings, setSetting] = useEditorSettings()

    const downloadImage = () => {
        setTimeout(() => {
            toPng(document.querySelector("#workflow-graph-editor .react-flow__pane") as HTMLElement, {
                backgroundColor: colors.slate[50],
            }).then(dataUrl => {
                const a = document.createElement("a")
                const fileName = (workflow?.name || "workflow")
                    .replaceAll(/[^\w\-]+/g, "_")
                a.setAttribute("download", `${fileName}.png`)
                a.setAttribute("href", dataUrl)
                a.click()
            })
        }, 0)
    }

    return (<>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <TbDots />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="center" side="bottom" sideOffset={10}
            >
                <DropdownMenuItem asChild disabled={!hasWorkflowLoaded}>
                    <Link href={`/projects/${workflow?.project_id}/workflows`}>
                        <TbArrowLeft className="mr-2" />
                        Back to Workflows
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <a
                        href="/feedback" target="_blank"
                        className="group flex between gap-2"
                    >
                        <div className="flex center gap-2">
                            <TbHeart className="group-hover:scale-125 group-hover:fill-red-500 transition" />
                            Leave Feedback
                        </div>
                        <TbExternalLink />
                    </a>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Workflow</DropdownMenuLabel>
                <DropdownMenuItem
                    disabled={!hasWorkflowLoaded}
                    onSelect={downloadImage}
                >
                    <TbPhoto className="mr-2 hover:fill-blue-300" />
                    Export Image (PNG)
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Editor Settings</DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                    checked={settings?.showGrid || false}
                    onCheckedChange={checked => void setSetting("showGrid", checked)}
                >
                    <TbGridPattern className="mr-2" />
                    Show Grid
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                    checked={settings?.showMinimap || false}
                    onCheckedChange={checked => void setSetting("showMinimap", checked)}
                >
                    <TbMap className="mr-2" />
                    Show Minimap
                </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
        </DropdownMenu>
    </>)
}


const titleFormSchema = z.object({
    workflowName: z.string(),
})

function EditableTitle() {

    const utils = trpc.useUtils()

    const workflowId = useCurrentWorkflowId()
    const { data: workflow } = useWorkflow()

    const form = useForm<z.infer<typeof titleFormSchema>>({
        resolver: zodResolver(titleFormSchema),
        values: {
            workflowName: workflow?.name ?? "",
        },
    })

    const {
        mutateAsync: rename,
        isPending,
    } = trpc.workflows.rename.useMutation({
        onSuccess: () => {
            utils.workflows.list.invalidate()
            utils.workflows.byId.invalidate({ id: workflowId })
            toast.success("Workflow renamed!")
        },
        onError: (err) => {
            console.debug(err)
            toast.error(err.data?.message)
            form.reset()
        },
    })

    async function onSubmit(values: z.infer<typeof titleFormSchema>) {
        if (form.getFieldState("workflowName").isDirty)
            await rename({
                workflowId,
                name: values.workflowName,
            })
    }

    const inputRef = useRef<HTMLInputElement>(null)
    const formRef = useRef<HTMLFormElement>(null)
    useClickOutside(
        formRef,
        () => void formRef.current?.requestSubmit(),
        ["pointerdown"],
    )

    const [isFocused, focus, blur] = useBooleanState()

    return (
        <SimpleTooltip
            tooltip={<div className="max-w-md text-center">
                <p>Editing workflow "{workflow?.name ?? "Untitled workflow"}"</p>
                <p className="text-xs text-muted-foreground">
                    Click to edit workflow name
                </p>
            </div>}
            triggerProps={{ className: "grow" }}
            contentProps={{ side: "bottom", align: "center", sideOffset: 10 }}
        >
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className={cn(
                        "rounded-md flex items-center cursor-text transition-colors",
                        isFocused ? "bg-white/75" : "hover:bg-white/10",
                    )}
                    onClick={() => void inputRef.current?.focus()}
                    ref={formRef}
                >
                    <FormField
                        control={form.control}
                        name="workflowName"
                        render={({ field }) => (
                            <FormItem className="space-y-0 flex-1">
                                <FormControl>
                                    <Input
                                        className="border-none focus:text-foreground text-ellipsis focus:text-clip"
                                        style={{ boxShadow: "none" }}
                                        placeholder="Workflow name"
                                        {...field}
                                        onFocus={ev => {
                                            ev.currentTarget.select()
                                            focus()
                                        }}
                                        onBlur={blur}
                                        onKeyDown={ev => {
                                            if (ev.key === "Escape") {
                                                ev.preventDefault()
                                                ev.currentTarget.blur()
                                                form.reset()
                                            }
                                        }}
                                        ref={inputRef}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                        disabled={isPending}
                    />

                    <div className="pointer-events-none px-4">
                        {isPending
                            ? <Loader />
                            : isFocused
                                ? <p className="text-xs text-muted-foreground">
                                    Press Esc to cancel
                                </p>
                                : null}
                    </div>
                </form>
            </Form>
        </SimpleTooltip>
    )
}

