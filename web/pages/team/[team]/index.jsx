import { Button, Divider, Input, Skeleton, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, useDisclosure } from "@nextui-org/react"
import DashboardLayout from "@web/components/dashboard/DashboardLayout"
import IntegrationCard from "@web/components/dashboard/IntegrationCard"
import InviteModal from "@web/components/dashboard/InviteModal"
import TeamUserActions from "@web/components/dashboard/TeamUserActions"
import Group from "@web/components/layout/Group"
import { useUser } from "@web/modules/auth"
import { useDatabaseMutation } from "@web/modules/db"
import { plural } from "@web/modules/grammar"
import { useIntegrationAccountsForTeam } from "@web/modules/integrations"
import { useQueryParam } from "@web/modules/router"
import { useSearch } from "@web/modules/search"
import { isEditor, useTeam, useTeamInvitees, useTeamMembers } from "@web/modules/teams"
import { useSyncToState } from "@web/modules/util"
import { resolve as resolveIntegration } from "integrations/web"
import { useState } from "react"
import { TbEye, TbMailFast, TbPencil, TbPuzzle, TbSettings, TbUserPlus, TbUsersGroup } from "react-icons/tb"


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
        selector: account => `${account.displayId} ${resolveIntegration(account.serviceName).name}`,
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

    const { data: invitees } = useTeamInvitees()
    const inviteesAsMembers = invitees?.map(invitee => ({
        id: invitee.userId,
        email: invitee.email,
        roles: [],
        isInvited: true,
    }))

    const allMembers = [...(members || []), ...(inviteesAsMembers || [])]

    return (
        <Table aria-label="Member table">
            <TableHeader>
                <TableColumn>Email</TableColumn>
                <TableColumn>Role</TableColumn>
                <TableColumn>Actions</TableColumn>
            </TableHeader>
            <TableBody items={allMembers}>
                {member => {
                    const isMe = member.id === user?.id

                    return (
                        <TableRow key={member.id + member.roles.toString()}>
                            <TableCell>
                                {member.email}
                                {isMe &&
                                    <span className="text-default-500"> (you)</span>}
                            </TableCell>
                            <TableCell>
                                <Group className="gap-unit-xs w-32 flex-nowrap">
                                    {member.isInvited ? <>
                                        <TbMailFast />
                                        <span>Invited</span>
                                    </> :
                                        isEditor(member.roles) ? <>
                                            <TbPencil />
                                            <span>Editor</span>
                                        </> : <>
                                            <TbEye />
                                            <span>Viewer</span>
                                        </>}
                                </Group>
                            </TableCell>
                            <TableCell>
                                {!isMe &&
                                    <TeamUserActions {...member} />}
                            </TableCell>
                        </TableRow>
                    )
                }}
            </TableBody>
        </Table>
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

