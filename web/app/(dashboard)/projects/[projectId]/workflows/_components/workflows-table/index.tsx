"use client"

import { Card } from "@ui/card"
import { DataTable, DataTableRow } from "@ui/data-table"
import Loader from "@web/components/loader"
import { trpc } from "@web/lib/client/trpc"
import type { Triggers, Workflows } from "shared/db"
import columns from "./columns"


export type WorkflowRow = Workflows & { triggers: Triggers[] }

interface WorkflowsTableProps {
    projectId: string
}

export default function WorkflowsTable({projectId}: WorkflowsTableProps) {

    const { data: workflows, isLoading } = trpc.workflows.list.useQuery({
        projectId,
    }, {
        enabled: !!projectId,
    })

    return (
        <Card className="shadow-lg overflow-clip">
            {isLoading
                ? <Loader className="mx-auto my-10" />
                : <DataTable
                    className="border-none"
                    data={workflows as any as WorkflowRow[] ?? []}
                    columns={columns as any}
                    tableOptions={{
                        getRowId: (row) => row.id as any as string,
                        initialState: {
                            sorting: [{ id: "last_edited_at", desc: true }]
                        },
                    }}
                >
                    {(row) =>
                        <DataTableRow
                            row={row}
                            className="cursor-pointer group/row [&_td]:py-0"
                            role="button"
                            onClick={ev => {
                                const btn: HTMLButtonElement = ev.currentTarget
                                    .querySelector(".workflow-edit-button")!
                                btn.click()
                            }}
                            key={row.id}
                        />}
                </DataTable>}
        </Card>
    )
}