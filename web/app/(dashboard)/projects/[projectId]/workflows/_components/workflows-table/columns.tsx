"use client"

import { ColumnDef, createColumnHelper } from "@tanstack/react-table"
import { Badge } from "@ui/badge"
import { Button } from "@ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@ui/tooltip"
import Loader from "@web/components/loader"
import { Portal } from "@web/components/portal"
import { trpc } from "@web/lib/client/trpc"
import { cn } from "@web/lib/utils"
import dayjs from "@web/modules/dayjs"
import Link from "next/link"
import { TriggerDefinitions } from "packages/client"
import { TbArrowRight } from "react-icons/tb"
import { WorkflowRow } from "."
import WorkflowActionsMenu from "./workflow-actions-menu"



const columnHelper = createColumnHelper<WorkflowRow>()

const nameColumn = columnHelper.accessor("name", {
    header: "Name",
    enableSorting: true,
    sortingFn: "alphanumeric",
    cell: ({ row, getValue }) => {
        const triggerType = row.original.triggers[0]?.def_id
        return (
            <div className="px-4 py-6">
                <b>{getValue() || "Unknown Workflow"}</b>
                <p className="text-muted-foreground">
                    {triggerType
                        ? (TriggerDefinitions.get(triggerType)?.whenName
                            || "Unknown trigger")
                        : "No trigger set"}
                </p>
            </div>
        )
    }
})

const enabledColumn = columnHelper.accessor("is_enabled", {
    header: "Status",
    enableSorting: true,
    sortingFn: "basic",
    cell: ({ row, getValue }) => {
        const isEnabled = getValue()

        const utils = trpc.useUtils()

        const { mutate, isPending } = trpc.workflows.setEnabled.useMutation({
            onSuccess: () => void utils.workflows.list.invalidate(),
        })
        const setEnabled = (value: boolean) => mutate({
            workflowId: row.id,
            isEnabled: value,
        })

        return (
            <div className="ml-4">
                <Portal stopPropagation={["onClick"]}>
                    <TooltipProvider>
                        <Tooltip delayDuration={0}>
                            <TooltipTrigger>
                                <Badge
                                    variant={isEnabled ? "default" : "secondary"}
                                    className={cn(
                                        isEnabled && "bg-green-500 hover:bg-green-700",
                                        isPending && "opacity-50 pointer-events-none cursor-not-allowed",
                                    )}
                                    onClick={() => void setEnabled(!isEnabled)}
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
                </Portal>
            </div>
        )
    }
})

const lastEditedColumn = columnHelper.accessor("last_edited_at", {
    header: "Last Edited",
    enableSorting: true,
    sortingFn: "datetime",
    cell: ({ getValue }) => {
        const val = getValue()
        return (
            <p className="ml-4">
                {val && val.getTime() > 0
                    ? dayjs(val).fromNow()
                    : "Never"}
            </p>
        )
    },
})

const lastRanColumn = columnHelper.accessor("last_ran_at", {
    header: "Last Ran",
    enableSorting: true,
    sortingFn: "datetime",
    cell: ({ getValue }) => {
        const val = getValue()
        return (
            <p className="ml-4">
                {val && val.getTime() > 0
                    ? dayjs(val).fromNow()
                    : "Never"}
            </p>
        )
    },
})

const createdColumn = columnHelper.accessor("created_at", {
    header: "Created",
    enableSorting: true,
    sortingFn: "datetime",
    cell: ({ getValue }) => <p className="ml-4">
        {getValue().toLocaleDateString(undefined, {
            dateStyle: "medium",
        })}
    </p>,
})

const editColumn = columnHelper.display({
    id: "edit",
    cell: ({ row }) =>
        <Button
            variant="ghost"
            className="workflow-edit-button opacity-0 group-hover/row:opacity-100"
            asChild
        >
            <Link
                href={`/workflows/${row.id}/edit`}
                className="flex center gap-2"
            >
                Edit
                <TbArrowRight />
            </Link>
        </Button>,
})

const actionsColumn = columnHelper.display({
    id: "actions",
    cell: WorkflowActionsMenu,
})


export const columns: ColumnDef<WorkflowRow, unknown>[] = [
    nameColumn,
    enabledColumn,
    lastEditedColumn,
    lastRanColumn,
    // createdColumn,
    editColumn,
    actionsColumn,
]
