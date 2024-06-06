"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import type { CellContext, Row } from "@tanstack/react-table"
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
import Loader from "@web/components/loader"
import { Portal } from "@web/components/portal"
import { useDialogState } from "@web/lib/client/hooks"
import { trpc } from "@web/lib/client/trpc"
import { Schemas } from "@web/lib/iso/schemas"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { TbDots, TbPencil, TbTrash } from "react-icons/tb"
import { toast } from "sonner"
import { z } from "zod"
import type { WorkflowRow } from "."


export default function WorkflowActionsMenu({ row }: CellContext<WorkflowRow, unknown>) {
    const deleteDialog = useDialogState()
    const renameDialog = useDialogState()

    return (
        <div onClick={ev => ev.stopPropagation()}>
            <Portal stopPropagation={["onClick"]}>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <TbDots />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={renameDialog.open}>
                            <TbPencil className="mr-2" />
                            Rename workflow
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="text-destructive"
                            onSelect={deleteDialog.open}
                        >
                            <TbTrash className="mr-2" />
                            Delete workflow
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </Portal>

            <DeleteDialog
                row={row}
                dialogProps={deleteDialog.dialogProps}
            />

            <RenameDialog
                row={row}
                dialogProps={renameDialog.dialogProps}
            />
        </div>
    )
}


interface WorkflowActionDialogProps {
    row: Row<WorkflowRow>
    dialogProps: ReturnType<typeof useDialogState>["dialogProps"]
}


const renameFormSchema = z.object({
    workflowName: Schemas.Workflows.Name,
})

function RenameDialog({ row, dialogProps }: WorkflowActionDialogProps) {

    const utils = trpc.useUtils()

    const {
        mutateAsync: rename,
        isPending,
    } = trpc.workflows.rename.useMutation({
        onSuccess: () => {
            utils.workflows.list.invalidate()
            toast.success("Workflow renamed!")
            dialogProps.onOpenChange(false)
            form.reset()
        },
    })

    const form = useForm<z.infer<typeof renameFormSchema>>({
        resolver: zodResolver(renameFormSchema),
        values: {
            workflowName: row.original.name ?? "",
        },
    })

    async function onSubmit(values: z.infer<typeof renameFormSchema>) {
        await rename({
            workflowId: row.id,
            name: values.workflowName,
        })
    }

    useEffect(() => {
        if (!dialogProps.open)
            form.reset()
    }, [dialogProps.open])

    return (
        <Dialog {...dialogProps}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Rename workflow
                    </DialogTitle>
                    <DialogDescription>
                        Enter a new name for this workflow.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="flex-v items-stretch gap-4"
                    >
                        <FormField
                            control={form.control}
                            name="workflowName"
                            render={({ field }) => (
                                <FormItem>
                                    {/* <FormLabel>Workflow Name</FormLabel> */}
                                    <FormControl>
                                        <Input placeholder="Name your workflow" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                            disabled={isPending}
                        />

                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="secondary">
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button
                                type="submit"
                                disabled={isPending}
                            >
                                {isPending
                                    ? <>
                                        <Loader mr />
                                        Renaming...
                                    </>
                                    : "Rename"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

function DeleteDialog({ row, dialogProps }: WorkflowActionDialogProps) {

    const utils = trpc.useUtils()

    const {
        mutateAsync: deleteWorkflow,
        isPending,
    } = trpc.workflows.delete.useMutation({
        onSuccess: () => {
            utils.workflows.list.invalidate()
            toast.success("Workflow deleted!")
            dialogProps.onOpenChange(false)
        },
    })

    return (
        <Dialog {...dialogProps}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Are you sure?
                    </DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete this workflow? This is irreversible.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="secondary">
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button
                        variant="destructive"
                        onClick={() => void deleteWorkflow({ workflowId: row.id })}
                        disabled={isPending}
                    >
                        {isPending
                            ? <>
                                <Loader mr />
                                Deleting
                            </>
                            : "I'm sure"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}