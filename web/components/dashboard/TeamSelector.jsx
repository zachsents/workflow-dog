import { useLocalStorage } from "@mantine/hooks"
import { Button, Select, SelectItem, Tooltip } from "@nextui-org/react"
import { useUser } from "@web/modules/auth"
import { useQueryParam } from "@web/modules/router"
import { useTeamRoles, useTeamsForUser } from "@web/modules/teams"
import Link from "next/link"
import { useEffect } from "react"
import { TbEye, TbPencil, TbSettings, TbUsers } from "react-icons/tb"
import Group from "../layout/Group"


export default function TeamSelector({ includeSettingsLink = true }) {

    const { data: user } = useUser()

    const [storedSelectedTeamId, setStoredSelectedTeamId] = useLocalStorage({
        key: "selectedTeam",
    })

    const [selectedTeamId, setSelectedTeamId] = useQueryParam("team", {
        method: "push",
    })
    const selectTeam = teamId => {
        setSelectedTeamId(teamId)
        setStoredSelectedTeamId(teamId)
    }

    const { data: teams } = useTeamsForUser()
    const currentTeam = teams?.find(team => team.id === selectedTeamId)

    useEffect(() => {
        if (currentTeam || !teams || !user)
            return

        if (storedSelectedTeamId && teams.some(team => team.id === storedSelectedTeamId))
            selectTeam(storedSelectedTeamId)

        const personalTeam = teams.find(team => team.isPersonal && team.creator === user.id)
        if (personalTeam)
            selectTeam(personalTeam.id)
    }, [currentTeam, storedSelectedTeamId, teams, user?.id])


    return (
        <Group className="gap-unit-md">
            <Select
                label="Team"
                placeholder={teams ? teams.length ? "Select a team" : "No teams available" : "Loading teams..."}
                startContent={<TbUsers />}
                isDisabled={!teams}
                size="sm"
                selectedKeys={(selectedTeamId && teams) ? [selectedTeamId] : []}
                onChange={ev => ev.target.value && selectTeam(ev.target.value)}
                className="w-[20rem] shrink-0"
            >
                {teams?.map(team => (
                    <SelectItem
                        key={team.id} value={team.id}
                        description={<TeamDescription teamId={team.id} />}
                    >
                        {team.name}
                    </SelectItem>
                ))}
            </Select>

            {includeSettingsLink &&
                <Tooltip
                    placement="bottom"
                    content={`Manage ${currentTeam?.name ? `"${currentTeam.name}"` : "Team"}`}
                    closeDelay={0}
                >
                    <Button
                        isIconOnly variant="light"
                        as={Link} href={`/team/${selectedTeamId}`}
                        isDisabled={!currentTeam}
                    >
                        <TbSettings />
                    </Button>
                </Tooltip>}
        </Group>
    )
}


function TeamDescription({ teamId }) {

    const { data: roleData } = useTeamRoles(undefined, teamId)

    let Icon, label
    if (roleData?.isEditor) {
        Icon = TbPencil
        label = "Editor"
    }
    else if (roleData?.isViewer) {
        Icon = TbEye
        label = "Viewer"
    }

    return (
        <Group className="gap-unit-xs">
            {Icon &&
                <Icon />}
            <span>{label}</span>
        </Group>
    )
}