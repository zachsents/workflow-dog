import { ActionIcon, Button, Center, Divider, Group, Popover, SegmentedControl, Stack, Text, Tooltip, useMantineTheme } from "@mantine/core"
import { useDisclosure, useLocalStorage } from "@mantine/hooks"
import { LOCAL_STORAGE_KEYS, WORKFLOW_RUN_LOAD_LIMIT } from "@web/modules/constants"
import { durationSeconds } from "@web/modules/grammar"
import { stopPropagation } from "@web/modules/props"
import { useWorkflowRecentRuns } from "@web/modules/workflows"
import classNames from "classnames"
import { useEffect, useMemo, useState } from "react"
import { TbAlertCircle, TbCheck, TbLayoutGrid, TbList, TbLoader } from "react-icons/tb"
import { RUN_STATUS, isStatusFinished } from "shared"
import ScrollBox from "./ScrollBox"
import TimeAgo from "javascript-time-ago"


export default function WorkflowRunSelector({ controlled = false, withPopover = false, value, onChange, children, stopPropagationEvents, closeOnSelect = false }) {

    const [opened, popoverHandlers] = useDisclosure(false)
    const runs = useWorkflowRecentRuns(undefined, Infinity)

    const [runViewerMode, setRunViewerMode] = useLocalStorage({
        key: LOCAL_STORAGE_KEYS.RUN_VIEWER_MODE,
        defaultValue: "tile",
    })

    const [selectedRunId, _setSelectedRunId] = controlled ? useState() : [value]
    const setSelectedRunId = (...args) => {
        _setSelectedRunId?.(...args)
        onChange?.(...args)
        if (closeOnSelect)
            popoverHandlers.close()
    }
    const selectedRun = runs?.find(run => run.id == selectedRunId)

    const selectedRunLabel = useMemo(() => {
        if (!selectedRunId || !selectedRun)
            return "Select a run"

        return selectedRun.queuedAt.toDate().toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
        }) + ` - ${selectedRun.status}`
    }, [selectedRunId, selectedRun])

    useEffect(() => {
        console.debug("Selected run:", selectedRunId)
    }, [selectedRunId])

    const inner =
        <Stack spacing="xs">
            <Group position="apart" noWrap>
                {withPopover ? <Text>Runs</Text> : children}
                <RunViewerModeSelector
                    value={runViewerMode}
                    onChange={setRunViewerMode}
                />
            </Group>

            <RunViewer
                value={selectedRunId}
                onChange={setSelectedRunId}
                mode={runViewerMode}
            />

            {runs?.length == 0 &&
                <Text ta="center" color="dimmed" size="xs">
                    No runs
                </Text>}

            {runs?.length == WORKFLOW_RUN_LOAD_LIMIT &&
                <Text ta="center" color="dimmed" size="xs">
                    Only the last {WORKFLOW_RUN_LOAD_LIMIT} runs are shown
                </Text>}
        </Stack>

    return withPopover ?
        <Popover
            width="20rem" position="bottom-end" withinPortal shadow="sm"
            opened={opened} onOpen={popoverHandlers.open} onClose={popoverHandlers.close}
        >
            <Popover.Target>
                <div onClick={popoverHandlers.toggle}>
                    {children ??
                        <Button
                            variant={selectedRunId ? "outline" : "filled"}
                            my="xxs"
                        >
                            {selectedRunLabel}
                        </Button>}
                </div>
            </Popover.Target>
            <Popover.Dropdown
                px={0} h="24rem"
                {...stopPropagationEvents !== false && stopPropagation(stopPropagationEvents)}
            >
                <ScrollBox insideFlex>
                    <div className="px-md">
                        {inner}
                    </div>
                </ScrollBox>
            </Popover.Dropdown>
        </Popover> :
        inner
}



export function RunViewerModeSelector({ value, onChange }) {

    return (
        <SegmentedControl
            value={value}
            onChange={onChange}
            classNames={{
                label: "p-0"
            }}
            data={[
                {
                    value: "list",
                    label: <Tooltip label="List View" withinPortal>
                        <Center px="xs" py="xxxs">
                            <TbList />
                        </Center>
                    </Tooltip>,
                },
                {
                    value: "tile",
                    label: <Tooltip label="Tile View" withinPortal>
                        <Center px="xs" py="xxxs">
                            <TbLayoutGrid />
                        </Center>
                    </Tooltip>,
                },
            ]}
        />
    )
}


