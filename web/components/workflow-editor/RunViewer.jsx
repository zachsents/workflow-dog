import { Button, Popover, PopoverContent, PopoverTrigger, ScrollShadow, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Tooltip, useDisclosure } from "@nextui-org/react"
import { plural } from "@web/modules/grammar"
import { useControlledSelectedKeys } from "@web/modules/util"
import { useEditorStoreState } from "@web/modules/workflow-editor/store"
import { useWorkflowRun, useWorkflowRuns } from "@web/modules/workflows"
import classNames from "classnames"
import { TbAlertCircle, TbAlertHexagon, TbCheck, TbCircle, TbClock, TbClockPlay, TbEye, TbRun, TbX } from "react-icons/tb"


export default function RunViewer() {

    const { data: runs } = useWorkflowRuns()

    const [selectedRunId, setSelectedRunId] = useEditorStoreState("selectedRunId")
    const { selectedKeys, onSelectionChange } = useControlledSelectedKeys(selectedRunId, setSelectedRunId)

    const { data: selectedRun, isLoading } = useWorkflowRun(selectedRunId)

    const disclosure = useDisclosure()

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
                        className="pointer-events-auto"
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
                                <TableColumn key="status">Status</TableColumn>
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
                                        <TableCell key="status">
                                            <StatusIcon
                                                status={run.status}
                                                errorCount={run.errorCount}
                                                hasErrors={run.hasErrors}
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
                <Tooltip placement="left" closeDelay={0} content="Deselect Run">
                    <Button
                        size="sm" variant="bordered"
                        isLoading={isLoading}
                        startContent={<TbEye />}
                        endContent={<TbX className="opacity-0 group-hover:opacity-100 transition-opacity" />}
                        className="pointer-events-auto group"
                        onPress={() => setSelectedRunId(null)}
                    >
                        Currently Viewing Run #{selectedRun?.count}
                    </Button>
                </Tooltip>}
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