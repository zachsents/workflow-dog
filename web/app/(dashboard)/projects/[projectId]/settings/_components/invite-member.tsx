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
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@ui/form"
import { Input } from "@ui/input"
import Loader from "@web/components/loader"
import { useDialogState } from "@web/lib/client/hooks"
import { trpc } from "@web/lib/client/trpc"
import { Schemas } from "@web/lib/iso/schemas"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { TbStar, TbUserPlus } from "react-icons/tb"
import { toast } from "sonner"
import { z } from "zod"


interface InviteMemberProps {
    projectId: string
}

export default function InviteMember({ projectId }: InviteMemberProps) {

    const {
        data: members,
        isLoading: membersLoading,
    } = trpc.projects.listMembers.useQuery({ projectId })

    const {
        data: billing,
        isLoading: billingLoading,
    } = trpc.projects.billingInfo.useQuery({ id: projectId })

    if (membersLoading || billingLoading)
        return null

    const hasReachedLimit = (members?.length ?? 0) >= (billing?.limits.teamMembers ?? 0)
    if (hasReachedLimit)
        return (
            <Button asChild>
                <Link
                    href={`/projects/${projectId}/usage`}
                    className="flex center gap-2"
                >
                    <TbStar />
                    Upgrade to invite more members
                </Link>
            </Button>
        )

    return <InviteMemberButton projectId={projectId} />
}


type FormSchema = z.infer<typeof Schemas.Projects.InviteMember>


function InviteMemberButton({ projectId }: InviteMemberProps) {

    const dialog = useDialogState()

    const form = useForm<FormSchema>({
        resolver: zodResolver(Schemas.Projects.InviteMember),
        defaultValues: { email: "" },
    })

    const {
        mutate: inviteMember,
        isPending: isSubmitting,
    } = trpc.projects.inviteMember.useMutation({
        onSuccess: () => {
            toast.success("Invitation sent!")
            dialog.close()
            form.reset()
        },
        onError: (err) => {
            console.debug(err)
            form.setError("email", {
                message: err.data?.message || "Error",
            })
        },
    })

    function onSubmit(values: FormSchema) {
        inviteMember({
            projectId,
            email: values.email,
        })
    }

    return (
        <Dialog {...dialog.dialogProps}>
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
                        If they don't have an account, they will have to make one first.
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
                                    <FormMessage />
                                </FormItem>
                            )}
                            disabled={isSubmitting}
                        />

                        <Button
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting
                                ? <>
                                    <Loader mr />
                                    Inviting...
                                </>
                                : "Invite"}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}