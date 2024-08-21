import { zodResolver } from "@hookform/resolvers/zod"
import { IconBrandXFilled, IconCopy, IconDots, IconExternalLink, IconMail, IconPencil, IconRouteSquare2, IconTrash, IconUsers } from "@tabler/icons-react"
import { ProjectDashboardLayout } from "@web/components/layouts/project-dashboard-layout"
import SimpleTooltip from "@web/components/simple-tooltip"
import SpinningLoader from "@web/components/spinning-loader"
import TI from "@web/components/tabler-icon"
import { Badge } from "@web/components/ui/badge"
import { Button } from "@web/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@web/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@web/components/ui/dropdown-menu"
import { Form, FormControl, FormDescription, FormField, FormItem, FormMessage } from "@web/components/ui/form"
import { Input } from "@web/components/ui/input"
import { Label } from "@web/components/ui/label"
import { Separator } from "@web/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@web/components/ui/tooltip"
import { plural } from "@web/lib/grammar"
import { useCurrentProject, useCurrentProjectId, useDialogState } from "@web/lib/hooks"
import { getPlanData } from "@web/lib/plans"
import { trpc } from "@web/lib/trpc"
import { cn } from "@web/lib/utils"
import { PROJECT_NAME_SCHEMA } from "core/schemas"
import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { z } from "zod"
import GetStartedWithWorkflows from "./components/get-started-with-workflows"


export default function ProjectIndex({ deleting }: { deleting?: boolean }) {

    const projectId = useCurrentProjectId()
    const project = useCurrentProject().data!
    const planData = getPlanData(project.billing_plan)
    const { data: overview } = trpc.projects.overview.useQuery({
        projectId,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    })

    const hasNoWorkflows = overview?.workflowCount === 0

    const renameDialog = useDialogState()

    return (
        <ProjectDashboardLayout currentSegment="Overview">
            <div className="grid grid-cols-6 gap-8 pb-24">
                <div className="col-span-full flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-4">
                            <h1 className="text-2xl font-medium">
                                {project.name}
                            </h1>
                            <Badge className={cn("pointer-events-none shadow-none", planData.badgeClassName)}>
                                {planData.name}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-6 text-muted-foreground hover:*:underline">
                            <TooltipProvider delayDuration={0}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Link to="workflows">
                                            {overview?.workflowCount ?? "..."} {plural("workflow", overview?.workflowCount ?? 0)}
                                        </Link>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom">Go to Workflows</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Link to="team">
                                            {overview?.memberCount ?? "..."} {plural("member", overview?.memberCount ?? 0)}
                                        </Link>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom">Manage Team</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-2xl"><TI><IconDots /></TI></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="bottom" align="end" className="*:flex *:items-center *:gap-2 w-[240px]">
                            <DropdownMenuItem onSelect={renameDialog.open}>
                                <TI><IconPencil /></TI>
                                Rename Project
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild className="text-red-600">
                                <Link to="delete" replace preventScrollReset>
                                    <TI><IconTrash /></TI>
                                    Delete Project
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <GetStartedWithWorkflows
                    hasNoWorkflows={hasNoWorkflows}
                    className="col-span-full"
                />

                <div className="col-span-3 bg-gray-100 border rounded-xl p-8 flex flex-col gap-2">
                    <h3 className="font-medium text-xl">
                        Recent Workflow Runs
                    </h3>
                    <p className="text-muted-foreground">
                        These are the workflow runs from the last 7 days.
                    </p>
                    {!!overview?.recentRunResults &&
                        <RecentActivityChart data={overview.recentRunResults} height={200} />}
                    <Button asChild variant="outline" className="self-start flex-center gap-2 mt-4">
                        <Link to="workflows">
                            <TI><IconRouteSquare2 /></TI>
                            View Workflows
                        </Link>
                    </Button>
                </div>

                <div className="col-span-3 bg-gray-100 border rounded-xl p-8 flex-col gap-4">
                    <div className="grid gap-2">
                        <h3 className="font-medium text-xl">
                            Invite people to your project
                        </h3>
                        <p className="text-muted-foreground">
                            Add team members to your project to collaborate on workflows and automate tasks together.
                        </p>
                    </div>
                    <div className="flex items-stretch h-16">
                        {overview?.memberPictures.map((pic, i) =>
                            <img
                                key={i} src={pic ?? undefined}
                                className="aspect-square shrink-0 rounded-full border-4 border-white shadow-sm -ml-4 first:ml-0"
                            />
                        )}
                    </div>
                    <Button asChild variant="outline" className="self-start flex-center gap-2 mt-2">
                        <Link to="team">
                            <TI><IconUsers /></TI>
                            Manage Team
                        </Link>
                    </Button>
                </div>

                <div className="col-span-full border rounded-xl p-8 flex items-center gap-8">
                    <img src="/logo.svg" className="row-span-full h-20 px-4" />

                    <div className="flex-1 min-w-0 grid gap-2">
                        <h4 className="text-lg font-medium">Thanks for checking out WorkflowDog!</h4>
                        <p>
                            It's my goal to create a seriously smooth automation experience, but sometimes things break. If you have issues, please let me know.
                        </p>
                        <div className="grid grid-flow-col auto-cols-fr gap-4 mt-4">
                            <SimpleTooltip tooltip="Copy Email Address" contentProps={{ side: "right" }}>
                                <Button
                                    variant="secondary" className="gap-2 text-primary"
                                    onClick={() => {
                                        navigator.clipboard.writeText("info@workflow.dog")
                                        toast.success("Copied to clipboard!")
                                    }}
                                >
                                    <TI><IconMail /></TI>
                                    info@workflow.dog
                                    <TI className="text-muted-foreground ml-4"><IconCopy /></TI>
                                </Button>
                            </SimpleTooltip>
                            <Button variant="secondary" className="gap-2" asChild>
                                <a href="https://x.com/ZachSents" target="_blank">
                                    <TI><IconBrandXFilled /></TI>
                                    @ZachSents
                                    <TI className="text-muted-foreground ml-4"><IconExternalLink /></TI>
                                </a>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            <DeleteProjectDialog open={deleting} />
            <RenameProjectDialog {...renameDialog.dialogProps} />
        </ProjectDashboardLayout>
    )
}


