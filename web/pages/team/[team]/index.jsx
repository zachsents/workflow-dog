import { Button, Divider, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Skeleton, Spinner, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, useDisclosure } from "@nextui-org/react"
import { useQuery } from "@tanstack/react-query"
import DashboardLayout from "@web/components/dashboard/DashboardLayout"
import IntegrationCard from "@web/components/dashboard/IntegrationCard"
import Group from "@web/components/layout/Group"
import { useUser } from "@web/modules/auth"
import { useDatabaseMutation } from "@web/modules/db"
import { plural } from "@web/modules/grammar"
import { INTEGRATION_INFO, useIntegrationAccountsForTeam } from "@web/modules/integrations"
import { useQueryParam } from "@web/modules/router"
import { useSearch } from "@web/modules/search"
import { supabase } from "@web/modules/supabase"
import { isEditor, useTeam, useTeamMembers, useTeamRoles } from "@web/modules/teams"
import { useDebouncedState, useSyncToState } from "@web/modules/util"
import { useState } from "react"
import { TbCheck, TbDots, TbEye, TbPencil, TbPencilOff, TbPuzzle, TbSettings, TbUserMinus, TbUserPlus, TbUsersGroup, TbX } from "react-icons/tb"


export default function TeamPage() {

    const { data: team } = useTeam()

    const inviteDisclosure = useDisclosure()

    return (
        <DashboardLayout
            title={<>
                <p className="text-default-500 text-xl">Team</p>
                {team?.name ?
                    <p>{team?.name}</p> :
                    <Skeleton className="w-[20rem] h-[1em] rounded-md" />}
            </>}
        >
            <div className="flex flex-col gap-unit-xl">
                <section id="general" className="flex flex-col gap-unit-xl">
                    <SectionHeader icon={TbSettings}>
                        General
                    </SectionHeader>
                    {team &&
                        <GeneralSection />}
                </section>

                <Divider />

                <section id="members" className="flex flex-col gap-unit-xl">
                    <SectionHeader
                        icon={TbUsersGroup}
                        rightContent={<Button
                            onPress={inviteDisclosure.onOpen}
                            startContent={<TbUserPlus />}
                            color="primary"
                        >
                            Invite
                        </Button>}
                    >
                        Members
                    </SectionHeader>
                    {team &&
                        <MembersSection />}
                </section>

                <Divider />

                <section id="integrations" className="flex flex-col gap-unit-xl">
                    <SectionHeader icon={TbPuzzle}>
                        Connected Integrations
                    </SectionHeader>
                    {team &&
                        <IntegrationsSection />}
                </section>
            </div>

            <InviteModal
                isOpen={inviteDisclosure.isOpen}
                onOpenChange={inviteDisclosure.onOpenChange}
            />
        </DashboardLayout>
    )
}


function GeneralSection() {
    const [teamId] = useQueryParam("team")
    const { data: team } = useTeam()

    const [currentName, setName] = useState()
    const syncNames = useSyncToState(team?.name, setName)

    const updateName = useDatabaseMutation(
        (supa) => {
            if (!currentName.trim())
                throw new Error("Team name cannot be empty")

            return supa
                .from("teams")
                .update({ name: currentName })
                .eq("id", teamId)
        },
        {
            invalidateKey: ["team", teamId],
            enabled: !!teamId,
            showErrorNotification: true,
            notification: {
                title: null,
                message: "Team name updated",
            }
        }
    )

    return (
        <Group className="gap-unit-xs">
            <Input
                type="text"
                name="teamName"
                label="Team Name"
                isDisabled={!team}
                value={currentName || ""}
                onValueChange={setName}
            />
            {team?.name && currentName !== team?.name &&
                <>
                    <Button
                        onPress={() => updateName.mutate()}
                        isLoading={updateName.isPending}
                        color="primary"
                    >
                        Save
                    </Button>
                    <Button
                        onPress={syncNames}
                        variant="light"
                    >
                        Reset
                    </Button>
                </>}
        </Group>
    )
}


function IntegrationsSection() {

    const integrationsQuery = useIntegrationAccountsForTeam(undefined, ["id", "display_id", "type"])

    const [filteredAccounts, query, setQuery] = useSearch(integrationsQuery?.data ?? [], {
        selector: account => `${account.displayId} ${INTEGRATION_INFO[account.type].name}`,
        highlight: false,
    })

    return (<>
        <Input
            type="text" size="sm"
            label={`Search ${integrationsQuery.data?.length || 0} ${plural("integration account", integrationsQuery.data?.length || 0)}`}
            value={query} onValueChange={setQuery}
        />
        {integrationsQuery.isLoading ?
            <div className="flex flex-col gap-unit-md">
                <Skeleton className="w-full h-20 rounded-xl" />
                <Skeleton className="w-full h-20 rounded-xl" />
                <Skeleton className="w-full h-20 rounded-xl" />
            </div> :
            filteredAccounts?.length > 0 ?
                <div className="grid grid-cols-2 gap-unit-xl">
                    {filteredAccounts.map(account =>
                        <IntegrationCard
                            id={account.id}
                            key={account.id}
                        />
                    )}
                </div> :
                <p className="text-default-500 text-center">
                    No integrations found
                </p>}
    </>)

}


