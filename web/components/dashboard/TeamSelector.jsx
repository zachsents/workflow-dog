import { useLocalStorage } from "@mantine/hooks"
import { Button, Select, SelectItem, Tooltip } from "@nextui-org/react"
import { useQueryParam } from "@web/modules/router"
import { useTeamsForUser } from "@web/modules/teams"
import { useUser } from "@zachsents/fire-query"
import Link from "next/link"
import { useEffect } from "react"
import { TbSettings, TbUsers } from "react-icons/tb"
import Group from "../layout/Group"


export default function TeamSelector({ includeSettingsLink = true }) {

    const { data: user } = useUser()

    const [storedSelectedTeam, setStoredSelectedTeam] = useLocalStorage({
        key: "selectedTeam",
    })

    const [selectedTeam, setSelectedTeam] = useQueryParam("team", {
        defaultValue: storedSelectedTeam || undefined,
        method: "push",
    })
    const selectTeam = teamId => {
        setSelectedTeam(teamId)
        setStoredSelectedTeam(teamId)
    }

    const teams = useTeamsForUser()

    useEffect(() => {
        if (selectedTeam || storedSelectedTeam || !teams || !user)
            return

        const personalTeam = teams.find(team => team.isPersonal && team.creator === user?.uid)
        if (personalTeam)
            selectTeam(personalTeam.id)
    }, [selectedTeam, storedSelectedTeam, teams, user?.uid])

    return (
        <Group className="gap-unit-md">
            <Select
                label="Team"
                placeholder={teams ? teams.length ? "Select a team" : "No teams available" : "Loading teams..."}
                startContent={<TbUsers />}
                isDisabled={!teams}
                size="sm"
                selectedKeys={(selectedTeam && teams) ? [selectedTeam] : []}
                onChange={ev => ev.target.value && selectTeam(ev.target.value)}
                className="w-[20rem] shrink-0"
            >
                {teams?.map(team => (
                    <SelectItem key={team.id} value={team.id}>
                        {team.name}
                    </SelectItem>
                ))}
            </Select>

            {includeSettingsLink &&
                <Tooltip placement="bottom" content="Manage Team" closeDelay={0}>
                    <Button
                        isIconOnly variant="light"
                        as={Link} href={`/team/${selectedTeam}`}
                        isDisabled={!selectedTeam}
                    >
                        <TbSettings />
                    </Button>
                </Tooltip>}
        </Group>
    )
}
