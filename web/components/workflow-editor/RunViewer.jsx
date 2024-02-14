import { Button, Popover, PopoverContent, PopoverTrigger, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@nextui-org/react"
import { plural } from "@web/modules/grammar"
import { useWorkflowRuns } from "@web/modules/workflows"
import classNames from "classnames"
import { TbAlertCircle, TbAlertHexagon, TbCheck, TbCircle, TbClock, TbClockPlay, TbRun, TbX } from "react-icons/tb"


export default function RunViewer() {

    const { data: runs } = useWorkflowRuns()

    return (
        <Popover placement="bottom-end">
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
                <Table
                    // onRowAction={console.log}
                    selectionMode="single"
                    removeWrapper
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
            </PopoverContent>
        </Popover>
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