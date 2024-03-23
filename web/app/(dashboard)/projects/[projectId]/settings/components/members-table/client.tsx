"use client"

import { Button } from "@ui/button"
import { DataTable, type DataTableColumnDef } from "@ui/data-table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@ui/dropdown-menu"
import { useAction } from "@web/lib/client/actions"
import { useFromStore, useFromStoreList, useQueryStore } from "@web/lib/queries/store"
import { cn, useCurrentProjectId } from "@web/lib/utils"
import { TbCheck, TbDots, TbPencil, TbPencilOff, TbUserMinus } from "react-icons/tb"
import { changeEditorRole, removeMember } from "../../actions"

type Member = {
    id: string
    email: string
    isEditor: boolean
    isViewer: boolean
    isYou: boolean
}

const columns: DataTableColumnDef<Partial<Member>>[] = [
    {
        id: "email",
        accessorFn: (row) => ({ email: row.email, isYou: row.isYou }),
        header: "Email",
        sortable: true,
        cell: ({ row }) => {
            const { email, isYou } = row.getValue("email") as {
                email: string,
                isYou: boolean
            }
            return (
                <p className="px-4">
                    <span>{email}</span>
                    {isYou &&
                        <span className="text-muted-foreground">{" "}(you)</span>}
                </p>
            )
        }
    },
    {
        accessorKey: "isViewer",
        header: "Viewer",
        sortable: true,
        cell: ({ row }) => row.getValue("isViewer")
            ? <TbCheck className="mx-8" />
            : null,
    },
    {
        accessorKey: "isEditor",
        header: "Editor",
        sortable: true,
        cell: ({ row }) => row.getValue("isEditor")
            ? <TbCheck className="mx-8" />
            : null,
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const projectId = useCurrentProjectId()
            const { isYou } = row.getValue("email") as { isYou: boolean }

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
        },
    }
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
        />
    )
}