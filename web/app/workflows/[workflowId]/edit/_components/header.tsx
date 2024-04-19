"use client"

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
import { TbArrowLeft, TbDots, TbExternalLink, TbGridPattern, TbHeart, TbMap, TbPhoto } from "react-icons/tb"
import colors from "tailwindcss/colors"
import HeaderContainer from "./header-container"
import { PastRuns, RunManually } from "./run-controls/run-controls"
import TriggerControl from "./trigger-control"
import WorkflowStatusBadge from "./workflow-status-badge"


export default function EditWorkflowHeader() {
    return (
        <HeaderContainer className="gap-4 rounded-lg px-6">
            <BackButton />
            <div className="mx-10">
                <EditableTitle />
            </div>
            <div className="mx-2">
                <WorkflowStatusBadge />
            </div>
            <TriggerControl />
            <RunManually />
            <PastRuns />
            <HeaderMenu />

            {/* TODO: Implement UsersOnline component with Supabase Realtime */}
            {/* <UsersOnline /> */}
        </HeaderContainer>
    )
}


function BackButton() {

    const projectId = useWorkflow().data?.team_id

    return (
        <TooltipProvider delayDuration={0}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={projectId ? `/projects/${projectId}/workflows` : "#"}>
                            <TbArrowLeft />
                        </Link>
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" align="start">
                    <p>
                        Back to project dashboard
                    </p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
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
                    <Link href={`/projects/${workflow?.team_id}/workflows`}>
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


function EditableTitle() {

    const { data: workflow } = useWorkflow()

    const [tempName, setTempName] = useState(workflow?.name ?? "")
    const resetName = () => void setTempName(workflow?.name ?? "")
    useSyncToState(workflow?.name, setTempName)

    const updateName = useSupabaseMutation(
        (supabase) => supabase
            .from("workflows")
            .update({ name: tempName })
            .eq("id", workflow?.id!) as any,
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

