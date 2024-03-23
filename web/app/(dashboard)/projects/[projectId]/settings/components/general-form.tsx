"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@ui/form"
import { Input } from "@ui/input"
import Loader from "@web/components/Loader"
import { cn } from "@web/lib/utils"
import type { DefaultValues } from "react-hook-form"
import { useForm } from "react-hook-form"
import { updateGeneralSettings } from "../actions"
import { generalSettingsSchema, type GeneralSettingsSchema } from "../schema"


export default function GeneralSettingsForm({
    projectId,
    defaultValues,
}: {
    projectId: string
    defaultValues: DefaultValues<GeneralSettingsSchema>
}) {
    const updateSettings = updateGeneralSettings.bind(null, projectId)

    const form = useForm<GeneralSettingsSchema>({
        resolver: zodResolver(generalSettingsSchema),
        defaultValues,
    })

    const { isDirty, isSubmitting } = form.formState

    async function onSubmit(values: GeneralSettingsSchema) {
        await updateSettings(values).then(form.reset)
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex-v items-stretch gap-4"
            >
                <FormField
                    control={form.control}
                    name="projectName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Project Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Name your project" {...field} />
                            </FormControl>
                            <FormDescription>
                                This is the name that will be displayed to other users.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                    disabled={isSubmitting}
                />

                <div className={cn("self-end flex gap-2", isDirty ? "opacity-100" : "opacity-0")}>
                    <Button
                        type="reset" disabled={isSubmitting}
                        variant="ghost"
                        onClick={() => form.reset()}
                    >
                        Reset
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader mr />}
                        Save
                    </Button>
                </div>
            </form>
        </Form>
    )
}