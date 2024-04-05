"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Loader from "@web/components/loader"
import { Button } from "@web/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@web/components/ui/form"
import { Input } from "@web/components/ui/input"
import { useRunWorkflowMutation, useWorkflow } from "@web/modules/workflows"
import _ from "lodash"
import { DataTypeDefinitions, TriggerDefinitions } from "packages/client"
import { useForm } from "react-hook-form"
import { TbPlayerPlay, TbX } from "react-icons/tb"
import { z } from "zod"


interface RunManuallyFormProps {
    onClose: () => void
}

export default function RunManuallyForm({ onClose }: RunManuallyFormProps) {

    const { data: workflow } = useWorkflow()
    const triggerDefinition = TriggerDefinitions.get((workflow?.trigger as any)?.type)

    const submitMutation = useRunWorkflowMutation()

    const schema = z.object(_.mapValues(
        triggerDefinition?.inputs || {},
        inputDef => DataTypeDefinitions.get(inputDef.type)?.schema.optional() || z.any().optional()
    ))

    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
    })

    const { isSubmitting } = form.formState

    async function onSubmit(values: z.infer<typeof schema>) {
        await submitMutation.mutateAsync({
            triggerData: values,
        }).then(onClose)
    }

    return (
        <>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="flex-v items-stretch gap-4"
                >
                    <div className="flex justify-between items-center gap-4">
                        <p className="font-bold">
                            Run workflow manually
                        </p>
                        <Button
                            variant="ghost" size="sm"
                            onClick={() => form.reset()}
                            type="reset"
                        >
                            <TbX className="mr-2" />
                            Clear Inputs
                        </Button>
                    </div>

                    {Object.entries(triggerDefinition?.inputs || {})
                        .map(([inputId, inputDefinition]) => {
                            const dataType = DataTypeDefinitions.get(inputDefinition.type)
                            return (
                                <FormField
                                    control={form.control}
                                    name={inputId}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                {inputDefinition.name}
                                            </FormLabel>
                                            <FormControl>
                                                {dataType?.manualInputComponent
                                                    ? <dataType.manualInputComponent {...field} />
                                                    : <Input {...field} />}
                                            </FormControl>
                                            <FormDescription>
                                                Type: {dataType?.name || "Unknown"}
                                            </FormDescription>
                                            {inputDefinition.description &&
                                                <FormDescription>
                                                    {inputDefinition.description}
                                                </FormDescription>}
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                    disabled={isSubmitting}
                                    key={inputId}
                                />
                            )
                        })}

                    <Button
                        type="submit"
                        disabled={submitMutation.isPending}
                    >
                        {isSubmitting
                            ? <Loader mr />
                            : <TbPlayerPlay className="mr-2" />}
                        Run
                    </Button>
                </form>
            </Form>
        </>
    )
}