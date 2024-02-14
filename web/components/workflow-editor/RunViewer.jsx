import { Button, Popover, PopoverContent, PopoverTrigger, ScrollShadow, Spinner, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Tooltip, useDisclosure } from "@nextui-org/react"
import { plural } from "@web/modules/grammar"
import { useControlledSelectedKeys } from "@web/modules/util"
import { useEditorStoreState } from "@web/modules/workflow-editor/store"
import { useRunWorkflowMutation, useWorkflowRun, useWorkflowRunsRealtime } from "@web/modules/workflows"
import classNames from "classnames"
import { TbAlertCircle, TbAlertHexagon, TbCheck, TbCircle, TbClock, TbClockPlay, TbRotateClockwise2, TbRun, TbX } from "react-icons/tb"


export default function RunViewer() {

    const { data: runs } = useWorkflowRunsRealtime(undefined, ["id", "count", "created_at", "started_at", "finished_at", "status", "error_count", "has_errors", "scheduled_for", "workflow_id"])

    const [selectedRunId, setSelectedRunId] = useEditorStoreState("selectedRunId")
    const { selectedKeys, onSelectionChange } = useControlledSelectedKeys(selectedRunId, setSelectedRunId)

    const { data: selectedRun, isLoading } = useWorkflowRun(selectedRunId)

    const disclosure = useDisclosure()

    const runMutation = useRunWorkflowMutation(selectedRun?.workflowId, {
        subscribe: true,
        mutationKey: ["rerun", selectedRunId],
    })
    const rerun = () => runMutation.mutate({ copyTriggerDataFrom: selectedRunId })

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
                    </ScrollShadow>
                </PopoverContent>
            </Popover>

            {selectedRunId &&
                <div className="flex flex-col gap-1 mt-unit-xs items-end">
                    <p className="text-xs text-default-500">
                        Currently Viewing Run #{selectedRun?.count}
                    </p>
                    {isLoading ?
                        <Spinner size="sm" className="mx-unit-xl" /> :
                        <div className="flex gap-1 [&_button]:pointer-events-auto">
                            <Button
                                size="sm" variant="bordered"
                                className="bg-white/70 backdrop-blur-sm"
                                isLoading={runMutation.isPending}
                                startContent={<TbRotateClockwise2 />}
                                onPress={rerun}
                            >
                                Re-run
                            </Button>
                            <Button
                                size="sm" variant="bordered"
                                className="bg-white/70 backdrop-blur-sm"
                                startContent={<TbX />}
                                onPress={() => setSelectedRunId(null)}
                            >
                                Deselect Run
                            </Button>
                        </div>}
                </div>}
        </>
    )
}


function StatusIcon({ status, hasErrors, errorCount }) {

    switch (status) {
        case "completed":
            return hasErrors ?
                <StatusText icon={TbAlertCircle} className="text-danger-500">
                    {errorCount != null ?
                        `${errorCount} ${plural("error", errorCount)}` :
                        "Errors"
                    }
                </StatusText> :
                <StatusText icon={TbCheck} className="text-success-600">Completed</StatusText>
        case "failed":
            return <StatusText icon={TbAlertHexagon} className="text-danger-500">Failed</StatusText>
        case "running":
            return <StatusText icon={TbRun} className="text-primary-500">Running</StatusText>
        case "scheduled":
            return <StatusText icon={TbClock} className="text-primary-500">Scheduled</StatusText>
        case "cancelled":
            return <StatusText icon={TbX} className="text-default-500">Cancelled</StatusText>
        case "pending":
            return <StatusText icon={TbCircle} className="text-default-500">Pending</StatusText>
        default:
            return <StatusText icon={TbCircle} className="text-default-500">Unknown</StatusText>
    }
}

function StatusText({ className, icon: Icon, children }) {
    return (
        <div className={classNames("flex flex-nowrap items-center gap-1", className)}>
            <Icon />
            <span className="text-xs">{children}</span>
        </div>
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