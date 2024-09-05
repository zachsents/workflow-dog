import { IconAlertTriangle, IconCheck, IconChevronLeft, IconChevronLeftPipe, IconChevronRight, IconChevronRightPipe, IconDots, IconExclamationCircle, IconHash, IconRun, IconStar, IconStarFilled } from "@tabler/icons-react"
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@ui/table"
import { plural } from "@web/lib/grammar"
import { useCurrentWorkflowId, useSelectedRunId } from "@web/lib/hooks"
import { trpc } from "@web/lib/trpc"
import { cn } from "@web/lib/utils"
import type { ApiRouterOutput } from "api/trpc/router"
import { produce } from "immer"
import { useContext, useMemo, useRef, useState } from "react"
import { RunHistoryTableContext } from "./run-history-table-ctx"
import SimpleTooltip from "./simple-tooltip"
import SpinningLoader from "./spinning-loader"
import TI from "./tabler-icon"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"


const PAGE_SIZE = 20


export default function RunHistoryTable() {

    const workflowId = useCurrentWorkflowId()

    const [selectedRunId, setSelectedRun] = useSelectedRunId()

    const [offset, setOffset] = useState(0)
    const pageNumber = useMemo(() => Math.floor(offset / PAGE_SIZE) + 1, [offset])

    function setOffsetFromInput(value: string) {
        const parsed = parseInt(value)

        if (isNaN(parsed) || parsed <= 0 || parsed > Math.floor(runsList!.total / PAGE_SIZE) + 1)
            return pageNumber.toString()

        const newOffset = (parsed - 1) * PAGE_SIZE
        if (newOffset !== offset)
            setOffset(newOffset)
    }

    const queryInput = {
        workflowId,
        limit: PAGE_SIZE,
        offset,
    }
    const { data: runsList, isLoading, isSuccess, isError } = trpc.workflows.runs.list.useQuery(queryInput)

    const prevData = useRef<NonNullable<typeof runsList>>()
    if (runsList) prevData.current = runsList
    const showPrevData = isLoading && !!prevData.current

    const tableSelectionState = useMemo(() => selectedRunId
        ? { [selectedRunId]: true }
        : {}, [selectedRunId])

    const table = useReactTable({
        data: showPrevData ? prevData.current!.runs : (runsList?.runs ?? []),
        columns: columns,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        getRowId: row => row.id,
        enableRowSelection: true,
        state: {
            rowSelection: tableSelectionState,
        },
        onRowSelectionChange: (updater) => {
            const newState = typeof updater === "function"
                ? updater(tableSelectionState)
                : updater
            const newRunId = Object.entries(newState).find(([, v]) => v)?.[0] ?? null
            setSelectedRun(newRunId)
        },
    })

    return (
        <RunHistoryTableContext.Provider value={{ queryInput }}>
            <div className="grid gap-4 pb-12">
                <TooltipProvider delayDuration={0}>
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <TableHead key={header.id}>
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                            </TableHead>
                                        )
                                    })}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody className={cn(showPrevData && "pointer-events-none opacity-50")}>
                            {table.getRowModel().rows.map((row) =>
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    onClick={() => setSelectedRun(row.id)}
                                    className="group/row cursor-pointer"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TooltipProvider>
                {isLoading && !prevData.current && <div className="flex-center gap-2 py-8 text-sm text-muted-foreground">
                    <SpinningLoader />
                    Loading runs
                </div>}
                {isError && <p className="text-sm text-center text-muted-foreground py-8">
                    There was a problem loading your runs.
                </p>}
                {isSuccess && runsList!.runs.length === 0 && <p className="text-sm text-center text-muted-foreground py-8">
                    No runs yet.
                </p>}
                {(isSuccess || showPrevData) && <div className="flex-center gap-2">
                    <SimpleTooltip tooltip="First Page">
                        <Button
                            variant="outline" size="icon" className="gap-2 h-[3em]"
                            disabled={showPrevData || (offset - PAGE_SIZE < 0)}
                            onClick={() => setOffset(0)}
                        >
                            <TI><IconChevronLeftPipe /></TI>
                        </Button>
                    </SimpleTooltip>
                    <SimpleTooltip tooltip="Previous Page">
                        <Button
                            variant="outline" size="icon" className="gap-2 h-[3em]"
                            disabled={showPrevData || (offset - PAGE_SIZE < 0)}
                            onClick={() => setOffset(offset - PAGE_SIZE)}
                        >
                            <TI><IconChevronLeft /></TI>
                        </Button>
                    </SimpleTooltip>
                    <Input
                        type="number"
                        placeholder="1"
                        min={1} max={runsList ? Math.floor(runsList.total / PAGE_SIZE) + 1 : undefined}
                        defaultValue={pageNumber.toString()}
                        className="w-[80px]"
                        disabled={showPrevData}
                        key={pageNumber.toString()}
                        onBlur={ev => {
                            const newValue = setOffsetFromInput(ev.currentTarget.value)
                            if (newValue !== undefined)
                                ev.currentTarget.value = newValue
                        }}
                        onChange={ev => {
                            if (!ev.currentTarget.contains(document.activeElement))
                                setOffsetFromInput(ev.currentTarget.value)
                        }}
                        onKeyDown={ev => {
                            if (ev.key === "Enter")
                                ev.currentTarget.blur()
                        }}
                    />
                    <SimpleTooltip tooltip="Next Page">
                        <Button
                            variant="outline" size="icon" className="gap-2 h-[3em]"
                            disabled={showPrevData || (offset + PAGE_SIZE >= runsList!.total)}
                            onClick={() => setOffset(offset + PAGE_SIZE)}
                        >
                            <TI><IconChevronRight /></TI>
                        </Button>
                    </SimpleTooltip>
                    <SimpleTooltip tooltip="Last Page">
                        <Button
                            variant="outline" size="icon" className="gap-2 h-[3em]"
                            disabled={showPrevData || (offset + PAGE_SIZE >= runsList!.total)}
                            onClick={() => setOffset(runsList!.total - (runsList!.total % PAGE_SIZE))}
                        >
                            <TI><IconChevronRightPipe /></TI>
                        </Button>
                    </SimpleTooltip>
                </div>}
            </div>
        </RunHistoryTableContext.Provider>
    )
}


