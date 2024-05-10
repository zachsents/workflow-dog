"use client"

import Loader from "@web/components/loader"
import { DataTable } from "@web/components/ui/data-table"
import { trpc } from "@web/lib/client/trpc"
import { RouterOutput } from "@web/lib/types/trpc"
import { columns } from "./columns"


export type MemberRow = RouterOutput["projects"]["members"]["list"][0] & {
    isInvitation?: boolean
}


interface MembersTableProps {
    projectId: string
}

export default function MembersTable({ projectId }: MembersTableProps) {

    const {
        data: members,
        isLoading,
    } = trpc.projects.members.list.useQuery({ projectId })

    const {
        data: invitations,
    } = trpc.projects.invitations.list.useQuery({ projectId })

    const rows: MemberRow[] = [
        ...(members ?? []),
        ...(invitations?.map(inv => ({
            id: inv.id,
            email: inv.invitee_email,
            name: inv.invitee_email,
            permissions: [],
            isInvitation: true,
        })) ?? []),
    ]

    return isLoading
        ? <Loader className="mx-auto my-10" />
        : <DataTable
            data={rows}
            columns={columns}
            tableOptions={{
                getRowId: (row) => row.id!,
                initialState: {
                    sorting: [{ id: "email", desc: false }]
                },
            }}
            empty="No members."
        />
} 