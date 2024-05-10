"use client"

import { createColumnHelper, type CellContext } from "@tanstack/react-table"
import { useUser } from "@web/modules/auth"
import { TbCheck } from "react-icons/tb"
import type { MemberRow } from "."
import MemberActionsMenu from "./member-actions-menu"
import { Badge } from "@web/components/ui/badge"


/*
    These columns use the project ID from the URL even though the table
    itself takes in a project ID as a prop. I'm not using the table
    anywhere where the project ID would be different from the one in the URL,
    so it doesn't matter. If I were to use the table in a different context,
    I would need to change the way the project ID is accessed here.
*/


const columnHelper = createColumnHelper<MemberRow>()

const emailColumn = columnHelper.accessor("email", {
    header: "Email",
    enableSorting: true,
    sortingFn: "text",
    cell: ({ row, getValue }) => {
        const { data: user } = useUser()
        const isYou = row.original.id === user?.id

        return (
            <div className="px-4 flex items-center gap-4">
                <span>{getValue()}</span>
                {isYou &&
                    <Badge className="pointer-events-none rounded-full">
                        You
                    </Badge>}
                {row.original.isInvitation &&
                    <Badge
                        variant="secondary"
                        className="pointer-events-none rounded-full"
                    >
                        Invited
                    </Badge>}
            </div>
        )
    }
})

const canReadColumn = columnHelper.accessor(({ permissions }) => permissions?.includes("read"), {
    id: "canRead",
    header: "Can View",
    enableSorting: true,
    sortingFn: "basic",
    cell: CheckCell,
})

const canWriteColumn = columnHelper.accessor(({ permissions }) => permissions?.includes("write"), {
    id: "canWrite",
    header: "Can Edit",
    enableSorting: true,
    sortingFn: "basic",
    cell: CheckCell,
})

const actionsColumn = columnHelper.display({
    id: "actions",
    enableSorting: false,
    cell: MemberActionsMenu,
})

export const columns = [
    emailColumn,
    canReadColumn,
    canWriteColumn,
    actionsColumn,
]


function CheckCell(props: CellContext<MemberRow, boolean | undefined>) {
    return props.getValue()
        ? <TbCheck className="mx-8" />
        : null
}