function MembersSection() {

    const { data: user } = useUser()
    const { data: members } = useTeamMembers()

    return (
        <Table aria-label="Example static collection table">
            <TableHeader>
                <TableColumn>Email</TableColumn>
                <TableColumn>Role</TableColumn>
                <TableColumn>Actions</TableColumn>
            </TableHeader>
            <TableBody items={members || []}>
                {member => {
                    const isMe = member.id === user?.id

                    return (
                        <TableRow key={member.id}>
                            <TableCell>
                                {member.email}
                                {isMe &&
                                    <span className="text-default-500"> (you)</span>}
                            </TableCell>
                            <TableCell className="flex items-center gap-unit-xs w-32">
                                {isEditor(member.roles) ? <>
                                    <TbPencil />
                                    <span>Editor</span>
                                </> : <>
                                    <TbEye />
                                    <span>Viewer</span>
                                </>}
                            </TableCell>
                            <TableCell>
                                {!isMe &&
                                    <MemberActions {...member} />}
                            </TableCell>
                        </TableRow>
                    )
                }}
            </TableBody>
        </Table>
    )
}


function MemberActions({ id: memberId, roles }) {

    const [teamId] = useQueryParam("team")
    const { data: roleData } = useTeamRoles()

    const thisMemberIsEditor = isEditor(roles)

    const updateRoles = useDatabaseMutation(
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

    const removeFromTeam = useDatabaseMutation(
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
                disabledKeys={[
                    ...(roleData?.isEditor ? [] : ["remove", "make-viewer", "make-editor"])
                ]}
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



function SectionHeader({ icon: Icon, children, rightContent }) {

    return (
        <Group className="gap-unit-md justify-between">
            <Group className="gap-unit-md">
                {Icon && <Icon className="text-xl" />}
                <h2 className="text-xl font-medium">
                    {children}
                </h2>
            </Group>

            {rightContent}
        </Group>
    )
}


function InviteModal(props) {

    const [teamId] = useQueryParam("team")

    const [inviteeEmail, debouncedEmail, setInviteeEmail, isChanging] = useDebouncedState("", {
        debounce: 500,
    })

    const isValid = inviteeEmail && inviteeEmail.includes("@") && inviteeEmail.includes(".")

    const { data: doesUserExist, isPending } = useQuery({
        queryFn: async () => {
            if (!debouncedEmail)
                return false

            const { data } = await supabase.rpc("does_user_exist", { _email: debouncedEmail })
            return data
        },
        queryKey: ["userExists", debouncedEmail],
    })

    const isLoading = isPending || isChanging

    const invite = useDatabaseMutation(supa => supa.rpc("invite_user_to_team", {
        _email: inviteeEmail,
        _team_id: teamId,
    }), {
        enabled: isValid && !!teamId,
        notification: {
            title: null,
            message: "Invitation sent!"
        },
        showErrorNotification: true,
        throwSelectKey: null,
    })

    return (
        <Modal {...props} onClose={() => setInviteeEmail("", true)}>
            <ModalContent>
                <ModalHeader>
                    Invite member to team
                </ModalHeader>
                <ModalBody className="flex flex-col gap-unit-sm">
                    <Input
                        name="inviteeEmail"
                        label="Email" type="email"
                        value={inviteeEmail}
                        onValueChange={value => setInviteeEmail(value)}
                        autoFocus
                    />
                    {isValid &&
                        <Group className="gap-unit-sm text-small text-default-500">
                            {isLoading ?
                                <Spinner size="sm" /> :
                                doesUserExist ?
                                    <TbCheck className="text-success text-xl" /> :
                                    <TbX className="text-danger text-xl" />}
                            <p>
                                {isLoading ?
                                    "Looking up user..." :
                                    doesUserExist ?
                                        "User will be invited to your team." :
                                        "User doesn't have an account. Ask them to sign up first."}
                            </p>
                        </Group>}
                </ModalBody>
                <ModalFooter>
                    <Button
                        color="primary"
                        isDisabled={isLoading || !isValid || !doesUserExist}
                        onPress={() => invite.mutate()}
                        isLoading={invite.isPending}
                    >
                        Invite
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}