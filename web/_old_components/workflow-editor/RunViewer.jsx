import { Button, Popover, PopoverContent, PopoverTrigger, ScrollShadow, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Tooltip, useDisclosure } from "@nextui-org/react"
import { useControlledSelectedKeys } from "@web/modules/util"
import { useEditorStoreState } from "@web/modules/workflow-editor/store"
import { useRunWorkflowMutation, useWorkflowRun, useWorkflowRunsRealtime } from "@web/modules/workflows"
import { TbClockPlay, TbRotateClockwise2, TbX } from "react-icons/tb"
import StatusIcon from "./StatusIcon"


export default function RunViewer() {

    const { data: runs } = useWorkflowRunsRealtime(undefined, ["id", "count", "created_at", "started_at", "finished_at", "status", "error_count", "has_errors", "scheduled_for", "workflow_id"])

    const [selectedRunId, setSelectedRunId] = useEditorStoreState("selectedRunId")
    const { selectedKeys, onSelectionChange } = useControlledSelectedKeys(selectedRunId, setSelectedRunId)

    const { data: selectedRun } = useWorkflowRun(selectedRunId)

    const disclosure = useDisclosure()

    const mostRecentRun = runs?.[0]

    return (
        <>
            <Popover
                isOpen={disclosure.isOpen}
                onOpenChange={disclosure.onOpenChange}
                placement="bottom-end"
            >
                <PopoverTrigger>
                    <Button
                        size="sm" variant="bordered"
                        startContent={<TbClockPlay />}
                        className="pointer-events-auto bg-white/70 backdrop-blur-sm"
                    >
                        View Runs
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="pointer-events-auto p-unit-xs">
                    <ScrollShadow
                        size={4}
                        className="max-h-[calc(100vh-16rem)] -m-unit-xs p-unit-xs"
                    >
                        <Table
                            removeWrapper
                            selectionMode="single"
                            selectedKeys={selectedKeys}
                            onSelectionChange={(...args) => {
                                onSelectionChange(...args)
                                disclosure.onClose()
                            }}
                            aria-label="Workflow runs"
                        >
                            <TableHeader>
                                <TableColumn key="number">#</TableColumn>
                                <TableColumn key="date">Date</TableColumn>
                                <TableColumn key="time">Time</TableColumn>
                                <TableColumn key="duration">Duration</TableColumn>
                                <TableColumn key="status">Status</TableColumn>
                                <TableColumn key="actions">Actions</TableColumn>
                            </TableHeader>
                            <TableBody items={runs}>
                                {(run) => (
                                    <TableRow className="cursor-pointer" key={run.id}>
                                        <TableCell key="number">
                                            <span className="text-default-400">#</span>
                                            <span className="font-bold">{run.count}</span>
                                        </TableCell>
                                        <TableCell key="date">
                                            {new Date(run.createdAt).toLocaleDateString(undefined, {
                                                dateStyle: "medium"
                                            })}
                                        </TableCell>
                                        <TableCell key="time">
                                            {new Date(run.createdAt).toLocaleTimeString(undefined, {
                                                timeStyle: "short"
                                            })}
                                        </TableCell>
                                        <TableCell key="duration">
                                            {["completed", "failed"].includes(run.status) ?
                                                `${Math.round(Math.abs(new Date(run.scheduledFor || run.createdAt) - new Date(run.finishedAt)) / 100) / 10}s` :
                                                "-"}
                                        </TableCell>
                                        <TableCell key="status">
                                            <StatusIcon
                                                status={run.status}
                                                errorCount={run.errorCount}
                                                hasErrors={run.hasErrors}
                                            />
                                        </TableCell>
                                        <TableCell key="actions" className="flex gap-1">
                                            <RerunButton
                                                workflowId={run.workflowId}
                                                runId={run.id}
                                                onClose={disclosure.onClose}
                                            />
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>

                        {runs?.length === 0 &&
                            <p className="text-default-500 text-sm text-center py-unit-md">
                                No runs yet
                            </p>}

                    </ScrollShadow>
                </PopoverContent>
            </Popover>

            <div className="flex flex-col gap-1 mt-unit-xs items-end">
                {selectedRunId ?
                    <>
                        <p className="text-xs text-default-500">
                            Currently Viewing Run #{selectedRun?.count}
                        </p>
                        <Button
                            size="sm" variant="bordered"
                            className="bg-white/70 backdrop-blur-sm pointer-events-auto"
                            startContent={<TbX />}
                            onPress={() => setSelectedRunId(null)}
                        >
                            Deselect Run
                        </Button>
                    </> :
                    mostRecentRun ?
                        <>
                            <p className="text-xs text-default-500">
                                Most recent
                            </p>
                            <Button
                                size="sm" variant="bordered"
                                className="bg-white/70 backdrop-blur-sm pointer-events-auto"
                                startContent={<span>
                                    #{mostRecentRun.count}
                                </span>}
                                onPress={() => setSelectedRunId(mostRecentRun.id)}
                            >
                                <span className="text-default-500">
                                    {new Date(mostRecentRun.createdAt).toLocaleString(undefined, {
                                        timeStyle: "short",
                                        dateStyle: "medium",
                                    })}
                                </span>
                            </Button>
                        </> : null}
            </div>
        </>
    )
}




function RerunButton({ onClose, workflowId, runId }) {

    const runMutation = useRunWorkflowMutation(workflowId, {
        subscribe: true,
        onSuccess: () => {
            onClose?.()
        },
        mutationKey: ["rerun", runId],
    })

    return (
        <Tooltip closeDelay={0} content="Re-run with same inputs">
            <Button
                isIconOnly size="sm" variant="light"
                isLoading={runMutation.isPending}
                onPress={() => runMutation.mutate({ copyTriggerDataFrom: runId })}
            >
                <TbRotateClockwise2 />
            </Button>
        </Tooltip>
    )
}