export function RunViewer({ value, onChange, mode }) {

    const runs = useWorkflowRecentRuns(undefined, Infinity)

    const runGroups = useMemo(() => {
        const groups = {}

        runs?.forEach(run => {
            const date = run.queuedAt.toDate().toLocaleString(undefined, {
                dateStyle: "medium",
            })
            groups[date] ??= []
            groups[date].push(run)
        })

        Object.values(groups).forEach(group => {
            group.sort((a, b) => b.queuedAt.toDate() - a.queuedAt.toDate())
        })

        const groupsArr = Object.entries(groups).map(([date, runs]) => ({ date, runs }))
        groupsArr.sort((a, b) => new Date(b.date) - new Date(a.date))

        return groupsArr
    }, [runs])

    return (
        <Stack spacing="xl">
            {runGroups.map(group =>
                <Stack spacing="xs" key={group.date}>
                    <Divider label={group.date} />

                    {mode === "list" &&
                        <Stack spacing={0}>
                            {group.runs.map(run =>
                                <RunRow
                                    run={run}
                                    selected={value == run.id}
                                    onSelect={() => onChange?.(run.id)}
                                    key={run.id}
                                />
                            )}
                        </Stack>}

                    {mode === "tile" &&
                        <Group spacing="xs">
                            {group.runs.map(run =>
                                <RunTile
                                    run={run}
                                    selected={value == run.id}
                                    onSelect={() => onChange?.(run.id)}
                                    key={run.id}
                                />
                            )}
                        </Group>}
                </Stack>
            )}
        </Stack>
    )
}


export const statusColors = {
    [RUN_STATUS.PENDING]: "blue",
    [RUN_STATUS.RUNNING]: "blue",
    [RUN_STATUS.FAILED]: "red",
    [RUN_STATUS.COMPLETED]: "green",
}

export const statusIcons = {
    [RUN_STATUS.PENDING]: () => <TbLoader className="animate-spin" />,
    [RUN_STATUS.RUNNING]: () => <TbLoader className="animate-spin" />,
    [RUN_STATUS.FAILED]: TbAlertCircle,
    [RUN_STATUS.COMPLETED]: TbCheck,
}


function RunTile({ run, onSelect, selected }) {

    const Icon = statusIcons[run.status]

    return (
        <RunTooltip
            run={run} selected={selected}
            withArrow
        >
            <ActionIcon
                variant="filled" color={statusColors[run.status]} radius="sm" size="lg"
                className={classNames({
                    "aspect-square text-xl group": true,
                    "!outline !outline-4 !outline-yellow outline-offset-2": selected,
                })}
                onClick={onSelect}
            >
                <Center className="text-white opacity-60 group-hover:opacity-100">
                    {Icon && <Icon />}
                </Center>
            </ActionIcon>
        </RunTooltip>
    )
}


function RunRow({ run, onSelect, selected }) {

    const Icon = statusIcons[run.status]

    const runDate = run.queuedAt.toDate()
    const isToday = runDate.toLocaleDateString() == new Date().toLocaleDateString()
    const label = isToday ?
        `${new TimeAgo("en-US").format(runDate)}` :
        run.queuedAt.toDate().toLocaleString(undefined, {
            // dateStyle: "medium",
            // timeStyle: "short",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
        })

    return (
        <RunTooltip
            run={run} selected={selected}
            position="left" withArrow
        >
            <Group
                noWrap
                className={classNames({
                    "cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-500 px-md py-xs rounded": true,
                    "outline outline-2 outline-yellow z-10": selected,
                })}
                onClick={onSelect}
            >
                <Center c={statusColors[run.status]} className="text-xl">
                    {Icon && <Icon />}
                </Center>
                <Text size="sm">
                    {label}
                </Text>
            </Group>
            {/* <Button
                variant="subtle" color="gray" radius="sm" fullWidth
                className={classNames({
                    "font-normal": true,
                    "!outline !outline-4 !outline-yellow outline-offset-2": selected,
                })}
                onClick={onSelect}
            >
                {label}
            </Button> */}
        </RunTooltip>
    )
}


function RunTooltip({ run, selected, children, ...props }) {

    const theme = useMantineTheme()

    return (
        <Tooltip
            withinPortal multiline {...props}
            label={<Stack miw="10rem" spacing={0}>
                {/* <Group noWrap position="apart">
                    <Text color="dimmed">ID</Text>
                    <Text fw="bold">
                        {run.id.slice(0, 3).toUpperCase()}
                    </Text>
                </Group> */}
                <Group noWrap position="apart">
                    <Text color="dimmed">Status</Text>
                    <Text fw="bold" color={theme.fn.themeColor(statusColors[run.status], theme.colorScheme == "dark" ? 7 : 3)}>
                        {run.status}
                    </Text>
                </Group>
                <Group noWrap position="apart">
                    <Text color="dimmed">Date</Text>
                    <Text>
                        {run.queuedAt.toDate().toLocaleString(undefined, {
                            dateStyle: "short",
                        })}
                    </Text>
                </Group>
                <Group noWrap position="apart">
                    <Text color="dimmed">Time</Text>
                    <Text>
                        {run.queuedAt.toDate().toLocaleString(undefined, {
                            timeStyle: "short",
                        })}
                    </Text>
                </Group>
                {isStatusFinished(run.status) &&
                    <Group noWrap position="apart">
                        <Text color="dimmed">Duration</Text>
                        <Text>
                            {durationSeconds(run.queuedAt.toDate(), run.finishedAt.toDate())}
                        </Text>
                    </Group>}

                {selected ?
                    <Text color="yellow" ta="center">
                        Selected
                    </Text> :
                    <Text color="dimmed" ta="center">
                        Click to select
                    </Text>}
            </Stack>}
        >
            {children}
        </Tooltip>
    )
}