"use client"

import { TriggerDefinitions } from "@pkg/client"
import { Card } from "@ui/card"
import { DataTable, DataTableRow } from "@ui/data-table"
import Loader from "@web/components/loader"
import SearchInput from "@web/components/search-input"
import { useSearch } from "@web/lib/client/hooks"
import { trpc } from "@web/lib/client/trpc"
import type { Selectable } from "kysely"
import type { Triggers, Workflows } from "shared/db"
import { columns } from "./columns"


export type WorkflowRow = Selectable<Workflows> & { triggers: Selectable<Triggers>[] }

/**
 * "Type instantiation is excessively deep and possibly infinite."
 */
// export type WorkflowRow = RouterOutput["workflows"]["list"][0]


interface WorkflowsTableProps {
    projectId: string
}

export default function WorkflowsTable({ projectId }: WorkflowsTableProps) {

    const { data: workflows, isLoading } = trpc.workflows.list.useQuery({
        projectId,
    })

    const search = useSearch(workflows ?? [], {
        mapFn: w => ({
            id: w.id,
            name: w.name,
            triggers: w.triggers
                .map(t => TriggerDefinitions.get(t.def_id)?.name)
                .filter(Boolean) as string[],
        }),
        keys: ["name", "triggers"],
    })

    return (
        <div className="flex-v items-stretch gap-4">
            <SearchInput
                value={search.query}
                onValueChange={search.setQuery}
                quantity={workflows?.length}
                noun="workflow"
                withHotkey
            />

            <Card className="shadow-lg overflow-clip">
                {isLoading
                    ? <Loader className="mx-auto my-10" />
                    : <DataTable
                        className="border-none"
                        data={search.filtered}
                        columns={columns}
                        tableOptions={{
                            getRowId: (row) => row.id,
                            initialState: {
                                sorting: [{ id: "last_edited_at", desc: true }]
                            },
                            state: {},
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
        </div>
    )
}