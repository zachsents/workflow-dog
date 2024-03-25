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
import Loader from "@web/components/loader"
import { Badge } from "@ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@ui/tooltip"
import { cn } from "@web/lib/utils"
import { useSupabaseMutation } from "@web/modules/db"
import { useSyncToState } from "@web/modules/util"
import { useEditorSettings } from "@web/modules/workflow-editor/settings"
import { useWorkflow } from "@web/modules/workflows"
import Link from "next/link"
import { useRef, useState } from "react"
import { TbArrowLeft, TbExternalLink, TbGridPattern, TbHeart, TbMap, TbMenu2 } from "react-icons/tb"


export default function EditWorkflowHeader() {

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

    return (
        <div className="flex items-center justify-between flex-nowrap bg-slate-800 text-primary-foreground px-4 py-2">
            <div className="flex-1 flex items-center">
                <HeaderMenu />
            </div>

            {/* TODO: change to form with onSubmit for accessibility */}
            <div
                className="flex center relative gap-2"
                style={{ width: nameInputWidth + 65 }}
            >
                <Input
                    className="border-none hover:bg-white/10 focus:bg-white/75 focus:text-foreground"
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
                {updateName.isPending &&
                    <Loader />}
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

            <div className="flex-1 flex justify-end">
                <div className="flex items-center gap-6">
                    <WorkflowStatusBadge />

                    {/* <WorkflowStatusChip withKeyboardShortcut /> */}

                    {/* TODO: Implement UsersOnline component with Supabase Realtime */}
                    {/* <UsersOnline /> */}

                    <Button size="sm" variant="secondary" asChild>
                        <a
                            href="https://google.com" target="_blank"
                            className="group flex center gap-2 hover:scale-105 transition-transform"
                        >
                            <TbHeart className="group-hover:scale-150 group-hover:fill-red-500 transition" />
                            Leave Feedback
                            <TbExternalLink />
                        </a>
                    </Button>
                </div>
            </div>
        </div>
    )
}


function HeaderMenu() {

    const { data: workflow } = useWorkflow()
    const [settings, setSetting] = useEditorSettings()

    return (<>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <TbMenu2 />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
                <DropdownMenuItem asChild>
                    <Link href={`/projects/${workflow?.team_id}/workflows`}>
                        <TbArrowLeft className="mr-2" />
                        Back to Workflows
                    </Link>
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


function WorkflowStatusBadge() {

    const { data: workflow } = useWorkflow()
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