const columnHelper = createColumnHelper<ApiRouterOutput["workflows"]["runs"]["list"]["runs"][number]>()

const columns = [
    columnHelper.accessor("row_number", {
        header: () => <TI><IconHash /></TI>,
        cell: ({ getValue }) => {
            return (
                <span className="font-semibold group-data-[state=selected]/row:bg-primary group-data-[state=selected]/row:text-primary-foreground px-1 rounded-sm transition-colors">
                    {getValue()}
                </span>
            )
        },
    }),

    columnHelper.accessor("status", {
        header: "Status",
        cell: ({ getValue, row }) => {
            const value = getValue()
            const errorCount = row.original.error_count

            return (
                <div className="flex text-lg">
                    <Tooltip>
                        <TooltipTrigger className="px-2">
                            {value === "pending" && <TI className="text-muted-foreground"><IconDots /></TI>}
                            {value === "running" && <TI className="text-blue-600"><IconRun /></TI>}
                            {value === "completed" && errorCount === 0 && <TI className="text-green-600 stroke-[3px]"><IconCheck /></TI>}
                            {value === "completed" && errorCount > 0 && <TI className="text-amber-600"><IconAlertTriangle /></TI>}
                            {value === "failed" && <TI className="text-destructive"><IconExclamationCircle /></TI>}
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="text-muted-foreground">
                                Status: <span className="font-bold text-white capitalize">{value}</span>
                            </p>
                            <p className={cn(
                                errorCount > 0 ? "text-destructive font-semibold" : "text-muted-foreground",
                            )}>
                                {errorCount || "No"} {plural("error", errorCount)}
                            </p>
                        </TooltipContent>
                    </Tooltip>
                </div>
            )
        }
    }),

    columnHelper.accessor("started_at", {
        header: "Date & Time",
        cell: ({ getValue }) => {

            const startedAt = getValue()

            return <div className="flex items-center gap-4">
                {startedAt ? <>
                    <div className="w-[8.5ch]">
                        {startedAt.toLocaleDateString()}
                    </div>
                    <div className="w-[6.5ch]">
                        {startedAt.toLocaleTimeString(undefined, {
                            timeStyle: "short",
                        })}
                    </div>
                </> : <p className="text-xs text-muted-foreground">
                    Unknown
                </p>}
            </div>
        }
    }),

    columnHelper.accessor("duration", {
        id: "duration",
        header: "Duration",
        cell: ({ getValue }) => {
            const value = getValue()

            const formattedValue = useMemo(() => {
                const unit = value < 100 ? "millisecond"
                    : value / 1000 < 60 ? "second"
                        : "minute"

                const formatter = new Intl.NumberFormat("en", {
                    style: "unit",
                    unit,
                    unitDisplay: "short",
                    minimumSignificantDigits: 2,
                    maximumSignificantDigits: 2,
                })

                switch (unit) {
                    case "millisecond": return formatter.format(value)
                    case "second": return formatter.format(value / 1000)
                    case "minute": return formatter.format(value / 1000 / 60)
                }
            }, [value])

            return formattedValue
        },
    }),

    columnHelper.accessor("is_starred", {
        header: "",
        cell: ({ row, getValue }) => {
            const isStarred = getValue()

            const tableCtx = useContext(RunHistoryTableContext)

            const utils = trpc.useUtils()
            const setStarredMutation = trpc.workflows.runs.setStarred.useMutation({
                onSuccess: (data) => {
                    if (!tableCtx) return
                    utils.workflows.runs.list.setData(tableCtx.queryInput, produce(draft => {
                        const foundRow = draft?.runs.find(r => r.id === data.id)
                        if (foundRow)
                            foundRow.is_starred = data.is_starred
                    }))
                },
            })

            return (
                <Button
                    variant="ghost" size="icon"
                    className={cn(
                        "hover:bg-gray-600/10",
                        isStarred ? "text-yellow-600 hover:text-yellow-600" : "text-muted-foreground",
                        setStarredMutation.isPending && "opacity-50",
                    )}
                    onClick={(ev) => {
                        ev.stopPropagation()
                        setStarredMutation.mutate({ workflowRunId: row.id, isStarred: !isStarred })
                    }}
                    disabled={setStarredMutation.isPending}
                >
                    <TI>{isStarred ? <IconStarFilled /> : <IconStar />}</TI>
                </Button>
            )
        }
    })
]
