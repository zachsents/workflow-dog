import { zodResolver } from "@hookform/resolvers/zod"
import { IconDots, IconEye, IconPencil, IconUserMinus, IconUserPlus } from "@tabler/icons-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@ui/table"
import ConfirmDialog from "@web/components/confirm-dialog"
import { ProjectDashboardLayout } from "@web/components/layouts/project-dashboard-layout"
import SpinningLoader from "@web/components/spinning-loader"
import TI from "@web/components/tabler-icon"
import { Avatar, AvatarFallback, AvatarImage } from "@web/components/ui/avatar"
import { Button } from "@web/components/ui/button"
import { Card } from "@web/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@web/components/ui/dropdown-menu"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@web/components/ui/form"
import { Input } from "@web/components/ui/input"
import dayjs from "@web/lib/dayjs"
import { useCurrentProject, useCurrentProjectId, useDialogState } from "@web/lib/hooks"
import { trpc } from "@web/lib/trpc"
import type { ApiRouterInput, ApiRouterOutput } from "api/trpc/router"
import { useForm } from "react-hook-form"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { z } from "zod"



export default function ProjectTeam() {

    const projectId = useCurrentProjectId()
    const project = useCurrentProject().data
    const canIEdit = project?.your_permissions.includes("write")

    const utils = trpc.useUtils()

    const { data: members, isPending } = trpc.projects.team.list.useQuery({ projectId })
    const {
        data: canInviteMembers,
        isPending: isPendingCanInviteMembers,
    } = trpc.projects.team.canInviteMembers.useQuery({ projectId })
    const invitations = trpc.projects.team.listInvitations.useQuery({ projectId })

    const cancelInvitationMutation = trpc.projects.team.cancelInvitation.useMutation()
    const cancelInvitation = (invitationId: string) => void toast.promise(cancelInvitationMutation.mutateAsync({
        projectId,
        invitationId,
    }).then(async () => {
        await utils.projects.team.listInvitations.invalidate({ projectId })
    }), {
        loading: "Cancelling...",
        success: "Invitation cancelled!",
    })

    const editors = members?.filter(m => m.isEditor && !m.isYou) ?? []
    const viewers = members?.filter(m => !m.isEditor && !m.isYou) ?? []

    const inviteMemberDialog = useDialogState()

    return (
        <ProjectDashboardLayout currentSegment="Team">
            <div className="flex flex-col items-stretch gap-8">
                <div className="col-span-full flex items-center justify-between">
                    <h1 className="text-2xl font-medium">Team</h1>
                    {(isPendingCanInviteMembers || !canIEdit) ? null :
                        canInviteMembers
                            ? <Button className="gap-2" onClick={inviteMemberDialog.open}>
                                <TI><IconUserPlus /></TI>
                                Invite someone to your project
                            </Button>
                            : <Button className="gap-2" asChild>
                                <Link to="../usage-billing">
                                    <TI><IconUserPlus /></TI>
                                    Upgrade to add more team members
                                </Link>
                            </Button>}
                </div>

                {isPending
                    ? <SpinningLoader className="mx-auto my-10" />
                    : members
                        ? <div className="grid grid-cols-3 gap-4">
                            <h2 className="text-lg col-span-full">You</h2>
                            <MemberCard member={members.find(m => m.isYou)!} />

                            {editors.length > 0 && <>
                                <h2 className="text-lg col-span-full mt-4">Editors</h2>
                                {editors.map(member =>
                                    <MemberCard
                                        key={member.id}
                                        member={member}
                                    />
                                )}
                            </>}
                            {viewers.length > 0 && <>
                                <h2 className="text-lg col-span-full mt-4">Viewers</h2>
                                {viewers.map(member =>
                                    <MemberCard
                                        key={member.id}
                                        member={member}
                                    />
                                )}
                            </>}
                        </div>
                        : <p className="text-center py-8 text-sm text-muted-foreground">
                            There was a problem loading your project members.
                        </p>}

                {!!invitations.data && invitations.data.length > 0 &&
                    <div className="grid gap-4">
                        <h2 className="text-lg">Invitations</h2>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Email</TableHead>
                                    <TableHead></TableHead>
                                    {canIEdit && <TableHead className="text-center">Actions</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invitations.data.map(inv => (
                                    <TableRow key={inv.id}>
                                        <TableCell className="font-medium">{inv.invitee_email}</TableCell>
                                        <TableCell className="text-muted-foreground">
                                            Invited {dayjs(inv.created_at).fromNow()}
                                        </TableCell>
                                        {canIEdit && <TableCell className="flex-center">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="text-md">
                                                        <TI><IconDots /></TI>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent side="bottom" align="end" className="*:flex *:items-center *:gap-2 w-[240px]">
                                                    <DropdownMenuItem
                                                        className="text-red-600"
                                                        onSelect={() => cancelInvitation(inv.id)}
                                                    >
                                                        <TI><IconUserMinus /></TI>
                                                        Cancel invitation
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>}
            </div>
            <InviteMemberDialog  {...inviteMemberDialog.dialogProps} />
        </ProjectDashboardLayout>
    )
}


function MemberCard({ member }: { member: ApiRouterOutput["projects"]["team"]["list"][number] }) {
    const projectId = useCurrentProjectId()
    const project = useCurrentProject().data
    const canIEdit = project?.your_permissions.includes("write")

    const hasFirstAndLastName = member.first_name && member.last_name
    const fallback = hasFirstAndLastName
        ? (member.first_name![0] + member.last_name![0]).toUpperCase()
        : (member.name ?? member.email ?? "?")[0].toUpperCase()

    const removeDialog = useDialogState()

    const utils = trpc.useUtils()

    const removeMemberMutation = trpc.projects.team.remove.useMutation({
        onSuccess: () => {
            utils.projects.team.list.invalidate({ projectId })
            toast.success("Member removed!")
        },
    })

    const setRoleMutation = trpc.projects.team.setRole.useMutation()
    const setRole = (role: ApiRouterInput["projects"]["team"]["setRole"]["role"]) => void toast.promise(setRoleMutation.mutateAsync({
        projectId,
        userId: member.id,
        role,
    }).then(async () => {
        await utils.projects.team.list.invalidate({ projectId })
    }), {
        loading: "Changing...",
        success: "Role changed!",
    })

    return (
        <Card className="flex items-center gap-4 no-shrink-children p-4">
            <Avatar className="w-16 aspect-square h-auto">
                <AvatarImage src={member.picture ?? undefined} />
                <AvatarFallback>{fallback}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
                <p>
                    {hasFirstAndLastName ? `${member.first_name} ${member.last_name}` : member.name}
                    {member.isYou && <span>{" "}(You)</span>}
                </p>
                <p className="text-muted-foreground text-sm">{member.email}</p>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    {member.isEditor ? <>
                        <TI><IconPencil /></TI>
                        <span>Editor</span>
                    </> : <>
                        <TI><IconEye /></TI>
                        <span>Viewer</span>
                    </>}
                </div>
            </div>

            {!member.isYou && canIEdit && <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-xl">
                        <TI><IconDots /></TI>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="bottom" align="end" className="*:flex *:items-center *:gap-2 w-[240px]">
                    {member.isEditor
                        ? <DropdownMenuItem onSelect={() => setRole("viewer")}>
                            <TI><IconEye /></TI>
                            Make Viewer
                        </DropdownMenuItem>
                        : <DropdownMenuItem onSelect={() => setRole("editor")}>
                            <TI><IconPencil /></TI>
                            Make Editor
                        </DropdownMenuItem>}

                    <DropdownMenuItem className="text-red-600" onSelect={removeDialog.open}>
                        <TI><IconUserMinus /></TI>
                        Remove from project
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>}

            <ConfirmDialog
                {...removeDialog.dialogProps}
                description="This will remove the user from this project. They will have to be invited back to join again."
                confirmText="Remove" confirmingText="Removing..."
                onConfirm={() => void removeMemberMutation.mutate({ projectId, userId: member.id })}
                destructive
                isPending={removeMemberMutation.isPending}
            />
        </Card>
    )
}


const inviteMemberSchema = z.object({
    email: z.string().email(),
    _error: z.any().optional(),
})

function InviteMemberDialog(props: React.ComponentProps<typeof Dialog>) {

    const projectId = useCurrentProjectId()

    const form = useForm<z.infer<typeof inviteMemberSchema>>({
        resolver: zodResolver(inviteMemberSchema),
        defaultValues: { email: "" },
    })

    const utils = trpc.useUtils()

    const {
        mutateAsync: inviteMember,
        isPending: isSubmitting,
    } = trpc.projects.team.invite.useMutation({
        onSuccess: () => {
            utils.projects.team.listInvitations.invalidate({ projectId })
            toast.success("Invitation sent!")
            props.onOpenChange?.(false)
            form.reset()
        },
        onError: (err: any) => {
            form.setError("_error", {
                message: err.data?.message || err.message || "Error",
            })
        },
    })

    return (
        <Dialog {...props}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Invite someone to this project</DialogTitle>
                    <DialogDescription>
                        If they don't have an account, they will have to make one first.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(values => inviteMember({ projectId, email: values.email }))}
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

                        <FormField
                            control={form.control}
                            name="_error"
                            render={({ field }) => (
                                <FormItem className="space-y-0">
                                    <FormControl>
                                        <Input type="hidden" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" disabled={isSubmitting} className="gap-2">
                            {isSubmitting
                                ? <>
                                    <SpinningLoader />
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