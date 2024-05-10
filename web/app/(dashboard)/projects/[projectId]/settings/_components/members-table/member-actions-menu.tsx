"use client"

import type { CellContext } from "@tanstack/react-table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@ui/dropdown-menu"
import Loader from "@web/components/loader"
import { Button } from "@web/components/ui/button"
import { useCurrentProjectId } from "@web/lib/client/hooks"
import { trpc } from "@web/lib/client/trpc"
import { cn } from "@web/lib/utils"
import { useUser } from "@web/modules/auth"
import { TbDots, TbPencil, TbPencilOff, TbUserMinus } from "react-icons/tb"
import { toast } from "sonner"
import type { MemberRow } from "."


export default function MemberActionsMenu({ row }: CellContext<MemberRow, unknown>) {
    const projectId = useCurrentProjectId()

    const { data: user } = useUser()
    const isYou = row.original.id === user?.id

    const utils = trpc.useUtils()

    const {
        mutate: changePermissions,
        isPending: isChangingPermissions,
    } = trpc.projects.members.changePermissions.useMutation({
        onSuccess: () => {
            utils.projects.members.list.invalidate()
            toast.success("Permissions changed!")
        },
    })

    const allowEditing = () => void changePermissions({
        projectId,
        memberId: row.id,
        addPermissions: ["write"],
    })

    const disallowEditing = () => void changePermissions({
        projectId,
        memberId: row.id,
        removePermissions: ["write"],
    })

    const {
        mutate: _removeMember,
        isPending: isRemovingMember,
    } = trpc.projects.members.remove.useMutation({
        onSuccess: () => {
            utils.projects.members.list.invalidate()
            toast.success("Member removed!")
        },
    })

    const removeMember = () => void _removeMember({
        projectId,
        memberId: row.id,
    })

    const {
        mutate: _cancelInvitation,
        isPending: isCancelingInvitation,
    } = trpc.projects.invitations.cancel.useMutation({
        onSuccess: () => {
            utils.projects.invitations.list.invalidate()
            toast.success("Invitation canceled!")
        },
    })

    const cancelInvitation = () => void _cancelInvitation({
        projectId,
        invitationId: row.id,
    })

    const isLoading = isChangingPermissions
        || isRemovingMember
        || isCancelingInvitation

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost" size="icon"
                    disabled={isYou || isLoading}
                >
                    {isLoading
                        ? <Loader />
                        : <TbDots className={cn(isYou && "opacity-0 pointer-events-none")} />}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {row.original.isInvitation
                    ? <DropdownMenuItem
                        onSelect={cancelInvitation}
                        className="text-destructive flex items-center gap-2"
                    >
                        <TbUserMinus />
                        Cancel invitation
                    </DropdownMenuItem>
                    : <>
                        {row.getValue("canWrite")
                            ? <DropdownMenuItem
                                onSelect={disallowEditing}
                                className="flex items-center gap-2"
                            >
                                <TbPencilOff />
                                Disallow editing
                            </DropdownMenuItem>
                            : <DropdownMenuItem
                                onSelect={allowEditing}
                                className="flex items-center gap-2"
                            >
                                <TbPencil />
                                Allow editing
                            </DropdownMenuItem>}

                        <DropdownMenuItem
                            onSelect={removeMember}
                            className="text-destructive flex items-center gap-2"
                        >
                            <TbUserMinus />
                            Remove from team
                        </DropdownMenuItem>
                    </>}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}