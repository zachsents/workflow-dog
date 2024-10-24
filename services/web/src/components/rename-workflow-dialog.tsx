import { zodResolver } from "@hookform/resolvers/zod"
import SpinningLoader from "@web/components/spinning-loader"
import { Button } from "@web/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@web/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormMessage } from "@web/components/ui/form"
import { Input } from "@web/components/ui/input"
import { trpc } from "@web/lib/trpc"
import { WORKFLOW_NAME_SCHEMA } from "core/schemas"
import React from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"


const renameWorkflowSchema = z.object({
    workflowName: WORKFLOW_NAME_SCHEMA,
})

export default function RenameWorkflowDialog({ workflow, ...props }: {
    workflow: { id: string, name: string }
} & React.ComponentProps<typeof Dialog>) {

    const utils = trpc.useUtils()

    const form = useForm<z.infer<typeof renameWorkflowSchema>>({
        resolver: zodResolver(renameWorkflowSchema),
        values: {
            workflowName: workflow.name ?? "",
        },
    })

    const onOpenChange = (isOpen: boolean) => {
        if (!isOpen) form.reset()
        props.onOpenChange?.(isOpen)
    }

    const renameWorkflow = trpc.workflows.rename.useMutation({
        onSuccess: () => {
            utils.workflows.list.invalidate()
            utils.workflows.byId.invalidate({ workflowId: workflow.id })
            onOpenChange(false)
            form.reset()
        },
    })

    return (
        <Dialog {...props} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Rename Workflow
                    </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form
                        className="grid gap-4"
                        onSubmit={form.handleSubmit(values => renameWorkflow.mutateAsync({
                            workflowId: workflow.id,
                            name: values.workflowName,
                        }))}
                    >
                        <FormField
                            name="workflowName"
                            control={form.control}
                            render={({ field }) =>
                                <FormItem>
                                    <FormDescription>
                                        Write a new name for your workflow.
                                    </FormDescription>
                                    <FormControl>
                                        <Input
                                            type="text"
                                            placeholder={workflow.name}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            }
                        />

                        <DialogFooter className="mt-2">
                            <Button
                                variant="ghost"
                                type="button"
                                onClick={() => onOpenChange(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="gap-2"
                                disabled={renameWorkflow.isPending}
                                type="submit"
                            >
                                {renameWorkflow.isPending
                                    ? <>
                                        <SpinningLoader />
                                        Renaming...
                                    </>
                                    : "Rename Workflow"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}