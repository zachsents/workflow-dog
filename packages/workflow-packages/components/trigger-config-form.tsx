import { FormProvider, type FieldValues, type UseFormReturn } from "react-hook-form"
import { toast } from "sonner"
import SpinningLoader from "web/src/components/spinning-loader"
import { Button } from "web/src/components/ui/button"
import { usePreventUnloadWhileSaving } from "web/src/lib/hooks"
import { trpc } from "web/src/lib/trpc"
import { cn } from "web/src/lib/utils"


interface TriggerConfigFormProps<T extends FieldValues> extends Omit<React.ComponentPropsWithRef<"form">, "onSubmit"> {
    workflowId: string
    form: UseFormReturn<T>
    onBeforeSubmit?: () => void | Promise<void>
    onAfterSubmit?: () => void | Promise<void>
    successToast?: false | string
}

export default function TriggerConfigForm<T extends FieldValues>({
    workflowId, form,
    onBeforeSubmit, onAfterSubmit,
    successToast = "Trigger saved!",
    children, ref,
    ...props
}: TriggerConfigFormProps<T>) {

    const utils = trpc.useUtils()
    const updateEventSources = trpc.workflows.updateEventSources.useMutation()

    const handleSubmit = form.handleSubmit(async values => {
        await onBeforeSubmit?.()
        await updateEventSources.mutateAsync({
            workflowId,
            eventSourceData: values,
        })
        await utils.workflows.byId.invalidate({ workflowId })
        await onAfterSubmit?.()
        if (successToast)
            toast.success(successToast)
    })

    usePreventUnloadWhileSaving(form.formState.isDirty || form.formState.isSubmitting)

    return (
        <FormProvider {...form}>
            <form
                {...props}
                className={cn("grid gap-8 pt-8 pb-24", props.className)}
                onSubmit={handleSubmit}
                ref={ref}
            >
                {children}

                {form.formState.isDirty &&
                    <div className="absolute z-[1] bottom-0 left-0 w-full grid grid-cols-2 p-2 gap-2 bg-white shadow-lg border-t">
                        <Button
                            type="button" variant="ghost" onClick={() => form.reset()}
                            disabled={form.formState.isSubmitting}
                        >
                            Reset
                        </Button>
                        <Button
                            type="submit" className="gap-2"
                            disabled={form.formState.isSubmitting}
                        >
                            {form.formState.isSubmitting ? <>
                                <SpinningLoader />
                                Saving
                            </> : <>
                                Save
                            </>}
                        </Button>
                    </div>}
            </form>
        </FormProvider>
    )
}