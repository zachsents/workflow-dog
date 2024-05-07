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
import Loader from "@web/components/loader"
import { Skeleton } from "@web/components/ui/skeleton"
import { trpc } from "@web/lib/client/trpc"
import { Schemas } from "@web/lib/iso/schemas"
import { cn } from "@web/lib/utils"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"


/*
    Modifying the schema to use name "projectName" instead of "name"
    to help with browser autofill
*/
const ModifiedSettingsSchema = Schemas.Projects.Settings.omit({ name: true }).extend({
    projectName: Schemas.Projects.Settings.shape.name,
})

type FormSchema = z.infer<typeof ModifiedSettingsSchema>


interface GeneralSettingsFormProps {
    projectId: string
}

export default function GeneralSettingsForm({ projectId }: GeneralSettingsFormProps) {

    const utils = trpc.useUtils()

    const {
        data: project,
        isSuccess: isProjectLoaded,
    } = trpc.projects.byId.useQuery({ id: projectId })

    const {
        mutateAsync: updateSettings,
        isPending: isSubmitting
    } = trpc.projects.updateSettings.useMutation({
        onSuccess: () => {
            toast.success("Settings updated!")
            utils.projects.byId.invalidate({ id: projectId })
            utils.projects.list.invalidate()
        },
        onError: (err) => {
            console.debug(err)
            toast.error(err.data?.message)
        },
    })

    const form = useForm<FormSchema>({
        resolver: zodResolver(ModifiedSettingsSchema),
        values: {
            projectName: project?.name ?? "",
        },
    })

    const { isDirty } = form.formState

    async function onSubmit(values: FormSchema) {
        await updateSettings({
            id: projectId,
            settings: {
                name: values.projectName,
            },
        })
    }

    const disableForm = !isProjectLoaded || isSubmitting

    return isProjectLoaded
        ? <Form {...form}>
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
                    disabled={disableForm}
                />

                <div className={cn(
                    "self-end flex gap-2",
                    isDirty ? "opacity-100" : "opacity-0"
                )}>
                    <Button
                        type="reset" disabled={disableForm}
                        variant="ghost"
                        onClick={() => form.reset()}
                    >
                        Reset
                    </Button>
                    <Button type="submit" disabled={disableForm}>
                        {isSubmitting
                            ? <>
                                <Loader mr />
                                Saving...
                            </>
                            : "Save"}
                    </Button>
                </div>
            </form>
        </Form>
        : <Skeleton className="h-20" />
}