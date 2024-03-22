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
import type { DefaultValues } from "react-hook-form"
import { useForm } from "react-hook-form"
import { updateGeneralSettings } from "../actions"
import { generalSettingsSchema, type GeneralSettingsSchema } from "../schema"
import { useBooleanState } from "@web/lib/client/hooks"
import { cn } from "@web/lib/utils"
import { useState } from "react"


export default function GeneralSettingsForm({
    projectId,
    defaultValues: passedDefaultValues,
}: {
    projectId: string
    defaultValues: DefaultValues<GeneralSettingsSchema>
}) {
    const updateSettings = updateGeneralSettings.bind(null, projectId)
    const [defaultValues, setDefaultValues] = useState(passedDefaultValues)

    const form = useForm<GeneralSettingsSchema>({
        resolver: zodResolver(generalSettingsSchema),
        defaultValues,
    })

    const [isTouched, touch, resetTouched] = useBooleanState()
    const [isLoading, startLoading, stopLoading] = useBooleanState()

    function onReset() {
        form.reset(defaultValues)
        resetTouched()
    }

    function onSubmit(values: GeneralSettingsSchema) {
        startLoading()
        updateSettings(values)
            .then((values: GeneralSettingsSchema) => {
                setDefaultValues(values)
                form.reset(values)
                resetTouched()
            })
            .catch(onReset)
            .finally(stopLoading)
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                onInput={touch}
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
                    disabled={isLoading}
                />

                <div className={cn("self-end flex gap-2", isTouched ? "opacity-100" : "opacity-0")}>
                    <Button
                        variant="ghost" type="button" disabled={isLoading}
                        onClick={onReset}
                    >
                        Reset
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader mr />}
                        Save
                    </Button>
                </div>
            </form>
        </Form>
    )
}