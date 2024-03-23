"use client"

import {
    Column,
    ColumnDef,
    SortingState,
    TableOptions,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@ui/table"
import { cn } from "@web/lib/utils"
import { useState } from "react"
import { TbCaretDownFilled, TbCaretUpDown, TbCaretUpFilled } from "react-icons/tb"
import { Button, ButtonProps } from "./button"


export type DataTableColumnDef<TData, TValue = unknown> = {
    sortable?: boolean
} & ColumnDef<TData, TValue>

interface DataTableProps<TData, TValue> {
    columns: DataTableColumnDef<TData, TValue>[]
    data: TData[],
    classNames?: {
        wrapper?: string
        row?: string
        cell?: string
    }
    props?: {
        row?: React.HTMLProps<HTMLTableRowElement>
    }
    tableOptions?: Partial<TableOptions<TData>>
}

export function DataTable<TData, TValue>({
    columns,
    data,
    classNames,
    props,
    tableOptions,
}: DataTableProps<TData, TValue>) {

    const [sorting, setSorting] = useState<SortingState>([])

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        state: {
            sorting,
        },
        ...tableOptions,
    })

    return (
        <div className={cn("rounded-md border", classNames?.wrapper)}>
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {

                                const columnDef: DataTableColumnDef<TData, TValue> = header.column.columnDef

                                return (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : columnDef.sortable
                                                ? <SortableHeader column={header.column}>
                                                    {flexRender(
                                                        columnDef.header,
                                                        header.getContext()
                                                    )}
                                                </SortableHeader>
                                                : flexRender(
                                                    columnDef.header,
                                                    header.getContext()
                                                )}
                                    </TableHead>
                                )
                            })}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow
                                key={row.id}
                                data-state={row.getIsSelected() && "selected"}
                                {...props?.row}
                                className={classNames?.row}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell className={classNames?.cell} key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="h-24 text-center">
                                No results.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}


interface SortableHeaderProps extends ButtonProps {
    column: Column<any>
}

function SortableHeader({ children, column, ...props }: SortableHeaderProps) {

    const sortDir = column.getIsSorted()
    const isSorted = !!sortDir
    const isSortedAsc = sortDir === "asc"

    return (
        <Button
            variant="ghost"
            onClick={() => column.toggleSorting(isSortedAsc)}
            {...props}
        >
            {children}
            <div className="ml-2">
                {isSorted
                    ? isSortedAsc
                        ? <TbCaretUpFilled />
                        : <TbCaretDownFilled />
                    : <TbCaretUpDown />}
            </div>
        </Button>
    )
}