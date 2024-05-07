"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { createColumnHelper } from "@tanstack/react-table"
import { Badge } from "@ui/badge"
import { Button } from "@ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@ui/dropdown-menu"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@ui/form"
import { Input } from "@ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@ui/tooltip"
import { deleteWorkflow as deleteWorkflowAction, renameWorkflow as renameWorkflowAction, setWorkflowIsEnabled } from "@web/app/(dashboard)/actions"
import Loader from "@web/components/loader"
import { Portal } from "@web/components/portal"
import { useAction } from "@web/lib/client/actions"
import { useDialogState } from "@web/lib/client/hooks"
import { trpc } from "@web/lib/client/trpc"
import { RouterOutput } from "@web/lib/types/trpc"
import { cn } from "@web/lib/utils"
import dayjs from "@web/modules/dayjs"
import Link from "next/link"
import { TriggerDefinitions } from "packages/client"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { TbArrowRight, TbDots, TbPencil, TbTrash } from "react-icons/tb"
import type { Triggers, Workflows } from "shared/db"
import { z } from "zod"
import { WorkflowRow } from "."
import { useQueryClient } from "@tanstack/react-query"



const columnHelper = createColumnHelper<WorkflowRow>()


const nameColumn = columnHelper.accessor("name", {
    header: "Name",
    enableSorting: true,
    sortingFn: "alphanumeric",
    cell: ({ row, getValue }) => {
        const triggerType = row.original.triggers[0]?.def_id
        return (
            <div className="px-4 py-6">
                <b>{getValue<string>() || "Unknown Workflow"}</b>
                <p className="text-muted-foreground">
                    {triggerType
                        ? (TriggerDefinitions.get(triggerType as string)?.whenName
                            || "Unknown trigger")
                        : "No trigger set"}
                </p>
            </div>
        )
    }
})


const enabledColumn = columnHelper.accessor("is_enabled", {
    header: "Status",
    enableSorting: true,
    cell: ({ row, getValue }) => {
        const isEnabled = getValue<boolean>()

        const utils = trpc.useUtils()

        const { mutate, isPending } = trpc.workflows.setEnabled.useMutation({
            onSuccess: () => void utils.workflows.list.invalidate(),
        })
        const setEnabled = (value: boolean) => mutate({
            workflowId: row.id,
            isEnabled: value,
        })

        return (
            <div className="ml-4">
                <Portal stopPropagation={["onClick"]}>
                    <TooltipProvider>
                        <Tooltip delayDuration={0}>
                            <TooltipTrigger>
                                <Badge
                                    variant={isEnabled ? "default" : "secondary"}
                                    className={cn(
                                        isEnabled && "bg-green-500 hover:bg-green-700",
                                        isPending && "opacity-50 pointer-events-none cursor-not-allowed",
                                    )}
                                    onClick={() => void setEnabled(!isEnabled)}
                                    aria-disabled={isPending}
                                >
                                    {isPending && <Loader mr />}
                                    {isEnabled ? "Enabled" : "Disabled"}
                                </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{isEnabled ? "Disable" : "Enable"}?</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </Portal>
            </div>
        )
    }
})



