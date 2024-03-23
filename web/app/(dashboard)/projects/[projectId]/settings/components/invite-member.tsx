"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@ui/dialog"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@ui/form"
import { Input } from "@web/components/ui/input"
import { useForm } from "react-hook-form"
import { TbUserPlus } from "react-icons/tb"
import { InviteMemberSchema, inviteMemberSchema } from "../schema"
import Loader from "@web/components/Loader"
import { useAction } from "@web/lib/client/actions"
import { useCurrentProjectId } from "@web/lib/utils"
import { inviteMember as inviteMemberAction } from "../actions"
import { useBooleanState } from "@web/lib/client/hooks"


export default function InviteMember() {

    const projectId = useCurrentProjectId()

    const [inviteMember] = useAction(
        inviteMemberAction.bind(null, projectId),
        { successToast: "User invited!" }
    )

    const form = useForm<InviteMemberSchema>({
        resolver: zodResolver(inviteMemberSchema),
        defaultValues: { email: "" },
    })

    const { isSubmitting } = form.formState

    const [isOpen, , close, setOpen] = useBooleanState()

    async function onSubmit(values: InviteMemberSchema) {
        await inviteMember(values.email)
            .then(() => {
                close()
                form.reset()
            })
            .catch(err => form.setError("email", { message: err.message }))
    }

    return (
        <Dialog open={isOpen} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <TbUserPlus className="mr-2" />
                    Invite
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Invite someone to this project</DialogTitle>
                    <DialogDescription>
                        This person will need to have a WorkflowDog account. If they don't have one, tell them to make one first.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="flex-v items-stretch gap-4"
                    >
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="zach@workflow.dog"
                                            type="email"
                                            {...field}
                                        />
                                    </FormControl>
                                    {/* <FormDescription>
                                        This is the name that will be displayed to other users.
                                    </FormDescription> */}
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
                            Invite
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}