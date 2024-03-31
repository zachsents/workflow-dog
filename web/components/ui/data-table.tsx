"use client"

import {
    Cell,
    Column,
    ColumnDef,
    Header,
    Row,
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
import React, { forwardRef, useState } from "react"
import { TbCaretDownFilled, TbCaretUpDown, TbCaretUpFilled } from "react-icons/tb"
import { Button, ButtonProps } from "./button"


interface DataTableProps<TData, TValue> extends Omit<React.ComponentProps<typeof Table>, "children"> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[],
    tableOptions?: Partial<TableOptions<TData>>
    empty?: any
    children?: (row: Row<unknown>) => React.ReactNode
}

export function DataTable<TData, TValue>({
    columns,
    data,
    tableOptions,
    empty = "No results.",
    children = (row) => <DataTableRow row={row} key={row.id} />,
    className,
    ...props
}: DataTableProps<TData, TValue>) {

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        ...tableOptions,
    })

    return (
        <div className={cn("rounded-md border", className)}>
            <Table {...props}>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) =>
                                <TableHead key={header.id}>
                                    {header.isPlaceholder
                                        ? null
                                        : header.column.columnDef.enableSorting
                                            ? <SortableHeader header={header} />
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                </TableHead>
                            )}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length ?
                        table.getRowModel().rows.map((row) => children(row)) :
                        <TableRow>
                            <TableCell colSpan={columns.length} className="h-24 text-center">
                                {empty}
                            </TableCell>
                        </TableRow>}
                </TableBody>
            </Table>
        </div>
    )
}


interface DataTableCellProps extends React.ComponentProps<typeof TableCell> {
    cell: Cell<unknown, unknown>
}

export const DataTableCell = forwardRef<React.ElementRef<typeof TableCell>, DataTableCellProps>(({
    cell,
    children = flexRender(
        cell.column.columnDef.cell,
        cell.getContext()
    ),
    ...props
}, ref) => {
    return (
        <TableCell
            {...props}
            ref={ref}
        >
            {children}
        </TableCell>
    )
})


interface DataTableRowProps extends Omit<React.ComponentProps<typeof TableRow>, "children"> {
    row: Row<unknown>
    children?: (cell: Cell<unknown, unknown>) => React.ReactNode
}

export const DataTableRow = forwardRef<React.ElementRef<typeof TableRow>, DataTableRowProps>(({
    row,
    children = (cell) => <DataTableCell cell={cell} key={cell.id} />,
    ...props
}, ref) => {
    return (
        <TableRow
            data-state={row.getIsSelected() && "selected"}
            {...props}
            ref={ref}
        >
            {row.getVisibleCells().map((cell) => children(cell))}
        </TableRow>
    )
})


interface SortableHeaderProps<TData, TValue> extends ButtonProps {
    header: Header<TData, TValue>
}

function SortableHeader<TData, TValue>({ header, ...props }: SortableHeaderProps<TData, TValue>) {

    const sortDir = header.column.getIsSorted()
    const isSorted = !!sortDir
    const isSortedAsc = sortDir === "asc"

    const Icon = isSorted
        ? isSortedAsc
            ? TbCaretUpFilled
            : TbCaretDownFilled
        : TbCaretUpDown

    return (
        <Button
            variant="ghost"
            onClick={() => header.column.toggleSorting(isSortedAsc)}
            {...props}
        >
            {flexRender(header.column.columnDef.header, header.getContext())}
            <Icon className="ml-2" />
        </Button>
    )
}