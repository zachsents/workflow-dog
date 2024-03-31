"use client"

import { ColumnDef, Row } from "@tanstack/react-table"
import { Button } from "@ui/button"
import { DataTable } from "@ui/data-table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@ui/dropdown-menu"
import { useAction } from "@web/lib/client/actions"
import { useCurrentProjectId } from "@web/lib/client/hooks"
import { useFromStoreList } from "@web/lib/queries/store"
import { cn } from "@web/lib/utils"
import { TbCheck, TbDots, TbPencil, TbPencilOff, TbUserMinus } from "react-icons/tb"
import { changeEditorRole, removeMember } from "../../actions"


type Member = {
    id: string
    email: string
    isEditor: boolean
    isViewer: boolean
    isYou: boolean
}

const columns: ColumnDef<Partial<Member>>[] = [
    {
        accessorKey: "email",
        header: "Email",
        enableSorting: true,
        cell: ({ row }) =>
            <p className="px-4">
                <span>{row.getValue("email")}</span>
                {row.original.isYou &&
                    <span className="text-muted-foreground">{" "}(you)</span>}
            </p>
    },
    {
        accessorKey: "isViewer",
        header: "Viewer",
        enableSorting: true,
        cell: ({ getValue }) => getValue()
            ? <TbCheck className="mx-8" />
            : null,
    },
    {
        accessorKey: "isEditor",
        header: "Editor",
        enableSorting: true,
        cell: ({ getValue }) => getValue()
            ? <TbCheck className="mx-8" />
            : null,
    },
    {
        id: "actions",
        cell: ({ row }) => <ActionsMenu row={row} />,
    },
]

export default function MembersTableClient({
    members: passedMembers
}: {
    members: Partial<Member>[]
}) {
    const projectId = useCurrentProjectId()

    const members = useFromStoreList(passedMembers.map(member => ({
        path: ["projects", projectId!, "members", member.id!],
        initial: member,
    })))

    return (
        <DataTable
            data={members} columns={columns}
            tableOptions={{
                getRowId: (row) => row.id!,
            }}
            empty="No members."
        />
    )
}


function ActionsMenu({ row }: { row: Row<Partial<Member>> }) {
    const projectId = useCurrentProjectId()
    const isYou = row.original.isYou

    const [allowEditing] = useAction(
        changeEditorRole.bind(null, projectId, row.id),
        {
            showLoadingToast: true,
            showErrorToast: true,
            successToast: "Role changed!",
        }
    )

    const [removeMemberAction] = useAction(
        removeMember.bind(null, projectId, row.id),
        {
            showLoadingToast: true,
            showErrorToast: true,
            successToast: "Removed member!",
        }
    )

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost" size="icon"
                    disabled={isYou}
                >
                    <TbDots className={cn(isYou && "opacity-0")} />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {row.getValue("isEditor")
                    ? <DropdownMenuItem onSelect={() => void allowEditing(false)}>
                        <TbPencilOff className="mr-2" />
                        Disallow editing
                    </DropdownMenuItem>
                    : <DropdownMenuItem onSelect={() => void allowEditing(true)}>
                        <TbPencil className="mr-2" />
                        Allow editing
                    </DropdownMenuItem>}

                <DropdownMenuItem
                    onSelect={() => removeMemberAction()}
                    className="text-destructive"
                >
                    <TbUserMinus className="mr-2" />
                    Remove from team
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}