function DeleteProjectDialog(props: React.ComponentProps<typeof Dialog>) {

    const utils = trpc.useUtils()
    const navigate = useNavigate()
    const projectId = useCurrentProjectId()
    const project = useCurrentProject().data!

    const cancelDelete = () => {
        navigate(`/projects/${projectId}`, {
            replace: true,
            preventScrollReset: true,
        })
    }

    const [inputValue, setInputValue] = useState("")
    const isCorrect = inputValue.toLowerCase().trim() === project.name.toLowerCase().trim()

    const deleteProject = trpc.projects.delete.useMutation({
        onSuccess: () => {
            toast.success("Project deleted!")
            navigate("/projects", { replace: true })
            utils.projects.list.invalidate()
        },
    })

    return (
        <Dialog
            {...props}
            onOpenChange={isOpen => {
                if (!isOpen) cancelDelete()
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Are you sure?</DialogTitle>
                    <DialogDescription>
                        This will permanently delete your project and all associated workflows, integrations, and other data. This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <form className="grid gap-2" onSubmit={ev => {
                    ev.preventDefault()
                    if (isCorrect)
                        deleteProject.mutate({ projectId })
                }}>
                    <Label htmlFor="delete-project" className="flex items-center gap-2">
                        <span>Type</span>
                        <span className="font-mono bg-gray-100 border rounded-sm px-2 py-1">
                            {project.name}
                        </span>
                        <span>to confirm</span>
                    </Label>
                    <Input
                        id="delete-project"
                        value={inputValue} onChange={e => setInputValue(e.target.value)}
                        placeholder={project.name}
                    />
                    <DialogFooter className="mt-2">
                        <Button variant="ghost" onClick={cancelDelete} type="button">
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            className="gap-2"
                            disabled={!isCorrect || deleteProject.isPending}
                            type="submit"
                        >
                            {deleteProject.isPending
                                ? <>
                                    <SpinningLoader />
                                    Deleting...
                                </>
                                : "Delete Project"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

const renameProjectSchema = z.object({
    projectName: PROJECT_NAME_SCHEMA,
})

function RenameProjectDialog(props: React.ComponentProps<typeof Dialog>) {

    const projectId = useCurrentProjectId()
    const project = useCurrentProject().data
    const utils = trpc.useUtils()

    const form = useForm<z.infer<typeof renameProjectSchema>>({
        resolver: zodResolver(renameProjectSchema),
        values: {
            projectName: project?.name ?? "",
        },
    })

    const onOpenChange = (isOpen: boolean) => {
        if (!isOpen) form.reset()
        props.onOpenChange?.(isOpen)
    }

    const renameProject = trpc.projects.rename.useMutation({
        onSuccess: () => {
            toast.success("Project renamed!")
            utils.projects.list.invalidate()
            utils.projects.byId.invalidate({ projectId })
            onOpenChange(false)
            form.reset()
        },
    })

    return (
        <Dialog {...props} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Rename Project
                    </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form
                        className="grid gap-4"
                        onSubmit={form.handleSubmit(values => renameProject.mutateAsync({
                            projectId,
                            name: values.projectName,
                        }))}
                    >
                        <FormField
                            name="projectName"
                            control={form.control}
                            render={({ field }) =>
                                <FormItem>
                                    <FormDescription>
                                        Write a new name for your project.
                                    </FormDescription>
                                    <FormControl>
                                        <Input
                                            type="text"
                                            placeholder={project?.name}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            }
                        />

                        <DialogFooter className="mt-2">
                            <Button
                                variant="ghost"
                                type="button"
                                onClick={() => onOpenChange(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="gap-2"
                                disabled={renameProject.isPending}
                                type="submit"
                            >
                                {renameProject.isPending
                                    ? <>
                                        <SpinningLoader />
                                        Renaming...
                                    </>
                                    : "Rename Project"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}


function RecentActivityChart({ data, height = 300 }: {
    data: {
        date: Date
        success: number
        error: number
    }[]
    height?: number
}) {
    const scale = height / data.reduce((acc, d) => {
        const total = d.success + d.error
        return total > acc ? total : acc
    }, 0)

    return (
        <div className="grid gap-1 auto-rows-auto" style={{
            gridTemplateColumns: `repeat(${data.length}, 1fr)`,
        }}>
            {data.map(d =>
                <SimpleTooltip key={"bar-" + d.date.toString()} tooltip={<>
                    <p className="font-bold">{d.date.toLocaleDateString()}</p>
                    <p className="text-red-300">{d.error} {plural("run", d.error)} with error(s)</p>
                    <p className="text-green-300">{d.success} successful {plural("run", d.success)}</p>
                </>}>
                    <div
                        className="flex flex-col items-stretch justify-end gap-1 *:shrink-0 *:grow-0 *:rounded-sm rounded-sm hover:bg-gray-500/10"
                    >
                        {d.error > 0 &&
                            <div className="bg-red-500" style={{ height: d.error * scale }} />}
                        {d.success > 0 &&
                            <div className="bg-green-500" style={{ height: d.success * scale }} />}
                    </div>
                </SimpleTooltip>
            )}
            <Separator className="col-span-full" />
            {data.map(d =>
                <p
                    key={"label-" + d.date.toString()}
                    className="text-xs text-muted-foreground text-center place-self-center"
                >
                    {d.date.toLocaleDateString()}
                </p>
            )}
        </div>
    )
}