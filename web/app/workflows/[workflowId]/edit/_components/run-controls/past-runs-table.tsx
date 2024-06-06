"use client"

import { createColumnHelper, type ColumnDef } from "@tanstack/react-table"
import Loader from "@web/components/loader"
import { Button } from "@web/components/ui/button"
import { DataTable, DataTableRow } from "@web/components/ui/data-table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@web/components/ui/tooltip"
import { useCurrentWorkflowId } from "@web/lib/client/hooks"
import { trpc } from "@web/lib/client/trpc"
import { RouterOutput } from "@web/lib/types/trpc"
import { cn } from "@web/lib/utils"
import { useEditorStoreState } from "@web/modules/workflow-editor/store"
import { useRunWorkflowMutation } from "@web/modules/workflows"
import { TbEye, TbRotateClockwise2 } from "react-icons/tb"
import StatusIcon from "./status-icon"


type WorkflowRun = RouterOutput["workflows"]["runs"]["list"][0]

const columnHelper = createColumnHelper<WorkflowRun>()

const createColumns = (onClose: () => void): ColumnDef<WorkflowRun>[] => [
    columnHelper.display({
        id: "viewing",
        cell: ({ row }) =>
            <div className={cn(
                "pl-3 pr-1 text-lg",
                row.getIsSelected()
                    ? "opacity-100 text-primary"
                    : "opacity-0 group-hover/row:opacity-50 group-hover/row:text-muted-foreground",
            )}>
                <TbEye />
            </div>
    }),
    columnHelper.accessor("numeric_id", {
        header: "#",
        enableSorting: true,
        cell: ({ getValue }) =>
            <p>
                <span className="text-muted-foreground">#</span>
                <span className="font-bold">{getValue()}</span>
            </p>
    }),
    columnHelper.accessor("created_at", {
        header: "Date & Time",
        enableSorting: true,
        sortingFn: "datetime",
        sortDescFirst: true,
        cell: ({ getValue }) =>
            getValue().toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
            }),
    }),
    columnHelper.accessor(
        row => ["completed", "failed"].includes(row.status!)
            ? Math.abs((row.scheduled_for || row.created_at!).valueOf() - row.finished_at!.valueOf())
            : null,
        {
            id: "duration",
            header: "Duration",
            enableSorting: true,
            sortingFn: "basic",
            sortUndefined: -1,
            cell: ({ getValue }) => {
                const val = getValue()
                return val == null
                    ? "-"
                    : `${Math.round(val / 100) / 10}s`
            },
        }
    ),
    columnHelper.accessor("status", {
        header: "Status",
        enableSorting: true,
        cell: ({ row, getValue }) => {
            <StatusIcon
                status={getValue()}
                errorCount={row.original.error_count}
                hasErrors={row.original.has_errors}
            />
        }
    }),
    columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
            const workflowId = useCurrentWorkflowId()

            const runMutation = useRunWorkflowMutation(workflowId, {
                mutationKey: ["rerun", row.id],
            })
            const rerun = () => runMutation.mutateAsync({
                copyTriggerDataFrom: row.id
            }).then(onClose)

            return (
                <TooltipProvider delayDuration={0}>
                    <Tooltip>
                        <TooltipTrigger>
                            <Button
                                size="sm" variant="ghost"
                                onClick={ev => {
                                    ev.stopPropagation()
                                    rerun()
                                }}
                                disabled={runMutation.isPending}
                            >
                                {runMutation.isPending
                                    ? <Loader />
                                    : <TbRotateClockwise2 />}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Run current workflow with this trigger data</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )
        }
    })
]


interface PastRunsTableProps {
    onClose: () => void
}

export default function PastRunsTable({ onClose }: PastRunsTableProps) {

    const workflowId = useCurrentWorkflowId()
    const { data: runs, isLoading } = trpc.workflows.runs.list.useQuery({
        workflowId,
    })

    const [selectedRunId, setSelectedRunId] = useEditorStoreState<string | null>("selectedRunId")

    const rowSelection = selectedRunId ? {
        [selectedRunId]: true
    } : {}

    return (
        <DataTable
            data={runs || []} columns={createColumns(onClose)}
            tableOptions={{
                getRowId: (row) => row.id!,
                initialState: {
                    sorting: [{ id: "created_at", desc: true }]
                },
                enableRowSelection: true,
                enableMultiRowSelection: false,
                onRowSelectionChange: (updater) => {
                    if (typeof updater !== "function")
                        return

                    const newRunId = Object.keys(updater(rowSelection))[0] || null
                    setSelectedRunId(newRunId)
                    onClose?.()
                },
                state: {
                    rowSelection,
                },
            }}
            className="border-none rounded-none [&_th_button]:px-1 first:[&_th]:pl-4 last:[&_th]:pr-4 [&_td]:p-1 [&_td]:text-xs [&_td]:text-center [&_td]:text-nowrap"

            empty={isLoading
                ? <Loader className="mx-auto" />
                : "No runs yet."}
        >
            {row =>
                <DataTableRow
                    row={row}
                    className="group/row cursor-pointer"
                    onClick={() => row.toggleSelected()}
                    key={row.id}
                />}
        </DataTable>
    )
}