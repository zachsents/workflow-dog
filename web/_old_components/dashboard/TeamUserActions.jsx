import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@nextui-org/react"
import { useMutation } from "@tanstack/react-query"
import { useSupabaseMutation } from "@web/modules/db"
import { useQueryParam } from "@web/modules/router"
import { isEditor, useInviteToTeam, useTeamRoles } from "@web/modules/teams"
import { TbDots, TbMailCancel, TbPencil, TbPencilOff, TbRefresh, TbUserMinus } from "react-icons/tb"


export default function TeamUserActions({ isInvited, ...member }) {
    return isInvited ?
        <InviteeActions {...member} /> :
        <MemberActions {...member} />
}


function MemberActions({ id: memberId, roles }) {

    const [teamId] = useQueryParam("team")
    const { data: roleData } = useTeamRoles()

    const thisMemberIsEditor = isEditor(roles)

    const updateRoles = useSupabaseMutation(
        (supa, toEditor) => supa
            .from("users_teams")
            .update({
                roles: toEditor ? ["viewer", "editor"] : ["viewer"],
            })
            .eq("user_id", memberId)
            .eq("team_id", teamId),
        {
            invalidateKey: ["teamMembers", teamId],
            notification: {
                title: null,
                message: "Member updated",
            },
            throwSelectKey: "*",
        }
    )

    const removeFromTeam = useSupabaseMutation(
        supa => supa
            .from("users_teams")
            .delete()
            .eq("user_id", memberId)
            .eq("team_id", teamId),
        {
            invalidateKey: ["teamMembers", teamId],
            notification: {
                title: null,
                message: "Member removed",
                classNames: { icon: "!bg-danger" },
            },
            throwSelectKey: "*",
        }
    )

    const isLoading = updateRoles.isPending || removeFromTeam.isPending

    return (
        <Dropdown placement="bottom-end">
            <DropdownTrigger>
                <Button
                    isIconOnly size="sm" variant="light"
                    isLoading={isLoading}
                >
                    <TbDots />
                </Button>
            </DropdownTrigger>
            <DropdownMenu
                aria-label="Member actions"
                disabledKeys={roleData?.isEditor ? [] : ["remove", "make-viewer", "make-editor"]}
            >
                {thisMemberIsEditor ?
                    <DropdownItem
                        onPress={() => updateRoles.mutate(false)}
                        startContent={<TbPencilOff />}
                        key="make-viewer"
                    >
                        Make Viewer
                    </DropdownItem> :
                    <DropdownItem
                        onPress={() => updateRoles.mutate(true)}
                        startContent={<TbPencil />}
                        key="make-editor"
                    >
                        Make Editor
                    </DropdownItem>}

                <DropdownItem
                    onPress={() => removeFromTeam.mutate()}
                    startContent={<TbUserMinus />} color="danger"
                    key="remove"
                >
                    Remove from team
                </DropdownItem>
            </DropdownMenu>
        </Dropdown>
    )
}


function InviteeActions({ id: memberId, email }) {

    const [teamId] = useQueryParam("team")
    const { data: roleData } = useTeamRoles()

    const cancelInvitation = useSupabaseMutation(
        supa => supa
            .from("team_invitations")
            .delete()
            .eq("user_id", memberId)
            .eq("team_id", teamId),
        {
            invalidateKey: ["teamInvitees", teamId],
            notification: {
                title: null,
                message: "Invitation cancelled",
                classNames: { icon: "!bg-danger" },
            },
            throwSelectKey: "*",
        }
    )

    const invite = useInviteToTeam(undefined, email, true)

    const resendInvitation = useMutation({
        mutationFn: async () => {
            await cancelInvitation.mutateAsync()
            await invite.mutateAsync()
        }
    })

    const isLoading = cancelInvitation.isPending || resendInvitation.isPending

    return (
        <Dropdown placement="bottom-end">
            <DropdownTrigger>
                <Button
                    isIconOnly size="sm" variant="light"
                    isLoading={isLoading}
                >
                    <TbDots />
                </Button>
            </DropdownTrigger>
            <DropdownMenu
                aria-label="Member actions"
                disabledKeys={roleData?.isEditor ? [] : ["cancel-invitation", "resend-invitation"]}
            >
                <DropdownItem
                    onPress={() => resendInvitation.mutate()}
                    startContent={<TbRefresh />}
                    key="resend-invitation"
                >
                    Resend Invitation
                </DropdownItem>
                <DropdownItem
                    onPress={() => cancelInvitation.mutate()}
                    startContent={<TbMailCancel />}
                    key="cancel-invitation"
                >
                    Cancel Invitation
                </DropdownItem>
            </DropdownMenu>
        </Dropdown>
    )
}