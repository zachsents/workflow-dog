"use client"

import { useClickOutside } from "@react-hookz/web"
import { Badge } from "@ui/badge"
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
import { Input } from "@ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@ui/tooltip"
import Loader from "@web/components/loader"
import { cn } from "@web/lib/utils"
import { useSupabaseMutation } from "@web/modules/db"
import { useSyncToState } from "@web/modules/util"
import { useEditorSettings } from "@web/modules/workflow-editor/settings"
import { useWorkflow } from "@web/modules/workflows"
import { toPng } from "html-to-image"
import Link from "next/link"
import { useRef, useState } from "react"
import { TbArrowLeft, TbGridPattern, TbLayoutList, TbMap, TbMenu2, TbPhoto } from "react-icons/tb"


export default function EditWorkflowHeader() {

    const { isSuccess: hasWorkflowLoaded } = useWorkflow()

    return (
        <div
            className={cn(
                "absolute top-0 left-1/2 -translate-x-1/2 z-50 flex center flex-nowrap gap-10 text-primary-foreground bg-slate-800 px-4 py-1 rounded-b-lg shadow-lg transition-transform",
                !hasWorkflowLoaded && "-translate-y-full"
            )}
        >
            <HeaderMenu />

            <EditableTitle />

            <WorkflowStatusBadge />

            {/* TODO: Implement UsersOnline component with Supabase Realtime */}
            {/* <UsersOnline /> */}

            {/* <Button size="sm" variant="secondary" asChild>
                <a
                    href="https://google.com" target="_blank"
                    className="group flex center gap-2 hover:scale-105 transition-transform"
                >
                    <TbHeart className="group-hover:scale-150 group-hover:fill-red-500 transition" />
                    Leave Feedback
                    <TbExternalLink />
                </a>
            </Button> */}
        </div>
    )
}


function HeaderMenu() {

    const {
        data: workflow,
        isSuccess: hasWorkflowLoaded,
    } = useWorkflow()

    const [settings, setSetting] = useEditorSettings()

    const downloadImage = () => {
        toPng(document.getElementById("workflow-graph-editor")!, {
            // width: bounds.width,
            // height: bounds.height,
        }).then(dataUrl => {
            const a = document.createElement("a")
            const fileName = (workflow?.name || "workflow")
                .replaceAll(/[^\w\-]+/g, "_")
            a.setAttribute("download", `${fileName}.png`)
            a.setAttribute("href", dataUrl)
            a.click()
        })
    }

    return (<>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <TbMenu2 />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center">
                <DropdownMenuItem asChild disabled={!hasWorkflowLoaded}>
                    <Link href={`/projects/${workflow?.team_id}/workflows`}>
                        <TbArrowLeft className="mr-2" />
                        Back to Workflows
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                    disabled={!hasWorkflowLoaded}
                    onSelect={downloadImage}
                >
                    <TbPhoto className="mr-2" />
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
                <DropdownMenuCheckboxItem
                    checked={settings?.verticalLayout || false}
                    onCheckedChange={checked => void setSetting("verticalLayout", checked)}
                >
                    <TbLayoutList className="mr-2" />
                    Vertical Node Layout
                </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
        </DropdownMenu>
    </>)
}


function EditableTitle() {

    const { data: workflow } = useWorkflow()

    const [tempName, setTempName] = useState(workflow?.name ?? "")
    const resetName = () => void setTempName(workflow?.name ?? "")
    useSyncToState(workflow?.name, setTempName)

    const updateName = useSupabaseMutation(
        (supabase) => supabase
            .from("workflows")
            .update({ name: tempName })
            .eq("id", workflow?.id!),
        {
            enabled: !!workflow && tempName !== workflow.name,
            invalidateKey: ["workflow", workflow?.id],
        }
    )

    const nameInputRef = useRef<HTMLInputElement>(null)
    const [nameInputWidth, setNameInputWidth] = useState(0)
    useClickOutside(nameInputRef, () => void updateName.mutate(null))

    /* TODO: change to form with onSubmit for accessibility */
    return (
        <div className="relative">
            <Input
                className="border-none hover:bg-white/10 focus:bg-white/75 focus:text-foreground text-center max-w-xl text-ellipsis focus:text-clip"
                style={{ width: nameInputWidth + 65 }}
                value={tempName}
                onChange={ev => setTempName(ev.currentTarget.value)}
                onFocus={ev => ev.currentTarget.select()}
                onKeyDown={ev => {
                    switch (ev.key) {
                        case "Enter": updateName.mutate(null)
                            break
                        case "Escape": resetName()
                            break
                        default: return
                    }
                    ev.preventDefault()
                    ev.currentTarget.blur()
                }}
                ref={nameInputRef}
            />

            <div className={cn(
                "absolute top-1/2 left-full -translate-y-1/2 px-2",
                updateName.isPending ? "opacity-100" : "opacity-0",
            )}>
                <Loader className={cn(!updateName.isPending && "!animate-none")} />
            </div>

            <p
                className="absolute pointer-events-none opacity-0 text-sm"
                ref={el => {
                    if (!el) return
                    setNameInputWidth(el.offsetWidth)
                }}
            >
                {tempName}
            </p>
        </div>
    )
}


function WorkflowStatusBadge() {

    const { data: workflow, isSuccess: hasWorkflowLoaded } = useWorkflow()
    const isEnabled = workflow?.is_enabled || false

    const setEnabled = useSupabaseMutation(
        (supabase) => supabase
            .from("workflows")
            .update({ is_enabled: !isEnabled })
            .eq("id", workflow?.id!),
        {
            enabled: !!workflow,
            invalidateKey: ["workflow", workflow?.id],
        }
    )

    const { isPending } = setEnabled

    return (
        <TooltipProvider>
            <Tooltip delayDuration={0}>
                <TooltipTrigger>
                    <Badge
                        variant={isEnabled ? "default" : "secondary"}
                        className={cn(
                            isEnabled && "bg-green-500 hover:bg-green-700",
                            isPending && "opacity-50 pointer-events-none cursor-not-allowed",
                            !hasWorkflowLoaded && "text-transparent",
                        )}
                        onClick={() => void setEnabled.mutate(null)}
                        aria-disabled={isPending}
                    >
                        {isPending && <Loader mr />}
                        {isEnabled ? "Enabled" : "Disabled"}
                    </Badge>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{isEnabled ? "Disable" : "Enable"}?</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}