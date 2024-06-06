"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import {
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from "@ui/dialog"
import { Button } from "@web/components/ui/button"
import { Dialog } from "@web/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@web/components/ui/form"
import { Input } from "@web/components/ui/input"
import { useDialogState } from "@web/lib/client/hooks"
import { ServiceDefinitions } from "packages/client"
import { useForm } from "react-hook-form"
import { z } from "zod"
import Loader from "@web/components/loader"
// import { useAction } from "@web/lib/client/actions"
import { addApiKeyAccount as addApiKeyAccountAction } from "../../actions"
import { useWorkflow } from "@web/modules/workflows"
import { useEffect } from "react"


const apiKeySchema = z.object({
    key: z.string().min(1),
})

interface APIKeyDialogProps extends ReturnType<typeof useDialogState> {
    serviceId: string
}

export default function APIKeyDialog({ serviceId, ...props }: APIKeyDialogProps) {

    const { data: workflow } = useWorkflow()
    const service = ServiceDefinitions.get(serviceId)

    // const [addAccount] = useAction(
    //     addApiKeyAccountAction.bind(null, workflow?.team_id, serviceId),
    //     {
    //         invalidateKey: ["integrationAccountsForWorkflow", workflow?.id, serviceId],
    //         showErrorToast: true,
    //         showLoadingToast: true,
    //         successToast: "Account connected!",
    //     }
    // )

    const form = useForm<z.infer<typeof apiKeySchema>>({
        resolver: zodResolver(apiKeySchema),
        defaultValues: { key: "" },
    })

    const { isSubmitting } = form.formState

    async function onSubmit(values: z.infer<typeof apiKeySchema>) {
        await addAccount(values.key.trim())
            .then(x => void console.debug("Connected account", x))
        props.close()
    }

    useEffect(() => {
        if (!props.isOpen)
            form.reset()
    }, [props.isOpen])

    return (
        <Dialog {...props.dialogProps}>
            <DialogContent onPaste={ev => ev.stopPropagation()}>
                <DialogHeader>
                    <DialogTitle>
                        Connect {service?.name}
                    </DialogTitle>
                    <DialogDescription>
                        Enter your API key.
                        {service?.generateKeyUrl && <>
                            {" "}You can find your key{" "}
                            <a
                                href={service.generateKeyUrl}
                                target="_blank"
                                className="text-primary underline"
                            >
                                here
                            </a>.
                        </>}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="flex-v items-stretch gap-4"
                    >
                        <FormField
                            control={form.control}
                            name="key"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>API Key</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="xxx..."
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                            disabled={isSubmitting}
                        />

                        <Button
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting && <Loader mr />}
                            Connect
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}