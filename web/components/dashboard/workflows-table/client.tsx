"use client"

import { Badge } from "@ui/badge"
import { Button } from "@ui/button"
import { Card } from "@ui/card"
import { DataTable, type DataTableColumnDef } from "@ui/data-table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@ui/tooltip"
import Loader from "@web/components/Loader"
import { useAction } from "@web/lib/client/actions"
import { useFromStoreList } from "@web/lib/queries/store"
import type { Database, Json } from "@web/lib/types/supabase-db"
import { cn } from "@web/lib/utils"
import Link from "next/link"
import { TriggerDefinitions } from "packages/web"
import { TbArrowRight } from "react-icons/tb"
import { setWorkflowIsEnabled } from "./actions"


type Workflow = Database["public"]["Tables"]["workflows"]["Row"] & {
    trigger_type: Json
}

const columns: DataTableColumnDef<Partial<Workflow>>[] = [
    {
        id: "info",
        accessorFn: (row) => ({ name: row.name, triggerType: row.trigger_type }),
        header: "Name",
        sortable: true,
        cell: ({ row }) => {
            const { name, triggerType } = row.getValue("info") as {
                name: string
                triggerType: string
            }

            return (
                <div className="px-4 py-6">
                    <b>{name}</b>
                    <p className="text-muted-foreground">
                        {TriggerDefinitions.get(triggerType)?.whenName || "Unknown trigger"}
                    </p>
                </div>
            )
        }
    },
    {
        accessorKey: "is_enabled",
        header: "Status",
        sortable: true,
        cell: ({ row }) => {
            const isEnabled = row.getValue("is_enabled") as boolean

            const [setEnabled, { isPending }] = useAction(
                setWorkflowIsEnabled.bind(null, row.id!)
            )

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
                                onClick={(ev) => {
                                    ev.stopPropagation()
                                    setEnabled(!isEnabled)
                                }}
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
    },
    {
        accessorKey: "created_at",
        header: "Created",
        sortable: true,
    },
    {
        id: "edit",
        cell: ({ row }) => <Button
            variant="ghost"
            className="workflow-edit-button opacity-0 group-hover/row:opacity-100"
            asChild
        >
            <Link href={`/workflows/${row.id}/edit`}>
                Edit
                <TbArrowRight className="ml-2" />
            </Link>
        </Button>,
    }
]

export default function WorkflowsTableClient({
    workflows: passedWorkflows
}: {
    workflows: Partial<Workflow>[]
}) {
    const workflows = useFromStoreList(passedWorkflows.map(wf => ({
        path: ["workflows", wf.id!],
        initial: wf,
    })))

    return (
        <Card className="shadow-lg">
            <DataTable
                data={workflows} columns={columns}
                classNames={{
                    wrapper: "!border-none",
                    cell: "py-0",
                    row: "cursor-pointer group/row",
                }}
                props={{
                    row: {
                        role: "button",
                        onClick: (ev) => {
                            const btn: HTMLButtonElement = ev.currentTarget
                                .querySelector(".workflow-edit-button")!
                            btn.click()
                        }
                    }
                }}
                tableOptions={{
                    getRowId: (row) => row.id!,
                }}
            />
        </Card>
    )
}