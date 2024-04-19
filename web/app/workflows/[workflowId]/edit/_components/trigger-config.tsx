import { zodResolver } from "@hookform/resolvers/zod"
import {
    Form,
    FormField
} from "@ui/form"
import Loader from "@web/components/loader"
import { Button } from "@web/components/ui/button"
import { extendComponent, type ExtendProps } from "@web/modules/util"
import { useForm } from "react-hook-form"
import { TbCheck } from "react-icons/tb"
import { ZodSchema, z } from "zod"


export interface TriggerConfigProps {
    aboveSettings?: React.ReactNode
    settings?: React.ReactNode
}

export function TriggerConfig({ aboveSettings, settings }: TriggerConfigProps) {
    return (
        <div className="flex-v items-stretch gap-4">
            {aboveSettings &&
                <div className="flex-v gap-2">
                    {aboveSettings}
                </div>}

            {settings}
        </div>
    )
}


export type TriggerSettingsFormProps = ExtendProps<"form", {
    schema: ZodSchema
    onSubmit: (values: any, ev: any) => Promise<void>
    onClose?: () => void
    closeOnFinishedSubmitting?: boolean
    fields: {
        key: string
        defaultValue: any
        render: React.ComponentProps<typeof FormField>["render"]
    }[]
}>

export const TriggerSettingsForm = extendComponent<"form", TriggerSettingsFormProps>(({
    schema,
    onSubmit,
    fields,
    closeOnFinishedSubmitting,
    onClose,
}, ref) => {

    const defaultValues = Object.fromEntries(fields.map(f => [f.key, f.defaultValue]))

    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues,
    })

    const handleSubmit = async (values: any, ev: any) => {
        await onSubmit(values, ev)
        if (closeOnFinishedSubmitting)
            onClose?.()
    }

    const isSubmitButtonDisabled = !form.formState.isDirty || form.formState.isSubmitting

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="flex-v gap-2"
                ref={ref}
            >
                <TriggerConfigHeader>
                    Settings:
                </TriggerConfigHeader>

                <div className="flex-v gap-2 px-2">
                    {fields.map(f =>
                        <FormField
                            control={form.control}
                            name={f.key}
                            render={f.render}
                            key={f.key}
                        />
                    )}
                </div>

                <Button
                    size="sm"
                    className="self-end mt-2 flex center gap-2"
                    disabled={isSubmitButtonDisabled}
                    type="submit"
                >
                    {form.formState.isSubmitting
                        ? <Loader />
                        : <TbCheck />}
                    {form.formState.isSubmitting
                        ? "Saving"
                        : "Save Changes"}
                </Button>
            </form>
        </Form>
    )
})

export const TriggerConfigHeader = extendComponent<"p">(({ children }, ref) =>
    <p className="font-bold text-sm" ref={ref}>
        {children}
    </p>
)