const columns = [
    nameColumn,
    enabledColumn,
    // {
    //     accessorKey: "is_enabled",
    //     header: "Status",
    //     enableSorting: true,
    //     cell: ({ row, getValue }) => {
    //         const isEnabled = getValue() as boolean

    //         const [setEnabled, { isPending }] = useAction(
    //             setWorkflowIsEnabled.bind(null, row.id!)
    //         )

    //         return (
    //             <div className="ml-4">
    //                 <Portal stopPropagation={["onClick"]}>
    //                     <TooltipProvider>
    //                         <Tooltip delayDuration={0}>
    //                             <TooltipTrigger>
    //                                 <Badge
    //                                     variant={isEnabled ? "default" : "secondary"}
    //                                     className={cn(
    //                                         isEnabled && "bg-green-500 hover:bg-green-700",
    //                                         isPending && "opacity-50 pointer-events-none cursor-not-allowed",
    //                                     )}
    //                                     onClick={() => void setEnabled(!isEnabled)}
    //                                     aria-disabled={isPending}
    //                                 >
    //                                     {isPending && <Loader mr />}
    //                                     {isEnabled ? "Enabled" : "Disabled"}
    //                                 </Badge>
    //                             </TooltipTrigger>
    //                             <TooltipContent>
    //                                 <p>{isEnabled ? "Disable" : "Enable"}?</p>
    //                             </TooltipContent>
    //                         </Tooltip>
    //                     </TooltipProvider>
    //                 </Portal>
    //             </div>
    //         )
    //     }
    // },
    // {
    //     id: "last_edited_at",
    //     accessorFn: row => new Date(row.last_edited_at || 0),
    //     header: "Last Edited",
    //     enableSorting: true,
    //     sortingFn: "datetime",
    //     cell: ({ getValue }) => {
    //         const val = getValue<Date>()
    //         return (
    //             <p className="ml-4">
    //                 {val.getTime() > 0
    //                     ? dayjs(val).fromNow()
    //                     : "Never"}
    //             </p>
    //         )
    //     },
    // },
    // {
    //     id: "last_ran_at",
    //     accessorFn: row => new Date(row.last_ran_at || 0),
    //     header: "Last Ran",
    //     enableSorting: true,
    //     sortingFn: "datetime",
    //     cell: ({ getValue }) => {
    //         const val = getValue<Date>()
    //         return (
    //             <p className="ml-4">
    //                 {val.getTime() > 0
    //                     ? dayjs(val).fromNow()
    //                     : "Never"}
    //             </p>
    //         )
    //     },
    // },
    // {
    //     id: "created_at",
    //     accessorFn: row => new Date(row.created_at || 0),
    //     header: "Created",
    //     enableSorting: true,
    //     sortingFn: "datetime",
    //     cell: ({ getValue }) => <p className="ml-4">
    //         {getValue<Date>().toLocaleDateString(undefined, {
    //             dateStyle: "medium",
    //         })}
    //     </p>,
    // },
    // {
    //     id: "edit",
    //     cell: ({ row }) =>
    //         <Button
    //             variant="ghost"
    //             className="workflow-edit-button opacity-0 group-hover/row:opacity-100"
    //             asChild
    //         >
    //             <Link href={`/workflows/${row.id}/edit`}>
    //                 Edit
    //                 <TbArrowRight className="ml-2" />
    //             </Link>
    //         </Button>,
    // },
    // {
    //     id: "actions",
    //     cell: ({ row }) => {

    //         const deleteDialog = useDialogState()
    //         const renameDialog = useDialogState()

    //         const [deleteWorkflow, { isPending: isDeleting }] = useAction(
    //             deleteWorkflowAction.bind(null, row.id!),
    //             { successToast: "Workflow deleted!" }
    //         )

    //         const [renameWorkflow] = useAction(
    //             renameWorkflowAction.bind(null, row.id!),
    //             { successToast: "Workflow renamed!" }
    //         )

    //         const renameSchema = z.object({
    //             workflowName: z.string().min(1),
    //         })

    //         const form = useForm<z.infer<typeof renameSchema>>({
    //             resolver: zodResolver(renameSchema),
    //             defaultValues: {
    //                 workflowName: row.original.name!,
    //             },
    //         })

    //         const { isSubmitting: isRenaming } = form.formState

    //         async function onSubmit(values: z.infer<typeof renameSchema>) {
    //             await renameWorkflow(values.workflowName)
    //                 .then(({ data }) => {
    //                     form.reset({ workflowName: data })
    //                     renameDialog.close()
    //                 })
    //         }

    //         useEffect(() => {
    //             if (!renameDialog.isOpen) {
    //                 form.reset()
    //             }
    //         }, [renameDialog.isOpen])

    //         return (
    //             <div onClick={ev => ev.stopPropagation()}>
    //                 <Portal stopPropagation={["onClick"]}>
    //                     <DropdownMenu>
    //                         <DropdownMenuTrigger asChild>
    //                             <Button variant="ghost" size="icon">
    //                                 <TbDots />
    //                             </Button>
    //                         </DropdownMenuTrigger>
    //                         <DropdownMenuContent align="end">
    //                             <DropdownMenuItem onSelect={renameDialog.open}>
    //                                 <TbPencil className="mr-2" />
    //                                 Rename workflow
    //                             </DropdownMenuItem>
    //                             <DropdownMenuItem
    //                                 className="text-destructive"
    //                                 onSelect={deleteDialog.open}
    //                             >
    //                                 <TbTrash className="mr-2" />
    //                                 Delete workflow
    //                             </DropdownMenuItem>
    //                         </DropdownMenuContent>
    //                     </DropdownMenu>
    //                 </Portal>

    //                 <Dialog {...deleteDialog.dialogProps}>
    //                     <DialogContent>
    //                         <DialogHeader>
    //                             <DialogTitle>
    //                                 Are you sure?
    //                             </DialogTitle>
    //                             <DialogDescription>
    //                                 Are you sure you want to delete this workflow? This is irreversible.
    //                             </DialogDescription>
    //                         </DialogHeader>
    //                         <DialogFooter>
    //                             <DialogClose asChild>
    //                                 <Button variant="secondary">
    //                                     Cancel
    //                                 </Button>
    //                             </DialogClose>
    //                             <Button
    //                                 variant="destructive"
    //                                 onClick={() => void deleteWorkflow().then(deleteDialog.close)}
    //                                 disabled={isDeleting}
    //                             >
    //                                 {isDeleting && <Loader mr />}
    //                                 I'm sure
    //                             </Button>
    //                         </DialogFooter>
    //                     </DialogContent>
    //                 </Dialog>

    //                 <Dialog {...renameDialog.dialogProps}>
    //                     <DialogContent>
    //                         <DialogHeader>
    //                             <DialogTitle>
    //                                 Rename workflow
    //                             </DialogTitle>
    //                             <DialogDescription>
    //                                 Enter a new name for this workflow.
    //                             </DialogDescription>
    //                         </DialogHeader>

    //                         <Form {...form}>
    //                             <form
    //                                 onSubmit={form.handleSubmit(onSubmit)}
    //                                 className="flex-v items-stretch gap-4"
    //                             >
    //                                 <FormField
    //                                     control={form.control}
    //                                     name="workflowName"
    //                                     render={({ field }) => (
    //                                         <FormItem>
    //                                             {/* <FormLabel>Workflow Name</FormLabel> */}
    //                                             <FormControl>
    //                                                 <Input placeholder="Name your workflow" {...field} />
    //                                             </FormControl>
    //                                             <FormMessage />
    //                                         </FormItem>
    //                                     )}
    //                                     disabled={isRenaming}
    //                                 />

    //                                 <DialogFooter>
    //                                     <DialogClose asChild>
    //                                         <Button type="button" variant="secondary">
    //                                             Cancel
    //                                         </Button>
    //                                     </DialogClose>
    //                                     <Button
    //                                         type="submit"
    //                                         disabled={isRenaming}
    //                                     >
    //                                         {isRenaming && <Loader mr />}
    //                                         Rename
    //                                     </Button>
    //                                 </DialogFooter>
    //                             </form>
    //                         </Form>
    //                     </DialogContent>
    //                 </Dialog>
    //             </div>
    //         )
    //     }
    // },
]

export default columns